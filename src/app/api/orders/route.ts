import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { amount, plan, expertField, dreamContent, includesImage, guestPhone, guestPassword } = body;
    const isImageIncluded = includesImage !== false; // 기본값 true

    // 유저 ID 결정 (로그인 유저 또는 비회원 시스템 고정 UUID)
    const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";
    const userId = user ? user.id : GUEST_USER_ID;

    // 0. public.users 레코드 존재 여부 확인 및 자동 생성 (FKEY constraint 에러 방지)
    const { data: existingUser } = await (supabaseAdmin.from("users") as any)
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingUser) {
      await (supabaseAdmin.from("users") as any).upsert({
        id: userId,
        email: user?.email || "guest@dreamteller.com",
        nickname: user?.user_metadata?.name || user?.user_metadata?.full_name || (user ? "회원" : "비회원"),
        provider: user?.app_metadata?.provider || "guest",
        role: user ? "user" : "guest",
        remaining_interprets: 0,
      });
    }

    // 1. 가격 및 상품 검증
    let expectedAmount = 0;
    let orderType = "single_interpretation";
    
    if (plan === "single") {
      expectedAmount = isImageIncluded ? 2000 : 1500;
      orderType = "single_interpretation";
    } else if (plan === "pass5") {
      if (!user) {
        return NextResponse.json({ error: "비회원은 할인 다회권을 결제할 수 없습니다. 회원가입 후 이용해 주세요." }, { status: 403 });
      }
      expectedAmount = 7200;
      orderType = "pass_charge_5";
    } else if (plan === "pass10") {
      if (!user) {
        return NextResponse.json({ error: "비회원은 할인 다회권을 결제할 수 없습니다. 회원가입 후 이용해 주세요." }, { status: 403 });
      }
      expectedAmount = 13500;
      orderType = "pass_charge_10";
    } else if (plan === "use_pass") {
      expectedAmount = 0;
      orderType = "pass_use";
    } else {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (amount !== expectedAmount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // 주문 번호 생성 (예: DT_timestamp_random)
    const orderNumber = `DT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 2. 다회권 차감 (use_pass) 플로우 분기
    if (plan === "use_pass") {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // 2-1. 유저의 잔여 횟수 조회
      const { data: userData, error: userError } = await (supabaseAdmin.from("users") as any)
        .select("remaining_interprets")
        .eq("id", user.id)
        .single();

      const userRec = userData as { remaining_interprets?: number } | null;
      const currentPasses = userRec?.remaining_interprets || 0;

      if (userError || !userRec || currentPasses < 1) {
        return NextResponse.json({ error: "Insufficient passes" }, { status: 403 });
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
          dream_content: dreamContent,
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

      // 2-6. 비동기 AI 파이프라인 트리거
      const protocol = request.headers.get("x-forwarded-proto") || "http";
      const host = request.headers.get("host");
      if (host) {
        fetch(`${protocol}://${host}/api/ai/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        }).catch((err) => console.error("AI trigger fetch error:", err));
      }

      return NextResponse.json({
        success: true,
        orderId: orderNumber,
        isPassUsed: true,
      });
    }

    // 3. 일반 결제 플로우 (pending 주문 생성)
    const { data: order, error: orderError } = await (supabaseAdmin.from("orders") as any)
      .insert({
        user_id: userId,
        order_number: orderNumber,
        total_amount: amount,
        order_type: orderType,
        payment_status: "pending",
        expert_field: expertField,
        dream_content: dreamContent,
        includes_image: isImageIncluded,
        guest_phone: guestPhone || null,
        guest_password: guestPassword || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Orders insert DB error:", orderError);
      throw orderError;
    }

    return NextResponse.json({
      success: true,
      orderId: orderNumber,
      amount: amount,
      customerKey: userId,
    });

  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
