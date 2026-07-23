import os
import json
import re

# 1. 한국어 맑은 고딕 폰트 경로 (Windows 표준)
FONT_PATH = "C:\\Windows\\Fonts\\malgun.ttf"

def parse_transcript():
    transcript_path = r"C:\Users\user\.gemini\antigravity-ide\brain\4315ab1d-5e8d-40bc-a4da-502b2128c005\.system_generated\logs\transcript_full.jsonl"
    if not os.path.exists(transcript_path):
        transcript_path = r"C:\Users\user\.gemini\antigravity-ide\brain\4315ab1d-5e8d-40bc-a4da-502b2128c005\.system_generated\logs\transcript.jsonl"
        if not os.path.exists(transcript_path):
            print("대화 기록 로그 파일을 찾을 수 없습니다.")
            return []

    dialogues = []
    current_user_request = None

    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                # 유저 입력 추출
                if data.get("type") == "USER_INPUT":
                    content = data.get("content", "")
                    # XML 태그 제거 (<USER_REQUEST> 등)
                    content = re.sub(r'<[^>]+>', '', content).strip()
                    if content and "CHECKPOINT" not in content:
                        current_user_request = content
                # 에이전트 답변 추출
                elif data.get("type") == "PLANNER_RESPONSE" and current_user_request:
                    response = data.get("content", "")
                    if response:
                        # 마크다운 특수문자나 복잡한 링크들 가독성 좋게 파싱
                        response = re.sub(r'\[([^\]]+)\]\(file:///[^\)]+\)', r'\1', response)
                        dialogues.append({
                            "question": current_user_request,
                            "answer": response.strip()
                        })
                        current_user_request = None
            except Exception as e:
                continue
    return dialogues

def generate_docx(dialogues, output_path):
    try:
        from docx import Document
        from docx.shared import Pt, RGBColor
        from docx.oxml import OxmlElement
        from docx.oxml.ns import qn
    except ImportError:
        print("python-docx 라이브러리가 설치되어 있지 않습니다. 'pip install python-docx'를 실행해 주세요.")
        return False

    doc = Document()
    
    # 기본 스타일 설정
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Malgun Gothic'
    font.size = Pt(10.5)
    
    # 제목 추가
    title = doc.add_paragraph()
    title_run = title.add_run("Dream Teller 개발 대화 기록 및 질의응답 리포트")
    title_run.font.name = 'Malgun Gothic'
    title_run.font.size = Pt(18)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(79, 70, 229) # Purple
    import datetime
    today_str = datetime.datetime.now().strftime("%Y년 %m월 %d일")
    doc.add_paragraph(f"작성일자: {today_str}\n")

    for idx, item in enumerate(dialogues, 1):
        # 질문 섹션
        q_p = doc.add_paragraph()
        q_run = q_p.add_run(f"Q{idx}. [질문] {item['question']}")
        q_run.font.bold = True
        q_run.font.size = Pt(12)
        q_run.font.color.rgb = RGBColor(219, 39, 119) # Pink
        
        # 답변 섹션
        a_p = doc.add_paragraph()
        a_run = a_p.add_run(f"[답변]\n{item['answer']}\n")
        a_run.font.size = Pt(10.5)
        
        # 구분선 추가
        doc.add_paragraph("-" * 80)
        
    doc.save(output_path)
    print(f"Word 파일 생성 완료: {output_path}")
    return True

def generate_pdf(dialogues, output_path):
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttcharts import TTFont
    except ImportError as e:
        print(f"reportlab 라이브러리가 설치되어 있지 않거나 불러오는데 실패했습니다 (상세 오류: {e})")
        print("만약 python-docx는 로드되었으나 reportlab 로드에 실패했다면, Python 버전(예: 3.14 alpha)과의 호환성 문제 또는 Pillow 라이브러리 연동 장애일 수 있습니다.")
        return False

    if not os.path.exists(FONT_PATH):
        print(f"시스템 폰트를 찾을 수 없습니다: {FONT_PATH}")
        return False

    # 맑은 고딕 폰트 등록 (한글 깨짐 방지)
    pdfmetrics.registerFont(TTFont('Malgun', FONT_PATH))

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # 커스텀 한글 스타일 정의
    title_style = ParagraphStyle(
        'PDFTitle',
        parent=styles['Heading1'],
        fontName='Malgun',
        fontSize=18,
        textColor=colors.HexColor('#4f46e5'),
        spaceAfter=20
    )
    
    q_style = ParagraphStyle(
        'PDFQuestion',
        parent=styles['Heading3'],
        fontName='Malgun',
        fontSize=11,
        textColor=colors.HexColor('#db2777'),
        spaceBefore=12,
        spaceAfter=6,
        leading=15
    )

    a_style = ParagraphStyle(
        'PDFAnswer',
        parent=styles['Normal'],
        fontName='Malgun',
        fontSize=9.5,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=12,
        leading=14
    )

    meta_style = ParagraphStyle(
        'PDFMeta',
        parent=styles['Normal'],
        fontName='Malgun',
        fontSize=9,
        textColor=colors.HexColor('#6b7280'),
        spaceAfter=15
    )

    elements = []
    elements.append(Paragraph("Dream Teller 개발 대화 기록 및 질의응답 리포트", title_style))
    import datetime
    today_str = datetime.datetime.now().strftime("%Y년 %m월 %d일")
    elements.append(Paragraph(f"작성일자: {today_str}", meta_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb'), spaceAfter=15))

    for idx, item in enumerate(dialogues, 1):
        # 질문 내용 포맷팅 (개행 및 특수문자 보호)
        q_text = f"Q{idx}. [질문] {item['question']}".replace("\n", "<br/>")
        elements.append(Paragraph(q_text, q_style))
        
        # 답변 내용 포맷팅
        a_text = f"[답변]<br/>{item['answer']}".replace("\n", "<br/>")
        elements.append(Paragraph(a_text, a_style))
        
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#f3f4f6'), spaceBefore=10, spaceAfter=10))

    doc.build(elements)
    print(f"PDF 파일 생성 완료: {output_path}")
    return True

def generate_html(dialogues, output_path):
    html_content = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dream Teller 개발 대화 기록 및 질의응답 리포트</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700;900&display=swap');
        body {{
            font-family: 'Noto Sans KR', sans-serif;
            background-color: #f9fafb;
            color: #1f2937;
            line-height: 1.7;
            padding: 40px 20px;
            max-width: 800px;
            margin: 0 auto;
        }}
        .header {{
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        h1 {{
            color: #4f46e5;
            font-size: 28px;
            font-weight: 900;
            margin: 0 0 10px 0;
        }}
        .meta {{
            font-size: 14px;
            color: #6b7280;
        }}
        .item {{
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #f3f4f6;
        }}
        .question {{
            color: #db2777;
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 15px;
            background-color: #fdf2f8;
            padding: 12px 18px;
            border-left: 4px solid #db2777;
            border-radius: 4px;
        }}
        .answer {{
            font-size: 14.5px;
            white-space: pre-wrap;
            padding: 5px 10px;
        }}
        @media print {{
            body {{
                background-color: #ffffff;
                padding: 0;
            }}
            .question {{
                background-color: #fdf2f8 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Dream Teller 개발 대화 기록 및 질의응답 리포트</h1>
        <div class="meta">작성일자: 2026년 7월 18일</div>
    </div>
    import datetime
    today_str = datetime.datetime.now().strftime("%Y년 %m월 %d일")
    html_content = html_content.replace("2026년 7월 18일", today_str)
    
    for idx, item in enumerate(dialogues, 1):
        q_text = item['question'].replace('<', '&lt;').replace('>', '&gt;')
        a_text = item['answer'].replace('<', '&lt;').replace('>', '&gt;')
        html_content += f"""
    <div class="item">
        <div class="question">Q{idx}. [질문] {q_text}</div>
        <div class="answer">[답변]<br/>{a_text}</div>
    </div>
"""
    html_content += """
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"HTML 파일 생성 완료: {output_path}")
    return True

if __name__ == "__main__":
    print("대화 트랜스크립트 파싱 중...")
    dialogues = parse_transcript()
    
    if not dialogues:
        print("기록된 대화 내역이 없습니다.")
    else:
        print(f"총 {len(dialogues)}개의 질의응답을 추출했습니다.")
        
        # 출력 경로 설정 (현재 워크스페이스 루트)
        docx_out = "dream_teller_chat_report.docx"
        pdf_out = "dream_teller_chat_report.pdf"
        html_out = "dream_teller_chat_report.html"
        
        # 파일 생성 기동
        generate_docx(dialogues, docx_out)
        pdf_success = generate_pdf(dialogues, pdf_out)
        generate_html(dialogues, html_out)
        
        print("\n==================================================")
        print("모든 리포트 파일 생성 프로세스가 완료되었습니다.")
        print("--------------------------------------------------")
        print(f"1. 워드 문서: {docx_out} (생성 성공)")
        print(f"2. HTML 인쇄용 문서: {html_out} (생성 성공)")
        if pdf_success:
            print(f"3. PDF 문서: {pdf_out} (생성 성공)")
        else:
            print("3. PDF 문서: (환경 오류로 생성 실패)")
            print("   -> 대안 해결책: 생성된 HTML 파일('dream_teller_chat_report.html')을")
            print("      크롬(Chrome)이나 엣지(Edge) 브라우저로 여신 뒤,")
            print("      [Ctrl + P] (인쇄) 단추를 누르고 'PDF로 저장'을 선택하시면")
            print("      가장 깨끗한 고화질 PDF 파일로 직접 다운로드(저장)하실 수 있습니다!")
        print("==================================================")
