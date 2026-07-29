import fs from "fs";
import path from "path";

export interface DialogueItem {
  index: number;
  question: string;
  answer: string;
  sessionId?: string;
}

export function parseFullTranscript(): DialogueItem[] {
  const conversationIds = [
    "4315ab1d-5e8d-40bc-a4da-502b2128c005", // 이전 대화 세션
    "bb6a8237-f48e-4f04-bcc5-766550877bba"  // 현재 대화 세션
  ];
  
  const userProfile = process.env.USERPROFILE || "C:\\Users\\user";
  const dialogues: DialogueItem[] = [];
  let globalIdx = 1;

  for (const conversationId of conversationIds) {
    const brainDir = path.join(userProfile, ".gemini", "antigravity-ide", "brain", conversationId, ".system_generated", "logs");
    
    let transcriptPath = path.join(brainDir, "transcript_full.jsonl");
    if (!fs.existsSync(transcriptPath)) {
      transcriptPath = path.join(brainDir, "transcript.jsonl");
    }

    if (!fs.existsSync(transcriptPath)) {
      continue;
    }

    const lines = fs.readFileSync(transcriptPath, "utf-8").split("\n");
    
    let currentUserRequest: string | null = null;
    let currentAnswers: string[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const data = JSON.parse(line);
        
        if (data.type === "USER_INPUT") {
          // 이전 질문과 답변 모음 저장
          if (currentUserRequest && currentAnswers.length > 0) {
            const combinedAnswer = currentAnswers.join("\n\n").trim();
            if (combinedAnswer) {
              dialogues.push({
                index: globalIdx++,
                question: currentUserRequest,
                answer: combinedAnswer,
                sessionId: conversationId.substring(0, 8)
              });
            }
            currentAnswers = [];
          }

          let content = data.content || "";
          
          // XML 메타데이터 및 체크포인트 태그 제거
          content = content.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/gi, "$1");
          content = content.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/gi, "");
          content = content.replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/gi, "");
          content = content.replace(/<SYSTEM_MESSAGE>[\s\S]*?<\/SYSTEM_MESSAGE>/gi, "");
          content = content.replace(/<EPHEMERAL_MESSAGE>[\s\S]*?<\/EPHEMERAL_MESSAGE>/gi, "");
          content = content.replace(/# Conversation History[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, "");
          content = content.trim();

          if (content && !content.startsWith("CHECKPOINT") && !content.includes("The earlier parts of this conversation have been truncated")) {
            currentUserRequest = content;
            currentAnswers = [];
          }
        } else if (data.type === "PLANNER_RESPONSE" && currentUserRequest) {
          const respContent = data.content || "";
          if (respContent) {
            // Markdown file links clean-up
            const cleanResp = respContent.replace(/\[([^\]]+)\]\(file:\/\/\/[^\)]+\)/g, "$1");
            currentAnswers.push(cleanResp.trim());
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    // 세션별 마지막 QA 추가
    if (currentUserRequest && currentAnswers.length > 0) {
      const combinedAnswer = currentAnswers.join("\n\n").trim();
      if (combinedAnswer) {
        dialogues.push({
          index: globalIdx++,
          question: currentUserRequest,
          answer: combinedAnswer,
          sessionId: conversationId.substring(0, 8)
        });
      }
    }
  }

  // 중복 질의응답 정제
  const uniqueDialogues: DialogueItem[] = [];
  const seenQuestions = new Set<string>();

  dialogues.forEach((item) => {
    const key = item.question.substring(0, 60);
    if (!seenQuestions.has(key)) {
      seenQuestions.add(key);
      uniqueDialogues.push({
        ...item,
        index: uniqueDialogues.length + 1
      });
    }
  });

  return uniqueDialogues;
}

export function generateHTMLReport(dialogues: DialogueItem[], title: string = "Dream Teller 개발 대화 전체 기록 및 질의응답 리포트"): string {
  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const itemsHtml = dialogues.map((item) => {
    const qText = item.question
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");
    
    let aText = item.answer
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/### (.*)/g, "<h4 style='color:#a855f7; margin-top:16px; margin-bottom:8px;'>$1</h4>")
      .replace(/## (.*)/g, "<h3 style='color:#8b5cf6; margin-top:20px; margin-bottom:10px;'>$1</h3>")
      .replace(/# (.*)/g, "<h2 style='color:#6366f1; margin-top:24px; margin-bottom:12px;'>$1</h2>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");

    return `
      <div style="margin-bottom: 35px; padding-bottom: 25px; border-bottom: 1px solid #e5e7eb; page-break-inside: avoid;">
        <div style="background-color: #fdf2f8; border-left: 5px solid #ec4899; padding: 14px 18px; border-radius: 6px; margin-bottom: 16px;">
          <div style="color: #be185d; font-weight: 800; font-size: 15px; margin-bottom: 6px;">Q${item.index}. [사용자 질문 / 프롬프트]</div>
          <div style="color: #831843; font-size: 14px; line-height: 1.6; font-weight: 600;">${qText}</div>
        </div>
        <div style="background-color: #ffffff; border: 1px solid #f3f4f6; padding: 18px 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="color: #6d28d9; font-weight: 800; font-size: 15px; margin-bottom: 10px; border-bottom: 2px solid #f3e8ff; padding-bottom: 6px;">[AI 답변 및 작성 내용]</div>
          <div style="color: #1f2937; font-size: 13.5px; line-height: 1.75;">${aText}</div>
        </div>
      </div>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.7;
      padding: 40px 20px;
      max-width: 950px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
      color: white;
      padding: 32px 28px;
      border-radius: 16px;
      margin-bottom: 35px;
      box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.3);
    }
    h1 {
      font-size: 24px;
      font-weight: 900;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }
    .meta {
      font-size: 13px;
      opacity: 0.9;
    }
    .btn-group {
      display: flex;
      gap: 12px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background-color: #4f46e5;
      color: white;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
    }
    .btn-secondary {
      background-color: #db2777;
      box-shadow: 0 4px 12px rgba(219, 39, 119, 0.25);
    }
    @media print {
      body { background-color: #ffffff; padding: 0; }
      .btn-group { display: none; }
      .header { background: #4f46e5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Dream Teller 개발 프롬프트 및 답변 전체 기록 리포트</h1>
    <div class="meta">생성 일시: ${currentDate} | 총 누적 질의응답 항목: ${dialogues.length}건</div>
  </div>

  <div class="btn-group">
    <button onclick="window.print()" class="btn">📕 PDF로 저장 / 인쇄하기</button>
    <a href="/api/download-report?format=docx" class="btn btn-secondary">📄 MS Word (.docx) 다운로드</a>
  </div>

  <div class="content">
    ${itemsHtml}
  </div>
</body>
</html>`;
}
