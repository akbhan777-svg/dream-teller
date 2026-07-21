import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "이용약관 | Dream Teller",
  description: "Dream Teller 서비스의 이용 약관 및 운영 정책을 상세히 안내해 드립니다.",
};

export default function TermsPage() {
  const lastUpdated = "2026년 7월 15일";

  return (
    <main className="min-h-screen bg-background relative overflow-hidden pt-28 pb-20 px-4">
      {/* Background Aurora / Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-dream-purple/10 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[7000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-dream-blue/10 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[9000ms]" />

      <div className="container relative z-10 mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        {/* Card Wrapper */}
        <div className="rounded-2xl border border-white/10 bg-[#1f1f2e] p-6 md:p-10 shadow-[0_0_30px_rgba(139,92,246,0.1)] space-y-8">
          
          {/* Header */}
          <div className="border-b border-white/10 pb-6">
            <div className="inline-flex p-3 bg-dream-purple/20 rounded-2xl mb-4 border border-dream-purple/30">
              <Scale className="w-6 h-6 text-dream-purple-light" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">이용약관</h1>
            <p className="text-xs text-slate-400">최근 수정일: {lastUpdated}</p>
          </div>

          {/* Terms Contents */}
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                제1조 (목적)
              </h2>
              <p>
                본 약관은 Dream Teller(이하 "회사")가 운영하는 AI 기반 꿈 해석 리포트 서비스 및 부가 시스템의 이용과 관련하여, 회사와 서비스 이용자(회원 및 비회원 포함, 이하 "이용자") 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                제2조 (용어의 정의)
              </h2>
              <p>
                본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong>서비스:</strong> 이용자가 작성한 꿈의 서사를 바탕으로 AI가 심층 분석 텍스트 및 시각화 이미지를 생산해 제공하는 리포팅 시스템 일체를 말합니다.</li>
                <li><strong>이용자:</strong> 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 회원 및 비회원 고객을 의미합니다.</li>
                <li><strong>해석권(Pass):</strong> 서비스 내에서 AI 꿈 해몽 리포트를 열람하거나 신청하기 위해 지불하는 가상의 분석 횟수 차감 단위를 뜻합니다.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                제3조 (결제 및 환불 규정)
              </h2>
              <p>
                회사는 정당한 대금 결제를 토스페이먼츠(Toss Payments) 위젯 대행을 통해 연동 지원하며, 환불 및 취소 조항은 아래 기준에 근거합니다.
              </p>
              <div className="bg-[#13131b] border border-white/10 rounded-xl p-4 space-y-2">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-dream-blue-light mt-1 flex-shrink-0" />
                  <span><strong>분석 시작 전 환불:</strong> 구매 후 AI 연산(분석 처리중)이 시작되지 않은 횟수권 상태에서는 7일 이내에 전액 결제 취소 요청이 가능합니다.</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-dream-blue-light mt-1 flex-shrink-0" />
                  <span><strong>환불 불가 조건:</strong> AI 분석 파이프라인이 기동되어 연산이 완료된 1회성 완성본 리포트에 대해서는 디지털 콘텐츠 특성상 중도 청약철회 및 대금 반환이 절대 불가합니다.</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-dream-blue-light mt-1 flex-shrink-0" />
                  <span><strong>다회권의 부분 환불:</strong> 패키지 횟수권 이용 도중 잔여 횟수를 취소 요청할 시, 사용한 횟수만큼의 단판 원가(1,500원 기준)를 차감한 잔여액을 환급해 드립니다.</span>
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                제4조 (AI 결과물의 저작권 귀속 및 권한)
              </h2>
              <p>
                본 서비스를 통해 발급되는 AI 생성 텍스트 리포트 및 시각화 생성 이미지의 소유 및 귀속 권한은 다음과 같습니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>이용자가 직접 서술하여 제공한 꿈 일기의 저작권은 전적으로 해당 이용자에게 귀속됩니다.</li>
                <li>AI 모델(Gemini 등)을 통해 산출된 2차적 이미지 및 해몽 텍스트 분석에 대해서, 이용자는 개인적 보관, 복제, 소셜 미디어 공유 등의 목적으로 비상업적 한도 내에서 영구적 사용 권한을 가집니다.</li>
                <li>분석물을 상업적 용도(도서 인쇄, 유료 배포, 광고 인쇄 등)로 전재 시에는 사전에 회사 측과 서면 합의를 거쳐야 합니다.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                제5조 (면책 조항)
              </h2>
              <p>
                회사는 AI 연산의 기술적 특성을 고려하여 아래의 상황에 면책 권한을 가집니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Dream Teller 리포트는 정서 안정을 위한 분석 및 조언을 목표로 설계되었으며, 정신과 전문의의 의학적 진단이나 심리 처방을 대체하지 않습니다.</li>
                <li>네트워크 및 클라우드(API 제공사) 인프라 장애로 인한 생성 지연이나 이미지 왜곡 결과에 대해 회사는 즉각적인 재처리를 수행하되 책임을 가중하지 않습니다.</li>
              </ul>
            </section>

          </div>

          {/* Footer Navigation */}
          <div className="border-t border-white/10 pt-6 flex items-center justify-between">
            <Link href="/privacy" className="text-xs text-slate-400 hover:text-white transition-colors underline decoration-dotted">
              개인정보처리방침 보러가기
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-xs text-dream-purple-light hover:text-white hover:bg-white/5 cursor-pointer">
                결제/서비스 정책 문의하기
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
