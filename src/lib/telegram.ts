// 텔레그램 알림 발송 유틸리티
export async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("텔레그램 토큰 또는 Chat ID가 설정되지 않아 알림 발송을 건너뜁니다.");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML", // HTML 태그 렌더링 지원 (<b>, <i> 등)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`텔레그램 발송 실패: [${response.status}] ${errorText}`);
    }
  } catch (error) {
    console.error("텔레그램 발송 중 네트워크 에러:", error);
  }
}
