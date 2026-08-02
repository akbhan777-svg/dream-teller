import { NextResponse } from "next/server";
// Next.js 15+ 에서는 after를 통해 백그라운드 작업 수행 (Vercel Edge 타임아웃/연결끊김 방지)
import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendTelegramMessage } from "@/lib/telegram";
import { validateAndSanitizeDreamPrompt } from "@/lib/security-filter";

export const runtime = "edge"; // Vercel Edge Function으로 오프로딩하여 서버리스 타임아웃 원천 방어
export const maxDuration = 60; // Edge 환경에서의 최대 허용 대기 시간(60초) 명시적 설정

export async function POST(request: Request) {
  let incomingOrderId: string | undefined;
  let orderId: string | undefined; // DB 상의 진짜 UUID를 할당할 변수
  let supabaseAdmin: any;
  
  try {
    const body = await request.json();
    incomingOrderId = body.orderId;
    const isRegeneration = body.isRegeneration || false;

    if (!incomingOrderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Server-side Admin Supabase Client (For bypassing RLS in background)
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. 주문 정보 획득 (클라이언트에서 넘어오는 order_number 와 서버에서 넘어오는 UUID 모두 대응)
    const isUuid = incomingOrderId.includes("-") && incomingOrderId.length === 36;
    let query = supabaseAdmin.from("orders").select("*");
    
    if (isUuid) {
      query = query.eq("id", incomingOrderId);
    } else {
      query = query.eq("order_number", incomingOrderId);
    }
    
    const { data: order, error: orderError } = await query.maybeSingle();

    if (orderError || !order) {
      throw new Error(`주문 정보를 찾을 수 없습니다. (ID: ${incomingOrderId}) / Error: ${orderError?.message || "None"}`);
    }

    // 이후 쿼리에서는 무조건 UUID인 order.id를 사용
    orderId = order.id;

    // 1-0. 이미 생성 완료된 주문인지 확인 (중복 생성 방지 멱등성 처리)
    const { data: existingDone } = await supabaseAdmin
      .from("dream_results")
      .select("id, analysis_status")
      .eq("order_id", orderId)
      .maybeSingle();

    if (!isRegeneration && existingDone && (existingDone.analysis_status === "completed" || existingDone.analysis_status === "processing")) {
      return NextResponse.json({ success: true, message: "Already processing or completed" });
    }

    // 중복 실행 방지(Race condition lock)를 위해 백그라운드 파이프라인 시작 전 'processing'으로 선점
    if (existingDone) {
      await supabaseAdmin.from("dream_results").update({ analysis_status: "processing" }).eq("id", existingDone.id);
    } else {
      await supabaseAdmin.from("dream_results").insert({ order_id: orderId, analysis_status: "processing", is_public: false });
    }

    // 1-1. 서버사이드 보안 및 유해 프롬프트 인젝션 검증 (정보통신망법 준수)
    const securityCheck = validateAndSanitizeDreamPrompt(order.dream_content || "");
    if (!securityCheck.isValid) {
      console.warn(`[Security Alert] Order ${order.order_number} blocked due to prompt injection: ${securityCheck.error}`);
      throw new Error(`[보안 거부] ${securityCheck.error}`);
    }

    // ============================================================================
    // 핵심 수정 사항: 모바일 브라우저 백그라운드 전환 등 클라이언트 연결 끊김(Abort) 시
    // Vercel Edge 런타임이 프로세스를 강제 킬(Kill)하지 않도록 Next.js 'after'를 사용.
    // 무조건 즉시 200 OK를 클라이언트에게 반환하고, 실제 AI 파이프라인은 백그라운드에서 동작!
    // ============================================================================
    
    after(async () => {
      try {
        // 텔레그램 시작 알림
        await sendTelegramMessage(`🔄 <b>[해몽 분석 시작]</b> 주문: <code>${order.order_number}</code>\nAI 파이프라인 가동...`);

        // 2. 구글 제미나이를 통한 텍스트 해몽 생성 (동적 모델 검색 파이프라인)
        const apiKey = process.env.GOOGLE_API_KEY!;
        const genAI = new GoogleGenerativeAI(apiKey);

        let availableModels: string[] = [];
        try {
          const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          if (listResp.ok) {
            const listData = await listResp.json();
            if (listData.models && Array.isArray(listData.models)) {
              availableModels = listData.models
                .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
                .map((m: any) => m.name.replace("models/", ""));
            }
          }
        } catch (e) {
          console.warn("Failed to fetch dynamic model list:", e);
        }

        const candidateModels = Array.from(new Set([
          ...availableModels,
          "gemini-1.5-flash",
          "gemini-1.5-pro",
          "gemini-2.0-flash-exp",
          "gemini-pro"
        ]));

        const systemInstruction = `
          당신은 세계 최고의 꿈 해몽 전문가이자 심층 심리학자입니다. 분석 모드: ${order.expert_field || "freud"}.
          다음 꿈 내용을 매우 심층적이고 학술적이면서도 내담자가 이해하기 쉽게 분석하여 마크다운 포맷으로 작성해주세요.
          기존보다 2배 이상 길고 상세하게 작성해야 하며, 풍부한 은유와 전문 용어를 사용하여 세련된 형태의 보고서를 완성해야 합니다.

          [보고서 필수 구조]
          1. 서론 (꿈의 요약 및 전체적인 분위기 분석)
          2. 본론 (심리적/상징적 심층 분석 - 최소 3개 이상의 핵심 상징을 디테일하게 해독)
          3. 유사 사례 분석 (역사적, 임상적 혹은 보편적 무의식 패턴에서 발견되는 유사한 꿈 사례와 그 의미)
          4. 결론 (현재 심리 상태에 대한 통찰 및 실생활에 적용할 수 있는 구체적인 조언)
          
          [이미지 생성 프롬프트 특별 요구사항 - 수익 직결 요소]
          이 서비스는 유료 서비스이므로, 생성되는 그림이 고객에게 혐오감을 주면 안 되며 '아름답고 소장하고 싶은' 퀄리티여야 합니다.
          생성형 AI(Flux 등)는 돼지, 개, 사람 등 생명체의 이목구비나 신체를 그릴 때 기괴한 괴물처럼 왜곡되는 치명적인 단점이 있습니다.
          따라서, 이미지 프롬프트에는 **절대로 동물, 사람, 생명체를 직접적으로 묘사하지 마세요.**
          대신 꿈의 핵심 '감정'과 '상징'을 추출하여 **초현실적이고 신비로운 자연 풍경(Landscape)이나 빛나는 마법적 사물(Magical Object)**로 은유하여 프롬프트를 작성해야 합니다.

<<<<<<< HEAD
          예시) "황금 돼지가 쏟아지는 꿈" -> "A breathtaking magical forest glowing 정답 with radiant golden light and sparkling golden leaves falling like rain, ethereal, beautiful scenery, masterpiece, 8k resolution, ultra detailed, photorealistic, luxury aesthetic, cinematic lighting, raytracing, 8k uhd, perfect composition, no animals, no humans"
=======
          예시) "황금 돼지가 쏟아지는 꿈" -> "A breathtaking magical forest glowing with radiant golden light and sparkling golden leaves falling like rain, ethereal, beautiful scenery, masterpiece, 8k resolution, ultra detailed, photorealistic, luxury aesthetic, cinematic lighting, raytracing, 8k uhd, perfect composition, no animals, no humans"
>>>>>>> 6a2622e (fix: resolve mobile caching and polling issue)
          예시) "뱀에게 물리는 꿈" -> "A mystical dark enchanted forest with glowing emerald lights and a single radiant green gemstone on a pedestal, cinematic lighting, magical atmosphere, masterpiece, 8k resolution, luxury aesthetic, no animals, no humans"

          보고서 맨 마지막 줄에는 위 규칙을 적용한 영문 프롬프트를 아래 형식으로 정확히 한줄 추가해 주세요:
          IMAGE_PROMPT: A breathtaking [metaphorical landscape or magical object representing the dream], masterpiece, 8k resolution, ultra detailed, photorealistic, luxury aesthetic, cinematic lighting, raytracing, 8k uhd, perfect composition, no animals, no humans, no faces, no trademarked logos, no copyrighted IP characters

          [매우 중요한 지시사항 - 엄격 준수]
          1. 내부 사고 과정(Draft, Self-Correction, Analysis Mode 등)이나 영어로 된 지시문/구조 요약을 절대 출력하지 마세요.
          2. 응답의 첫 시작은 무조건 한글로 된 제목 "# [꿈 해몽 보고서] (주제에 맞는 소제목)" 으로 곧바로 시작하세요.
          3. 오직 최종 해몽 결과물(한글)과 마지막 줄의 영문 IMAGE_PROMPT 만 출력해야 합니다.
        `;

        const userPrompt = `[내담자의 꿈 내용]\n${order.dream_content}`;

        let analysisText = "";
        let lastError: any = null;

        for (const modelName of candidateModels) {
          try {
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              systemInstruction: systemInstruction 
            });
            const textResult = await model.generateContent(userPrompt);
            analysisText = textResult.response.text();
            if (analysisText) {
              console.log(`Gemini generation succeeded with model: ${modelName}`);
              break;
            }
          } catch (err: any) {
            console.warn(`Model ${modelName} failed. Error:`, err?.message);
            lastError = err;
          }
        }

        if (!analysisText) {
          throw new Error(`모든 제미나이 모델 생성 시도 실패: ${lastError?.message || "Unknown error"}`);
        }

        let cutIndex = analysisText.lastIndexOf("# [꿈 해몽 보고서]");
        
        if (cutIndex === -1) {
          const matches = [...analysisText.matchAll(/#\s*[가-힣]/g)];
          if (matches.length > 0) {
            cutIndex = matches[matches.length - 1].index;
          }
        }

        if (cutIndex !== -1 && cutIndex !== undefined) {
          analysisText = analysisText.substring(cutIndex);
        }

        let imageUrl = null;

        const isPassOrder = ["pass_use", "pass_charge_5", "pass_charge_10"].includes(order.order_type);
        const shouldGenerateImage = order.includes_image || isPassOrder;

        let englishImagePrompt = "A breathtaking wide-angle surreal dreamscape, scenic nature background fantasy landscape painting, masterpiece, 8k resolution, ultra detailed, photorealistic, luxury aesthetic, cinematic lighting, 8k uhd, raytracing, no faces";
        
        const promptMatch = analysisText.match(/IMAGE_PROMPT:\s*(.+)/i);
        if (promptMatch && promptMatch[1]) {
          englishImagePrompt = promptMatch[1].trim();
          analysisText = analysisText.replace(/IMAGE_PROMPT:\s*.+/i, "").trim();
        }

        if (shouldGenerateImage) {
          try {
            const cleanPrompt = englishImagePrompt.replace(/[^a-zA-Z0-9\s,.-]/g, "").trim();
            // 프롬프트를 적절히 잘라서 인코딩 (Pollinations URL 길이 제한 방지)
            const qualityEnhancedPrompt = `${cleanPrompt.substring(0, 300)}, masterpiece, 8k resolution, ultra detailed, photorealistic, luxury aesthetic, cinematic lighting, raytracing, perfect composition`;
            const encodedPrompt = encodeURIComponent(qualityEnhancedPrompt);
            const seed = Math.floor(Math.random() * 1000000);
            
            // 해상도를 높게 유지하여 클라이언트 캔버스 변환 시 1000KB 이상을 달성할 수 있도록 설정
            imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1440&height=1440&seed=${seed}&nologo=true&enhance=true&model=flux-realism`;
          } catch (imgPipelineErr) {
            console.error("Image generation pipeline error:", imgPipelineErr);
          }
        }

        // 5. 생성된 결과물 DB (dream_results) 안심 저장
        const { data: existingResult } = await supabaseAdmin
          .from("dream_results")
          .select("id")
          .eq("order_id", order.id)
          .maybeSingle();

        if (existingResult) {
          const { error: updateError } = await supabaseAdmin
            .from("dream_results")
            .update({
              analysis_text: analysisText,
              image_url: imageUrl,
              analysis_status: "completed",
              updated_at: new Date().toISOString()
            })
            .eq("id", existingResult.id);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabaseAdmin
            .from("dream_results")
            .insert({
              order_id: order.id,
              analysis_text: analysisText,
              image_url: imageUrl,
              analysis_status: "completed",
              is_public: false
            });

          if (insertError) throw insertError;
        }

        // 6. 성공 알림
        await sendTelegramMessage(
          `✨ <b>[해몽 완성]</b>\n\n` +
          `<b>주문번호:</b> <code>${order.order_number}</code>\n` +
          `<b>상태:</b> 성공적으로 DB 반영 완료!\n` +
          `<b>발급된 혜택:</b> ${imageUrl ? "텍스트 해몽 + 🖼️ 이미지" : "텍스트 해몽"}`
        );

      } catch (error: any) {
        console.error("AI Generate API Error (Background):", error);
        
        try {
          if (orderId) {
            const { data: existingRes } = await supabaseAdmin
              .from("dream_results")
              .select("id")
              .eq("order_id", orderId)
              .maybeSingle();

            if (existingRes) {
              await supabaseAdmin
                .from("dream_results")
                .update({ analysis_status: "failed", updated_at: new Date().toISOString() })
                .eq("id", existingRes.id);
            } else {
              await supabaseAdmin
                .from("dream_results")
                .insert({ order_id: orderId, analysis_status: "failed", is_public: false });
            }

            const { data: targetOrder } = await supabaseAdmin
              .from("orders")
              .select("user_id, order_type")
              .eq("id", orderId)
              .maybeSingle();

            if (targetOrder && targetOrder.order_type === "pass_use" && targetOrder.user_id) {
              const { data: userRec } = await supabaseAdmin
                .from("users")
                .select("remaining_interprets")
                .eq("id", targetOrder.user_id)
                .single();

              const currentRem = userRec?.remaining_interprets || 0;

              await supabaseAdmin
                .from("users")
                .update({ remaining_interprets: currentRem + 1 })
                .eq("id", targetOrder.user_id);

              await supabaseAdmin
                .from("pass_transactions")
                .insert({
                  user_id: targetOrder.user_id,
                  order_id: orderId,
                  transaction_type: "charge",
                  amount: 1
                });
            }
          }

          await sendTelegramMessage(
            `🚨 <b>[해몽 AI 파이프라인 에러]</b>\n\n` +
            `<b>주문 ID:</b> <code>${incomingOrderId || orderId || "Unknown"}</code>\n` +
            `<b>내용:</b> ${error.message}\n` +
            `<b>조치:</b> 이용권 사용건일 경우 1회 자동 환불 및 <code>failed</code> 상태 처리 완료`
          );
        } catch (e) {
          console.error("Failed to process AI error handling:", e);
        }
      }
    }); // after 블록 종료

    // 클라이언트에게 즉시 200 OK 응답을 보내어 연결을 종료함! 
    // Edge Runtime은 after() 덕분에 응답 이후에도 최대 60초간 백그라운드 작업을 완수함.
    return NextResponse.json({ success: true, message: "AI pipeline started in background" });

  } catch (error: any) {
    console.error("AI Generate API Sync Error:", error);
    
    // API 진입 초기의 쿼리 에러 등에 대해서만 텔레그램 전송
    try {
      await sendTelegramMessage(
        `🚨 <b>[해몽 AI 진입 에러]</b>\n\n` +
        `<b>내용:</b> ${error.message}`
      );
    } catch(e) {}
    
    return NextResponse.json({ error: "AI Generation entry failed", details: error.message }, { status: 500 });
  }
}
