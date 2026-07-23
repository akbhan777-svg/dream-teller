import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Server-side Admin Supabase Client (For bypassing RLS in background)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. 주문 정보 획득 (안정성을 위해 join 없이 단독 쿼리)
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      throw new Error(`주문 정보를 찾을 수 없습니다. (ID: ${orderId}) / Error: ${orderError?.message || "None"}`);
    }

    // 텔레그램 시작 알림
    await sendTelegramMessage(`🔄 <b>[해몽 분석 시작]</b> 주문: <code>${order.order_number}</code>\nAI 파이프라인 가동...`);

    // 2. 구글 제미나이를 통한 텍스트 해몽 생성 (동적 모델 검색 파이프라인)
    const apiKey = process.env.GOOGLE_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);

    // 2-1. 사용자의 API 키로 현재 구글 서버에서 사용 가능한 실제 모델 목록 동적 조회
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

    // 동적 모델을 못 가져왔을 경우 대비 대안 목록
    const candidateModels = Array.from(new Set([
      ...availableModels,
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp",
      "gemini-pro"
    ]));

    const prompt = `
      당신은 세계 최고의 꿈 해몽 전문가이자 심층 심리학자입니다. 분석 모드: ${order.expert_field || "freud"}.
      다음 꿈 내용을 매우 심층적이고 학술적이면서도 내담자가 이해하기 쉽게 분석하여 마크다운 포맷으로 작성해주세요.
      기존보다 2배 이상 길고 상세하게 작성해야 하며, 풍부한 은유와 전문 용어를 사용하여 세련된 형태의 보고서를 완성해야 합니다.

      [보고서 필수 구조]
      1. 서론 (꿈의 요약 및 전체적인 분위기 분석)
      2. 본론 (심리적/상징적 심층 분석 - 최소 3개 이상의 핵심 상징을 디테일하게 해독)
      3. 유사 사례 분석 (역사적, 임상적 혹은 보편적 무의식 패턴에서 발견되는 유사한 꿈 사례와 그 의미)
      4. 결론 (현재 심리 상태에 대한 통찰 및 실생활에 적용할 수 있는 구체적인 조언)
      
      [꿈 내용]
      ${order.dream_content}

      [이미지 생성 프롬프트 특별 요구사항 - 수익 직결 요소]
      이 서비스는 유료 서비스이므로, 생성되는 그림이 고객에게 혐오감을 주면 안 되며 '아름답고 소장하고 싶은' 퀄리티여야 합니다.
      생성형 AI(Flux 등)는 돼지, 개, 사람 등 생명체의 이목구비나 신체를 그릴 때 기괴한 괴물처럼 왜곡되는 치명적인 단점이 있습니다.
      따라서, 이미지 프롬프트에는 **절대로 동물, 사람, 생명체를 직접적으로 묘사하지 마세요.**
      대신 꿈의 핵심 '감정'과 '상징'을 추출하여 **초현실적이고 신비로운 자연 풍경(Landscape)이나 빛나는 마법적 사물(Magical Object)**로 은유하여 프롬프트를 작성해야 합니다.

      예시) "황금 돼지가 쏟아지는 꿈" -> "A breathtaking magical forest glowing with radiant golden light and sparkling golden leaves falling like rain, ethereal, beautiful scenery, Studio Ghibli style, majestic, highly detailed, no animals, no humans"
      예시) "뱀에게 물리는 꿈" -> "A mystical dark enchanted forest with glowing emerald lights and a single radiant green gemstone on a pedestal, cinematic lighting, magical atmosphere, no animals, no humans"

      보고서 맨 마지막 줄에는 위 규칙을 적용한 영문 프롬프트를 아래 형식으로 정확히 한 줄 추가해 주세요:
      IMAGE_PROMPT: A breathtaking [metaphorical landscape or magical object representing the dream], Studio Ghibli style, aesthetic, wholesome, masterpiece, warm lighting, perfect composition, highly detailed, no animals, no humans, no faces


      [매우 중요한 지시사항 - 엄격 준수]
      1. 내부 사고 과정(Draft, Self-Correction, Analysis Mode 등)이나 영어로 된 지시문/구조 요약을 절대 출력하지 마세요.
      2. 응답의 첫 시작은 무조건 한글로 된 제목 "# [꿈 해몽 보고서] (주제에 맞는 소제목)" 으로 곧바로 시작하세요.
      3. 오직 최종 해몽 결과물(한글)과 마지막 줄의 영문 IMAGE_PROMPT 만 출력해야 합니다.
    `;

    let analysisText = "";
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        // SDK 버전에 따라 'models/' 접두사 포함 및 미포함 모두 시도
        const model = genAI.getGenerativeModel({ model: modelName });
        const textResult = await model.generateContent(prompt);
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

    // AI의 영문 내부 사고 과정(Chain of Thought)이 혹시라도 출력되었을 경우를 대비하여 완벽하게 필터링
    // AI가 중간 사고과정에서 "# [꿈 해몽 보고서]"를 언급할 수 있으므로, 가장 마지막에 등장하는 실제 시작점을 찾습니다.
    let cutIndex = analysisText.lastIndexOf("# [꿈 해몽 보고서]");
    
    // 만약 정확한 양식이 없다면, 가장 마지막에 등장하는 한글로 된 "# " 헤딩을 찾습니다.
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

    // 3. AI 이미지 생성 파이프라인 (Pollinations AI 무적 단독 엔진 - 순수 영문 프롬프트 변환 사용)
    const isPassOrder = ["pass_use", "pass_charge_5", "pass_charge_10"].includes(order.order_type);
    const shouldGenerateImage = order.includes_image || isPassOrder;

    if (shouldGenerateImage) {
      try {
        let englishImagePrompt = "A breathtaking wide-angle surreal dreamscape, scenic nature background fantasy landscape painting, ethereal, nature, sky, cinematic, no faces";
        
        // Gemini 분석 본문에서 IMAGE_PROMPT 추출
        const promptMatch = analysisText.match(/IMAGE_PROMPT:\s*(.+)/i);
        if (promptMatch && promptMatch[1]) {
          englishImagePrompt = promptMatch[1].trim();
          // 본문 마크다운 보고서에 프롬프트 텍스트가 노출되지 않도록 제거
          analysisText = analysisText.replace(/IMAGE_PROMPT:\s*.+/i, "").trim();
        }

        // 영문, 숫자, 기본 기호만 남겨 Pollinations API 특수문자 및 한글 UTF-8 인코딩 오류 완전 방지
        const cleanPrompt = englishImagePrompt.replace(/[^a-zA-Z0-9\s,.-]/g, "").trim();
        const encodedPrompt = encodeURIComponent(cleanPrompt.substring(0, 300));
        const seed = Math.floor(Math.random() * 1000000);
        
        imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=1280&seed=${seed}&nologo=true&model=flux`.slice(0, 950);
        console.log("Pollinations URL generated seamlessly (Length:", imageUrl.length, "):", imageUrl);
      } catch (imgPipelineErr) {
        console.error("Image generation pipeline error:", imgPipelineErr);
      }
    }

    // 5. 생성된 결과물 DB (dream_results) 안심 저장 (UNIQUE 제약조건 유무와 무관하게 100% 저장)
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

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("AI Generate API Error:", error);
    
    // 에러 발생 시 알림 및 펜딩 상태를 failed 등으로 처리(옵션)
    try {
      await sendTelegramMessage(
        `🚨 <b>[해몽 AI 파이프라인 에러]</b>\n\n` +
        `<b>내용:</b> ${error.message}`
      );
    } catch (e) {}

    return NextResponse.json({ error: "AI Generation failed", details: error.message }, { status: 500 });
  }
}
