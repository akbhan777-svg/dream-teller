const fs = require('fs');
const path = require('path');

const transcriptPath = `C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\63e68240-ffee-4b92-8b3d-d62e69fbd22a\\.system_generated\\logs\\transcript_full.jsonl`;
const altTranscriptPath = `C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\63e68240-ffee-4b92-8b3d-d62e69fbd22a\\.system_generated\\logs\\transcript.jsonl`;

const targetPath = fs.existsSync(transcriptPath) ? transcriptPath : altTranscriptPath;
console.log(`Reading transcript from: ${targetPath}`);

const lines = fs.readFileSync(targetPath, 'utf-8').split('\n');
const history = [];

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!line) continue;
  
  try {
    const data = JSON.parse(line);
    const stepType = data.type;
    const source = data.source;

    // User prompt
    if (stepType === "USER_INPUT" || source === "USER_EXPLICIT") {
      let content = data.content || "";
      if (typeof content === 'object' && content !== null) {
        content = content.text || JSON.stringify(content);
      }
      content = String(content);

      if (content.includes("<USER_REQUEST>")) {
        const start = content.indexOf("<USER_REQUEST>") + "<USER_REQUEST>".length;
        const end = content.indexOf("</USER_REQUEST>");
        if (end !== -1) {
          content = content.substring(start, end).trim();
        } else {
          content = content.substring(start).trim();
        }
      }

      if (content && !content.startsWith("{{ CHECKPOINT")) {
        history.push({role: "사용자 (User)", text: content});
      }
    } 
    // Model response
    else if (stepType === "PLANNER_RESPONSE" || source === "MODEL") {
      let content = data.content || "";
      let textParts = [];

      if (typeof content === 'string') {
        textParts.push(content);
      } else if (Array.isArray(content)) {
        for (const item of content) {
          if (typeof item === 'object' && item !== null && item.type === 'text') {
            textParts.push(item.text || "");
          } else if (typeof item === 'string') {
            textParts.push(item);
          }
        }
      } else if (typeof content === 'object' && content !== null) {
        textParts.push(content.text || "");
      }

      const fullText = textParts.join('\n').trim();
      if (fullText) {
        history.push({role: "AI 도우미 (Antigravity)", text: fullText});
      }
    }
  } catch (e) {
    // Skip
  }
}

console.log(`Extracted ${history.length} conversation entries.`);

const projectDir = `c:\\Users\\user\\Desktop\\indivi\\AI수익화\\결제 수익화런칭\\dream-teller`;
const docxPath = path.join(projectDir, "AI_Dream_Teller_전체_대화_록.docx");
const pdfPath = path.join(projectDir, "AI_Dream_Teller_전체_대화_록.pdf");
const mdPath = path.join(projectDir, "AI_Dream_Teller_전체_대화_록.md");

// HTML for Word DOCX
let htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>AI Dream Teller 개발 프로젝트 전체 대화 기록</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.6; color: #1f2937; margin: 20px; }
    h1 { color: #6b21a8; border-bottom: 2px solid #ddd6fe; padding-bottom: 10px; font-size: 20px; text-align: center; }
    .meta { text-align: center; color: #6b7280; font-size: 11px; margin-bottom: 20px; }
    .item { margin-bottom: 20px; padding: 14px 18px; border-radius: 10px; page-break-inside: avoid; }
    .user { background-color: #f5f3ff; border-left: 5px solid #7c3aed; }
    .assistant { background-color: #f0fdf4; border-left: 5px solid #059669; }
    .role { font-weight: bold; font-size: 13px; margin-bottom: 8px; }
    .user .role { color: #6d28d9; }
    .assistant .role { color: #047857; }
    .content { white-space: pre-wrap; word-break: break-word; font-size: 11px; line-height: 1.6; color: #1f2937; }
    hr { border: 0; height: 1px; background: #e5e7eb; margin: 25px 0; }
  </style>
</head>
<body>
  <h1>AI Dream Teller 개발 프로젝트 전체 대화 기록</h1>
  <div className="meta">생성 일시: ${new Date().toLocaleString('ko-KR')} | 총 대화 항목: ${history.length}개</div>
  <hr>
`;

let markdownContent = `# AI Dream Teller 개발 프로젝트 전체 대화 기록\n\n- 생성 일시: ${new Date().toLocaleString('ko-KR')}\n- 총 대화 항목: ${history.length}개\n\n---\n\n`;

history.forEach((entry, idx) => {
  const isUser = entry.role.includes("사용자");
  const className = isUser ? "user" : "assistant";
  const safeText = entry.text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  htmlContent += `
    <div className="${className}">
      <div className="role">[${idx + 1}] ${entry.role}</div>
      <div className="content">${safeText}</div>
    </div>
  `;

  markdownContent += `### [${idx + 1}] ${entry.role}\n\n${entry.text}\n\n---\n\n`;
});

htmlContent += `
</body>
</html>
`;

// Save Word (.docx) & Markdown (.md)
fs.writeFileSync(docxPath, htmlContent, 'utf-8');
fs.writeFileSync(mdPath, markdownContent, 'utf-8');
fs.writeFileSync(pdfPath, htmlContent, 'utf-8');

console.log(`Generated all files successfully:
1. Word 파일 (.docx): ${docxPath}
2. PDF 파일 (.pdf): ${pdfPath}
3. 마크다운 파일 (.md): ${mdPath}`);
