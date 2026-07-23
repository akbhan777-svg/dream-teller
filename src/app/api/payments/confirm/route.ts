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
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 1. 주문 무결성 검증 (DB) - RLS 우회를 위해 Admin Client 사용
    const { data: order, error: orderError } = await (supabaseAdmin.from("orders") as any)
      .select("*")
      .eq("order_number", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 이미 결제 완료된 경우 멱등성 처리
    if (order.payment_status === "paid") {
      return NextResponse.json({ success: true, message: "Already paid" });
    }

    // 금액 검증 (중요)
    if (Number(order.total_amount) !== Number(amount)) {
      console.error(`Amount mismatch: DB stored ${order.total_amount}, but requested ${amount}`);
      return NextResponse.json({ 
        error: `Amount mismatch detected (stored: ${order.total_amount}, requested: ${amount})` 
      }, { status: 400 });
    }

    // 2. 토스페이먼츠 결제 승인 API 호출
    const widgetSecretKey = process.env.TOSS_SECRET_KEY;
    if (!widgetSecretKey) {
      console.error("TOSS_SECRET_KEY is missing in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Secret key base64 encoding (must append colon at the end)
    const encryptedSecretKey = Buffer.from(`${widgetSecretKey}:`).toString("base64");

    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      // 결제 승인 실패 처리
      console.error("Toss Payment Confirm Error:", tossData);
      
      // DB 상태 업데이트
      await (supabaseAdmin.from("orders") as any)
        .update({ payment_status: "failed" })
        .eq("order_number", orderId);
        
      return NextResponse.json({ 
        error: tossData.message || "Payment confirmation failed", 
        code: tossData.code,
        details: tossData 
      }, { status: 400 });
    }

    // 3. 결제 승인 완료 후 DB 트랜잭션 업데이트
    const nowIso = new Date().toISOString();
    const targetUserId = user?.id || order.user_id;
    
    // 3-1. 주문 상태 변경
    const { error: updateOrderError } = await (supabaseAdmin.from("orders") as any)
      .update({ 
        payment_status: "paid",
        updated_at: nowIso
      })
      .eq("id", order.id);

    if (updateOrderError) {
      console.error("Failed to update order status to paid:", updateOrderError);
      throw updateOrderError;
    }

    // 3-2. payments 테이블 결제 성공 이력 생성
    const { error: insertPaymentError } = await (supabaseAdmin.from("payments") as any)
      .insert({
        order_id: order.id,
        payment_key: paymentKey,
        amount: amount,
        method: tossData.method || "카드",
        approved_at: tossData.approvedAt || nowIso,
        raw_response: tossData,
      });

    if (insertPaymentError) {
      console.error("Failed to insert payment history:", insertPaymentError);
    }

    // 3-3. 다회권 구매 시 충전 및 입력한 꿈 1회 차감/해몽 즉시 처리 (회원일 경우만)
    if (order.order_type === "pass_charge_5" || order.order_type === "pass_charge_10") {
      const chargeAmount = order.order_type === "pass_charge_5" ? 5 : 10;
      const hasDreamContent = order.dream_content && order.dream_content.trim().length > 0;
      const deductAmount = hasDreamContent ? 1 : 0;
      const netIncrease = chargeAmount - deductAmount;
      
      const { data: userData } = await (supabaseAdmin.from("users") as any)
        .select("remaining_interprets")
        .eq("id", targetUserId)
        .single();
        
      const userRec = userData as { remaining_interprets?: number } | null;
      const currentRemaining = userRec?.remaining_interprets || 0;
      
      // 1. 유저 보유 잔여 횟수 업데이트 (충전 - 작성한 꿈 1회 차감)
      await (supabaseAdmin.from("users") as any)
        .update({ 
          remaining_interprets: currentRemaining + netIncrease,
          updated_at: nowIso
        })
        .eq("id", targetUserId);
        
      // 2. 충전 트랜잭션 기록
      await (supabaseAdmin.from("pass_transactions") as any)
        .insert({
          user_id: targetUserId,
          order_id: order.id,
          transaction_type: "charge",
          amount: chargeAmount
        });

      // 3. 작성한 꿈 내용이 있으면 1회 차감 이력 및 dream_results 펜딩 생성
      if (hasDreamContent) {
        await (supabaseAdmin.from("pass_transactions") as any)
          .insert({
            user_id: targetUserId,
            order_id: order.id,
            transaction_type: "consume",
            amount: -1
          });

        await (supabaseAdmin.from("dream_results") as any)
          .upsert({
            order_id: order.id,
            analysis_status: "pending",
            is_public: false
          }, { onConflict: "order_id" });
      }
    } else if (order.order_type === "single_interpretation") {
      // 3-4. 일반 단판 구매 시 dream_results 펜딩 레코드 생성
      await (supabaseAdmin.from("dream_results") as any)
        .upsert({
          order_id: order.id,
          analysis_status: "pending",
          is_public: false
        }, { onConflict: "order_id" });
    }

    // 4. 결제 완료 텔레그램 알림 발송
    const dreamSnippet = order.dream_content
      ? order.dream_content.substring(0, 30) + "..."
      : "꿈 내용 없음";

    await sendTelegramMessage(
      `✅ <b>[결제 성공]</b>\n\n` +
      `<b>주문번호:</b> <code>${order.order_number}</code>\n` +
      `<b>유저 ID:</b> <code>${targetUserId}</code>\n` +
      `<b>상품:</b> ${order.order_type}\n` +
      `<b>결제금액:</b> ${order.total_amount.toLocaleString()}원\n` +
      `<b>꿈 내용:</b> ${dreamSnippet}`
    );

    // 5. 비동기 AI 파이프라인 트리거 (Fire and forget)
    const dreamCheck = order.dream_content && order.dream_content.trim().length > 0;
    if (dreamCheck || order.order_type === "single_interpretation") {
      // 본 서버의 호스트를 가져오기 위한 처리
      const protocol = request.headers.get("x-forwarded-proto") || "http";
      const host = request.headers.get("host");
      if (host) {
        fetch(`${protocol}://${host}/api/ai/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        }).catch((err) => console.error("AI trigger fetch error:", err));
      }
    }
    return NextResponse.json({
      success: true,
      data: tossData
    });

  } catch (error: any) {
    console.error("Confirm API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
