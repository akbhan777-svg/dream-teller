import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeText } from "@/lib/utils/sanitize";
import { getIpAndUserAgent } from "@/lib/utils/request-info";
import { sendTelegramMessage } from "@/lib/telegram";
import * as bcrypt from "bcryptjs";

// Supabase 관리자 권한 클라이언트 (백엔드 전용)
const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables");
}

const supabaseAdmin = createClient(supabaseAdminUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const PRICING = {
  single: { price: 2000, name: "1회 해석권 (단건 결제)", includesImage: false },
  pass5: { price: 5950, name: "5회 해석권 (다회권)", includesImage: true }, // 2000 * 5 = 10000 -> 5950 (40.5% 할인, 이미지 포함)
  pass10: { price: 8330, name: "10회 해석권 (다회권)", includesImage: true }, // 2000 * 10 = 20000 -> 8330 (58.3% 할인, 이미지 포함)
  singleImage: { price: 2500, name: "1회 해석권 (이미지 포함)", includesImage: true }, // (이전 사용되던 옵션 유지용)
  use_pass: { price: 0, name: "잔여 횟수 사용", includesImage: true }, // 이용권 차감 
};

// 할인 이벤트 (비회원 1회권)
const DISCOUNT_PRICING = {
  singleImage: {
    price: 1190, // 원래 2500원 -> 1190원 할인
  }
};

export async function POST(request: Request) {
  try {
    const { amount, plan, expertField, includesImage, dreamContent, guestPhone, guestPassword } = await request.json();

    // 토큰 기반 인증 확인
    const authHeader = request.headers.get("Authorization");
    let user = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (data?.user && !error) {
        user = data.user;
      }
    }

    const userId = user ? user.id : null;
    let expectedAmount = 0;
    let orderType = plan || "single";
    let isImageIncluded = !!includesImage;

    // 1. 결제 금액(expectedAmount) 및 옵션 검증
    if (plan === "pass5") {
      expectedAmount = PRICING.pass5.price;
      isImageIncluded = true;
    } else if (plan === "pass10") {
      expectedAmount = PRICING.pass10.price;
      isImageIncluded = true;
    } else if (plan === "use_pass") {
      expectedAmount = 0;
      isImageIncluded = true;
    } else {
      // single 또는 singleImage 인 경우 (비회원 1190원 할인 로직 적용)
      if (!user) { // 비회원인 경우
        expectedAmount = DISCOUNT_PRICING.singleImage.price;
        isImageIncluded = true; // 이벤트로 항상 포함
        orderType = "singleImage"; // 이름도 변경
      } else {
        // 회원의 단건 결제
        if (includesImage) {
          expectedAmount = PRICING.singleImage.price;
          orderType = "singleImage";
          isImageIncluded = true;
        } else {
          expectedAmount = PRICING.single.price;
          orderType = "single";
          isImageIncluded = false;
        }
      }
    }

    // 클라이언트에서 보낸 amount가 expectedAmount와 다를 경우 경고 (하지만 서버에서 강제 보정)
    // 클라이언트에서는 amount를 0으로 보냈는데 서버가 1190원으로 예상하면 문제가 되므로, 
    // Toss 측에 넘길 최종 결제 금액은 expectedAmount를 최우선으로 합니다.
    if (amount !== undefined && Number(amount) !== expectedAmount) {
      console.warn(`[Orders API] Client sent amount (${amount}) mismatch with server expected (${expectedAmount}). Overriding with expectedAmount (${expectedAmount}).`);
    }

    // 주문 번호 생성 (예: DT_timestamp_random)
    const orderNumber = `DT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 2. 다회권 차감 (use_pass) 플로우 분기
    if (plan === "use_pass") {
      if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      // 2-1. 유저의 잔여 횟수 조회
      const { data: userData, error: userError } = await (supabaseAdmin.from("users") as any)
        .select("remaining_interprets")
        .eq("id", user.id)
        .single();

      const userRec = userData as { remaining_interprets?: number } | null;
      const currentPasses = userRec?.remaining_interprets || 0;

      if (userError || !userRec || currentPasses < 1) {
        return NextResponse.json({ success: false, error: "Insufficient passes" }, { status: 403 });
      }

      // 2-2. 주문 생성 (결제 불필요하므로 즉시 paid 처리)
      const { data: order, error: orderError } = await (supabaseAdmin.from("orders") as any)
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: 0,
          order_type: orderType,
          payment_status: "paid",
          expert_field: expertField,
          dream_content: sanitizeText(dreamContent || ""),
          includes_image: true,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2-3. 잔여 횟수 차감 및 트랜잭션 기록
      const { error: deductError } = await (supabaseAdmin.from("users") as any)
        .update({ remaining_interprets: currentPasses - 1 })
        .eq("id", user.id);
        
      if (deductError) throw deductError;

      const { error: txError } = await (supabaseAdmin.from("pass_transactions") as any)
        .insert({
          user_id: user.id,
          order_id: order.id,
          transaction_type: "consume",
          amount: -1
        });

      if (txError) throw txError;

      // 2-4. pending 상태의 dream_results 레코드 생성 (이후 AI가 이 레코드를 업데이트함)
      await (supabaseAdmin.from("dream_results") as any).upsert({
        order_id: order.id,
        analysis_status: "pending",
        is_public: false
      }, { onConflict: "order_id" });

      // 2-5. 텔레그램 알림 발송
      const dreamSnippet = dreamContent
        ? dreamContent.substring(0, 30) + "..."
        : "꿈 내용 없음";
        
      await sendTelegramMessage(
        `🎟️ <b>[이용권 사용]</b>\n\n` +
        `<b>주문번호:</b> <code>${orderNumber}</code>\n` +
        `<b>유저 ID:</b> <code>${user.id}</code>\n` +
        `<b>잔여 횟수:</b> 1회 차감 (남은 횟수: ${currentPasses - 1}회)\n` +
        `<b>꿈 내용:</b> ${dreamSnippet}`
      );

      // 2-6. 비동기 AI 파이프라인 트리거 (Vercel 프로세스 종료 전 대기)
      const protocol = request.headers.get("x-forwarded-proto") || "http";
      const host = request.headers.get("host");
      if (host) {
        const triggerUrl = `${protocol}://${host}/api/ai/generate`;
        const fetchPromise = fetch(triggerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        }).catch((err) => console.error("AI trigger fetch error:", err));

        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000));
        await Promise.race([fetchPromise, timeoutPromise]);
      }

      return NextResponse.json({
        success: true,
        orderId: orderNumber,
        uuid: order.id,
        isPassUsed: true,
      });
    }

    // 3. 일반 결제 플로우 (pending 주문 생성)
    const hashedGuestPassword = (guestPassword && typeof guestPassword === "string" && guestPassword.trim()) 
      ? bcrypt.hashSync(guestPassword.trim(), 10) 
      : null;

    const { data: order, error: orderError } = await (supabaseAdmin.from("orders") as any)
      .insert({
        user_id: userId,
        order_number: orderNumber,
        total_amount: expectedAmount,
        order_type: orderType,
        payment_status: "pending",
        expert_field: expertField,
        dream_content: sanitizeText(dreamContent || ""),
        includes_image: isImageIncluded,
        guest_phone: guestPhone || null,
        guest_password: hashedGuestPassword,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Orders insert DB error:", orderError);
      return NextResponse.json({ success: false, error: orderError.message || "Failed to insert order" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: orderNumber,
      amount: expectedAmount,
      customerKey: userId,
    });

  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status: 500 });
  }
}