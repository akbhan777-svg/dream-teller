import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 현재 회원 전용 결제로 가정 (비회원 처리 제외)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, plan, expertField, dreamContent, includesImage } = body;
    const isImageIncluded = includesImage !== false; // 기본값 true

    // 0. public.users 레코드 존재 여부 확인 및 자동 생성 (FKEY constraint 에러 방지)
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingUser) {
      await (supabase.from("users") as any).upsert({
        id: user.id,
        email: user.email || null,
        nickname: user.user_metadata?.name || user.user_metadata?.full_name || "사용자",
        provider: user.app_metadata?.provider || "social",
        role: "user",
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
      expectedAmount = 7200;
      orderType = "pass_charge_5";
    } else if (plan === "pass10") {
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
      // 2-1. 유저의 잔여 횟수 조회
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("remaining_interprets")
        .eq("id", user.id)
        .single();

      if (userError || !userData || (userData.remaining_interprets || 0) < 1) {
        return NextResponse.json({ error: "Insufficient passes" }, { status: 403 });
      }

      // 2-2. 주문 생성 (결제 불필요하므로 즉시 paid 처리)
      const { data: order, error: orderError } = await (supabase.from("orders") as any)
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
      const { error: deductError } = await (supabase.from("users") as any)
        .update({ remaining_interprets: (userData.remaining_interprets || 0) - 1 })
        .eq("id", user.id);
        
      if (deductError) throw deductError;

      const { error: txError } = await (supabase.from("pass_transactions") as any)
        .insert({
          user_id: user.id,
          order_id: order.id,
          transaction_type: "consume",
          amount: -1
        });

      if (txError) throw txError;

      return NextResponse.json({
        success: true,
        orderId: orderNumber,
        isPassUsed: true,
      });
    }

    // 3. 일반 결제 플로우 (pending 주문 생성)
    const { data: order, error: orderError } = await (supabase.from("orders") as any)
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total_amount: amount,
        order_type: orderType,
        payment_status: "pending",
        expert_field: expertField,
        dream_content: dreamContent,
        includes_image: isImageIncluded,
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
      customerKey: user.id,
    });

  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
