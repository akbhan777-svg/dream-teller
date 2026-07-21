import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 회원 전용 결제로 가정
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 1. 주문 무결성 검증 (DB)
    const { data: order, error: orderError } = await supabase
      .from("orders")
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
      await (supabase.from("orders") as any)
        .update({ payment_status: "failed" })
        .eq("order_number", orderId);
        
      // TODO: 텔레그램 결제 실패 알림
        
      return NextResponse.json({ 
        error: tossData.message || "Payment confirmation failed", 
        code: tossData.code,
        details: tossData 
      }, { status: 400 });
    }

    // 3. 결제 승인 완료 후 DB 트랜잭션 업데이트
    const nowIso = new Date().toISOString();
    
    // 3-1. 주문 상태 변경
    const { error: updateOrderError } = await (supabase.from("orders") as any)
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
    const { error: insertPaymentError } = await (supabase.from("payments") as any)
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

    // 3-3. 다회권 구매 시 충전 트랜잭션 처리
    if (order.order_type === "pass_charge_5" || order.order_type === "pass_charge_10") {
      const chargeAmount = order.order_type === "pass_charge_5" ? 5 : 10;
      
      const { data: userData } = await supabase
        .from("users")
        .select("remaining_interprets")
        .eq("id", user.id)
        .single();
        
      const currentRemaining = userData?.remaining_interprets || 0;
      
      await (supabase.from("users") as any)
        .update({ 
          remaining_interprets: currentRemaining + chargeAmount,
          updated_at: nowIso
        })
        .eq("id", user.id);
        
      await (supabase.from("pass_transactions") as any)
        .insert({
          user_id: user.id,
          order_id: order.id,
          transaction_type: "charge",
          amount: chargeAmount
        });
    } else if (order.order_type === "single_interpretation") {
      // 3-4. 일반 단판 구매 시 dream_results 펜딩 레코드 생성 후 AI 백그라운드 호출
      await (supabase.from("dream_results") as any)
        .insert({
          order_id: order.id,
          analysis_status: "pending",
          is_public: false
        });
    }

    // 4. 결제 완료 텔레그램 알림 발송
    // TODO: Telegram Webhook Call (결제완료, order.total_amount, order.dream_content 등 전송)

    return NextResponse.json({
      success: true,
      data: tossData
    });

  } catch (error: any) {
    console.error("Confirm API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
