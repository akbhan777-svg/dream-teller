import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ error: "연락처와 비밀번호를 입력해 주세요." }, { status: 400 });
    }

    // 1. 비회원 결제 완료된 주문 및 dream_results 조인 조회 (Admin 권한 RLS 우회)
    const { data: orders, error } = await (supabaseAdmin.from("orders") as any)
      .select(`
        id,
        order_number,
        total_amount,
        payment_status,
        expert_field,
        dream_content,
        includes_image,
        order_type,
        created_at,
        dream_results (
          id,
          analysis_status,
          image_url
        )
      `)
      .eq("payment_status", "paid")
      .eq("guest_phone", phone)
      .eq("guest_password", password)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Guest orders query error:", error);
      return NextResponse.json({ error: "주문 조회 실패" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orders: orders || []
    });

  } catch (error: any) {
    console.error("Guest Orders API Error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
