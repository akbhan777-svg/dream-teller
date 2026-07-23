import { NextResponse } from "next/server";
import { parseFullTranscript, generateHTMLReport } from "@/lib/report-generator";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "html";

    // 1. 대화 내역 100% 파싱
    const dialogues = parseFullTranscript();

    if (!dialogues || dialogues.length === 0) {
      return new NextResponse("대화 기록을 찾을 수 없거나 아직 기록이 존재하지 않습니다.", { status: 404 });
    }

    const publicDownloadsDir = path.join(process.cwd(), "public", "downloads");
    if (!fs.existsSync(publicDownloadsDir)) {
      fs.mkdirSync(publicDownloadsDir, { recursive: true });
    }

    // 2. Python 스크립트 실행하여 진성 OpenXML .docx 생성 시도
    let docxBinary: Buffer | null = null;
    const pythonDocxPath = path.join(process.cwd(), "dream_teller_chat_report.docx");

    try {
      console.log("Executing generate_report.py via Node child_process...");
      execSync("python generate_report.py", { cwd: process.cwd(), timeout: 15000 });
      
      if (fs.existsSync(pythonDocxPath)) {
        docxBinary = fs.readFileSync(pythonDocxPath);
        // Copy to public/downloads
        fs.writeFileSync(path.join(publicDownloadsDir, "dream_teller_chat_report.docx"), docxBinary);
        console.log("python-docx binary file loaded successfully! Size:", docxBinary.length);
      }
    } catch (pyErr: any) {
      console.warn("Python generate_report.py execution failed or python-docx missing:", pyErr?.message);
    }

    // 3. 만약 python-docx가 실패했을 경우, 100% 워드 호환 RTF/Document 생성을 수행
    if (!docxBinary) {
      console.log("Generating Word-compatible RTF document...");
      const rtfContent = generateRTFReport(dialogues);
      docxBinary = Buffer.from(rtfContent, "utf-8");
      fs.writeFileSync(path.join(publicDownloadsDir, "dream_teller_chat_report.rtf"), docxBinary);
      fs.writeFileSync(path.join(publicDownloadsDir, "dream_teller_chat_report.docx"), docxBinary);
    }

    const htmlContent = generateHTMLReport(dialogues);
    fs.writeFileSync(path.join(publicDownloadsDir, "dream_teller_chat_report.html"), htmlContent, "utf-8");

    // 4. 브라우저 다운로드 응답
    if (format === "docx") {
      // If we have a python-docx generated binary OpenXML file
      const isRealDocx = docxBinary[0] === 0x50 && docxBinary[1] === 0x4b; // 'PK' zip header check
      const mimeType = isRealDocx 
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
        : "application/rtf";

      const filename = isRealDocx ? "dream_teller_chat_report.docx" : "dream_teller_chat_report.rtf";

      return new NextResponse(Uint8Array.from(docxBinary), {
        status: 200,
        headers: {
          "Content-Type": `${mimeType}; charset=utf-8`,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "pdf") {
      const pdfHtmlContent = htmlContent.replace(
        "</body>",
        "<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script></body>"
      );
      return new NextResponse(pdfHtmlContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Report download route error:", error);
    return NextResponse.json({ error: "리포트 생성 중 오류가 발생했습니다: " + error.message }, { status: 500 });
  }
}

// RTF Generator function for 100% Word compatibility without XML error
function generateRTFReport(dialogues: any[]): string {
  let rtf = `{\\rtf1\\ansi\\ansicpg949\\deff0\\deflang1042{\\fonttbl{\\f0\\fnil\\fcharset129 Malgun Gothic;}}\n`;
  rtf += `{\\colortbl ;\\red79\\green70\\blue229;\\red219\\green39\\blue119;\\red31\\green41\\blue55;}\n`;
  rtf += `\\viewkind4\\uc1\\paperw11900\\paperh16838\\margl1440\\margr1440\\margt1440\\margb1440\n`;
  
  const title = escapeRTF("Dream Teller 개발 대화 전체 기록 및 질의응답 리포트");
  const summary = escapeRTF(`총 ${dialogues.length}개 질의응답 내역`);
  
  rtf += `\\f0\\fs36\\b\\cf1 ${title}\\b0\\fs22\\cf0\\par\n`;
  rtf += `\\fs20\\cf3 ${summary}\\cf0\\par\n`;
  rtf += `\\line\\par\n`;

  dialogues.forEach((item, idx) => {
    const qTitle = escapeRTF(`Q${idx + 1}. [사용자 프롬프트 질문]`);
    const aTitle = escapeRTF(`[AI 답변 및 작성 내용]`);
    const qText = escapeRTF(item.question);
    const aText = escapeRTF(item.answer);

    rtf += `\\f0\\fs24\\b\\cf2 ${qTitle}\\b0\\par\n`;
    rtf += `\\fs22 ${qText}\\par\\line\n`;
    rtf += `\\fs24\\b\\cf1 ${aTitle}\\b0\\par\n`;
    rtf += `\\fs22 ${aText}\\par\n`;
    rtf += `\\line--------------------------------------------------------------------------------\\par\\line\n`;
  });

  rtf += `}\n`;
  return rtf;
}

function escapeRTF(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\par\n")
    .replace(/[\u0080-\uFFFF]/g, (c) => `\\u${c.charCodeAt(0)}?`);
}
