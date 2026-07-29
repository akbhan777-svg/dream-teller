import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, category, message, content } = body;
    const finalMessage = message || content;

    if (!finalMessage) {
      return NextResponse.json(
        { success: false, error: "문의 내용이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 1. 데이터베이스(Supabase) 우선 저장 백업 파이프라인
    try {
      const supabaseAdmin = createAdminClient();
      const { error: dbError } = await (supabaseAdmin as any).from("inquiries").insert({
        name: name || "미기재",
        email: email || "미기재",
        category: category || "일반 문의",
        message: finalMessage,
        status: "pending",
      });

      if (dbError) {
        console.error("CS DB 백업 저장 에러:", dbError);
      }
    } catch (dbEx) {
      console.error("CS DB 저장 중 예외 발생:", dbEx);
    }

    // 2. 텔레그램 알림 발송 파이프라인
    // 텔레그램 HTML parse_mode에서 오류를 유발하는 특수 기호(<, >, &) 완벽 이스케이프
    const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    const safeName = escapeHtml(name || "미기재");
    const safeCategory = escapeHtml(category || "일반 문의");
    const safeEmail = escapeHtml(email || "미기재");
    const safeMessage = escapeHtml(finalMessage);

    // 텔레그램으로 보낼 메시지 템플릿 포맷팅 (HTML parse_mode 대응)
    const telegramMessage = `
🚨 <b>신규 고객 문의 접수</b>
━━━━━━━━━━━━━━━━━━
<b>연락처 / 닉네임:</b> ${safeName}
<b>유형:</b> ${safeCategory}
<b>회신 이메일:</b> ${safeEmail}

<b>[문의 내용]</b>
${safeMessage}
━━━━━━━━━━━━━━━━━━
<i>Dream Teller System</i>
    `.trim();

    // 텔레그램 발송 중 에러가 발생해도, DB에 저장되었으므로 클라이언트에는 에러를 반환하지 않고 성공 처리함
    await sendTelegramMessage(telegramMessage);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("문의 접수 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
