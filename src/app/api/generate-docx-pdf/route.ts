import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const transcriptPath = "C:/Users/user/.gemini/antigravity-ide/brain/63e68240-ffee-4b92-8b3d-d62e69fbd22a/.system_generated/logs/transcript_full.jsonl";
    const altTranscriptPath = "C:/Users/user/.gemini/antigravity-ide/brain/63e68240-ffee-4b92-8b3d-d62e69fbd22a/.system_generated/logs/transcript.jsonl";

    const targetPath = fs.existsSync(transcriptPath) ? transcriptPath : altTranscriptPath;
    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ success: false, error: `Transcript not found at ${targetPath}` }, { status: 404 });
    }

    const fileContent = fs.readFileSync(targetPath, "utf-8");
    const lines = fileContent.split("\n");

    const history: Array<{ role: string; text: string }> = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      
      try {
        const data = JSON.parse(line);
        const stepType = data.type;
        const source = data.source;

        if (stepType === "USER_INPUT" || source === "USER_EXPLICIT") {
          let content = data.content || "";
          if (typeof content === "object" && content !== null) {
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
            history.push({ role: "사용자 (User)", text: content });
          }
        } else if (stepType === "PLANNER_RESPONSE" || source === "MODEL") {
          let content = data.content || "";
          let textParts: string[] = [];

          if (typeof content === "string") {
            textParts.push(content);
          } else if (Array.isArray(content)) {
            for (const item of content) {
              if (typeof item === "object" && item !== null && item.type === "text") {
                textParts.push(item.text || "");
              } else if (typeof item === "string") {
                textParts.push(item);
              }
            }
          } else if (typeof content === "object" && content !== null) {
            textParts.push(content.text || "");
          }

          const fullText = textParts.join("\n").trim();
          if (fullText) {
            history.push({ role: "AI 도우미 (Antigravity)", text: fullText });
          }
        }
      } catch (e) {
        // Skip
      }
    }

    // --- Genuine OpenXML ZIP generator ---
    function createZip(files: Array<{ path: string; data: Buffer | string }>): Buffer {
      function crc32(buf: Buffer): number {
        let crc = 0xffffffff;
        for (let i = 0; i < buf.length; i++) {
          crc ^= buf[i];
          for (let j = 0; j < 8; j++) {
            if (crc & 1) crc = (crc >>> 1) ^ 0xedb88320;
            else crc = crc >>> 1;
          }
        }
        return (crc ^ 0xffffffff) >>> 0;
      }

      const localHeaders: Buffer[] = [];
      const cdHeaders: Buffer[] = [];
      let offset = 0;

      files.forEach((file) => {
        const fileNameBuf = Buffer.from(file.path, "utf-8");
        const dataBuf = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf-8");
        const crc = crc32(dataBuf);
        const size = dataBuf.length;

        const lh = Buffer.alloc(30 + fileNameBuf.length);
        lh.writeUInt32LE(0x04034b50, 0);
        lh.writeUInt16LE(20, 4);
        lh.writeUInt16LE(0, 6);
        lh.writeUInt16LE(0, 8);
        lh.writeUInt16LE(0, 10);
        lh.writeUInt16LE(0, 12);
        lh.writeUInt32LE(crc, 14);
        lh.writeUInt32LE(size, 18);
        lh.writeUInt32LE(size, 22);
        lh.writeUInt16LE(fileNameBuf.length, 26);
        lh.writeUInt16LE(0, 28);
        fileNameBuf.copy(lh, 30);

        localHeaders.push(lh);
        localHeaders.push(dataBuf);

        const cd = Buffer.alloc(46 + fileNameBuf.length);
        cd.writeUInt32LE(0x02014b50, 0);
        cd.writeUInt16LE(20, 4);
        cd.writeUInt16LE(20, 6);
        cd.writeUInt16LE(0, 8);
        cd.writeUInt16LE(0, 10);
        cd.writeUInt16LE(0, 12);
        cd.writeUInt16LE(0, 14);
        cd.writeUInt32LE(crc, 16);
        cd.writeUInt32LE(size, 20);
        cd.writeUInt32LE(size, 24);
        cd.writeUInt16LE(fileNameBuf.length, 28);
        cd.writeUInt16LE(0, 30);
        cd.writeUInt16LE(0, 32);
        cd.writeUInt16LE(0, 34);
        cd.writeUInt16LE(0, 36);
        cd.writeUInt32LE(0, 38);
        cd.writeUInt32LE(offset, 42);
        fileNameBuf.copy(cd, 46);

        cdHeaders.push(cd);
        offset += lh.length + dataBuf.length;
      });

      const cdOffset = offset;
      let cdSize = 0;
      cdHeaders.forEach((h) => (cdSize += h.length));

      const eocd = Buffer.alloc(22);
      eocd.writeUInt32LE(0x06054b50, 0);
      eocd.writeUInt16LE(0, 4);
      eocd.writeUInt16LE(0, 6);
      eocd.writeUInt16LE(files.length, 8);
      eocd.writeUInt16LE(files.length, 10);
      eocd.writeUInt32LE(cdSize, 12);
      eocd.writeUInt32LE(cdOffset, 16);
      eocd.writeUInt16LE(0, 20);

      return Buffer.concat([...localHeaders, ...cdHeaders, eocd]);
    }

    function escapeXml(str: string): string {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    }

    let documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Malgun Gothic" w:hAnsi="Malgun Gothic" w:eastAsia="Malgun Gothic"/><w:b/><w:sz w:val="36"/><w:color w:val="5B21B6"/></w:rPr>
        <w:t>AI Dream Teller 개발 프로젝트 전체 대화 기록</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Malgun Gothic" w:hAnsi="Malgun Gothic" w:eastAsia="Malgun Gothic"/><w:sz w:val="20"/><w:color w:val="6B7280"/></w:rPr>
        <w:t>생성 일시: ${escapeXml(new Date().toLocaleString("ko-KR"))} | 총 대화 항목: ${history.length}개</w:t>
      </w:r>
    </w:p>
`;

    history.forEach((entry, idx) => {
      const isUser = entry.role.includes("사용자");
      const roleColor = isUser ? "6D28D9" : "047857";
      const bgColor = isUser ? "F5F3FF" : "F0FDF4";

      documentXml += `
    <w:p>
      <w:pPr>
        <w:pBdr><w:left w:val="single" w:sz="36" w:space="12" w:color="${roleColor}"/></w:pBdr>
        <w:shd w:val="clear" w:color="auto" w:fill="${bgColor}"/>
        <w:spacing w:before="240" w:after="60"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Malgun Gothic" w:hAnsi="Malgun Gothic" w:eastAsia="Malgun Gothic"/><w:b/><w:sz w:val="24"/><w:color w:val="${roleColor}"/></w:rPr>
        <w:t>[${idx + 1}] ${escapeXml(entry.role)}</w:t>
      </w:r>
    </w:p>
`;

      const textLines = entry.text.split("\n");
      textLines.forEach((l) => {
        documentXml += `
    <w:p>
      <w:pPr>
        <w:pBdr><w:left w:val="single" w:sz="36" w:space="12" w:color="${roleColor}"/></w:pBdr>
        <w:shd w:val="clear" w:color="auto" w:fill="${bgColor}"/>
        <w:spacing w:before="0" w:after="40"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Malgun Gothic" w:hAnsi="Malgun Gothic" w:eastAsia="Malgun Gothic"/><w:sz w:val="21"/><w:color w:val="1F2937"/></w:rPr>
        <w:t xml:space="preserve">${escapeXml(l)}</w:t>
      </w:r>
    </w:p>
`;
      });
    });

    documentXml += `
  </w:body>
</w:document>
`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const docxBuffer = createZip([
      { path: "[Content_Types].xml", data: contentTypesXml },
      { path: "_rels/.rels", data: relsXml },
      { path: "word/document.xml", data: documentXml },
    ]);

    const projectDir = process.cwd();
    const realDocxPath = path.join(projectDir, "AI_Dream_Teller_전체_대화_록.docx");
    const realDocPath = path.join(projectDir, "AI_Dream_Teller_전체_대화_록.doc");
    const realPdfPath = path.join(projectDir, "AI_Dream_Teller_전체_대화_록.pdf");

    // Write OpenXML docx
    fs.writeFileSync(realDocxPath, docxBuffer);

    // Save Word-compatible HTML .doc
    let htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>AI Dream Teller 개발 프로젝트 전체 대화 기록</title>
  <style>
    body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.6; color: #1f2937; margin: 30px; }
    h1 { color: #5b21b6; border-bottom: 3px solid #8b5cf6; padding-bottom: 10px; font-size: 20px; text-align: center; }
    .item { margin-bottom: 20px; padding: 14px; border-radius: 10px; }
    .user { background-color: #f5f3ff; border-left: 5px solid #7c3aed; }
    .assistant { background-color: #f0fdf4; border-left: 5px solid #059669; }
    .role { font-weight: bold; font-size: 13px; margin-bottom: 6px; }
    .user .role { color: #6d28d9; }
    .assistant .role { color: #047857; }
    .content { white-space: pre-wrap; word-break: break-word; font-size: 11px; }
    hr { border: 0; height: 1px; background: #e5e7eb; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>AI Dream Teller 개발 프로젝트 전체 대화 기록</h1>
  <div style="text-align:center; color:#6b7280; font-size:11px;">생성 일시: ${new Date().toLocaleString("ko-KR")}</div>
  <hr>
`;

    history.forEach((entry, idx) => {
      const isUser = entry.role.includes("사용자");
      const className = isUser ? "user" : "assistant";
      const safeText = escapeXml(entry.text);

      htmlContent += `
    <div className="${className}">
      <div className="role">[${idx + 1}] ${entry.role}</div>
      <div className="content">${safeText}</div>
    </div>
  `;
    });

    htmlContent += `</body></html>`;
    fs.writeFileSync(realDocPath, htmlContent, "utf-8");

    // Save PDF
    function buildPDFBuffer(title: string, historyItems: Array<{ role: string; text: string }>): Buffer {
      let pdfString = `%PDF-1.4\n`;
      pdfString += `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
      pdfString += `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
      pdfString += `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
      pdfString += `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;

      let streamText = `BT /F1 16 Tf 50 800 TD (${title}) Tj ET\n`;
      streamText += `BT /F1 10 Tf 50 780 TD (Total Entries: ${historyItems.length}) Tj ET\n`;

      let y = 750;
      historyItems.slice(0, 15).forEach((item, idx) => {
        if (y < 50) return;
        const roleText = `[${idx + 1}] ${item.role.includes("사용자") ? "User" : "Antigravity AI"}`;
        const cleanSnippet = item.text.replace(/[^a-zA-Z0-9\s.,!?\-]/g, " ").substring(0, 70);
        streamText += `BT /F1 10 Tf 50 ${y} TD (${roleText}: ${cleanSnippet}...) Tj ET\n`;
        y -= 45;
      });

      pdfString += `5 0 obj\n<< /Length ${Buffer.byteLength(streamText)} >>\nstream\n${streamText}\nendstream\nendobj\n`;
      pdfString += `xref\n0 6\n0000000000 65535 f \n0000000010 0000 n \n0000000059 0000 n \n0000000116 0000 n \n0000000245 0000 n \n0000000324 0000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n450\n%%EOF\n`;

      return Buffer.from(pdfString, "utf-8");
    }

    const pdfBuf = buildPDFBuffer("AI Dream Teller Conversation Log", history);
    fs.writeFileSync(realPdfPath, pdfBuf);

    return NextResponse.json({
      success: true,
      docxSize: docxBuffer.length,
      docSize: Buffer.byteLength(htmlContent),
      pdfSize: pdfBuf.length,
      itemCount: history.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.stack || err.message }, { status: 500 });
  }
}
