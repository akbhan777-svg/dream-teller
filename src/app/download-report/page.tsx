import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import { parseFullTranscript } from "@/lib/report-generator";

export const metadata = {
  title: "대화 전체 내역 리포트 다운로드 - Dream Teller",
  description: "처음부터 지금까지 작성된 모든 프롬프트 질문과 답변 전체 내역을 Word, PDF, HTML로 다운로드합니다.",
};

export default function DownloadReportPage() {
  const dialogues = parseFullTranscript();

  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-4 md:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-dream-purple/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dream-purple/20 border border-dream-purple/30 text-dream-pink-light text-xs font-bold mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>전체 대화 기록 리포트 센터</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              개발 대화 내역 전체 다운로드
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              첫 번째 질문부터 현재 시점까지 주고받은 모든 프롬프트 및 답변 {dialogues.length}건이 누락 없이 통합 작성되었습니다.
            </p>
          </div>

          <Link href="/">
            <Button variant="outline" className="border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" /> 메인으로 돌아가기
            </Button>
          </Link>
        </div>

        {/* Download Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* MS Word (.docx) */}
          <div className="bg-[#18181b]/90 border border-dream-purple/30 rounded-2xl p-6 shadow-xl space-y-4 hover:border-dream-purple/60 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Word 문서 (.docx)
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">MS Word 리포트 다운로드</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                마이크로소프트 워드에서 원본 스타일(컬러 강조, 표 레이아웃, 줄바꿈) 그대로 바로 편집 및 열람이 가능한 지정 .docx 파일입니다.
              </p>
            </div>
            <a href="/api/download-report?format=docx" download className="block">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                <Download className="w-4 h-4" /> Word (.docx) 파일 다운로드
              </Button>
            </a>
          </div>

          {/* PDF (.pdf) */}
          <div className="bg-[#18181b]/90 border border-dream-pink/30 rounded-2xl p-6 shadow-xl space-y-4 hover:border-dream-pink/60 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center">
                <Printer className="w-6 h-6 text-pink-400" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                PDF 문서 (.pdf)
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">PDF 문서 다운로드 / 저장</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                브라우저 인쇄 모드를 통해 깨끗한 맑은 고딕 한글 폰트가 적용된 고화질 PDF 파일로 바로 저장하거나 다운로드합니다.
              </p>
            </div>
            <a href="/api/download-report?format=pdf" target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                <Printer className="w-4 h-4" /> PDF 문서 생성 및 저장
              </Button>
            </a>
          </div>

        </div>

        {/* Local Files Info Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-dream-purple-light font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>로컬 파일 저장 위치 안내</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            웹 브라우저 다운로드 버튼 외에도, 프로젝트 로컬 폴더에 동일한 파일이 실시간 저장되었습니다.
          </p>
          <div className="bg-black/50 p-4 rounded-xl text-xs font-mono text-slate-300 space-y-1.5 overflow-x-auto border border-white/5">
            <div>📁 <strong>Word 파일 경로:</strong> <span className="text-green-400">c:\Users\user\Desktop\indivi\AI수익화\결제 수익화런칭\dream-teller\public\downloads\dream_teller_chat_report.docx</span></div>
            <div>📁 <strong>HTML/PDF 파일 경로:</strong> <span className="text-green-400">c:\Users\user\Desktop\indivi\AI수익화\결제 수익화런칭\dream-teller\public\downloads\dream_teller_chat_report.html</span></div>
          </div>
        </div>

        {/* Preview List */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>포함된 대화 내역 목록 ({dialogues.length}건)</span>
          </h2>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {dialogues.map((d) => (
              <div key={d.index} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-pink-400 font-bold">
                  <span>Q{d.index}. 질문</span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-2 font-medium">
                  {d.question}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
