import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, code, message } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // DB 상태 업데이트
    const { error } = await (supabase.from("orders") as any)
      .update({ 
        payment_status: "failed" 
      })
      .eq("order_number", orderId);

    if (error) throw error;

    // 텔레그램 결제 실패 알림 발송
    await sendTelegramMessage(
      `❌ <b>[결제 실패]</b>\n\n` +
      `<b>주문 ID:</b> <code>${orderId}</code>\n` +
      `<b>유저 ID:</b> <code>${user.id}</code>\n` +
      `<b>에러 코드:</b> ${code || "알 수 없음"}\n` +
      `<b>사유:</b> ${message || "결제 승인 과정 중 취소 또는 오류 발생"}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment fail log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
