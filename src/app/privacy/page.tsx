import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "개인정보처리방침 | Dream Teller",
  description: "Dream Teller 서비스의 개인정보 처리 방침을 투명하게 안내해 드립니다.",
};

export default function PrivacyPage() {
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
              <Shield className="w-6 h-6 text-dream-purple-light" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">개인정보처리방침</h1>
            <p className="text-xs text-slate-400">최근 수정일: {lastUpdated}</p>
          </div>

          {/* Policy Contents */}
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                1. 수집하는 개인정보 항목 및 수집 방법
              </h2>
              <p>
                회사는 비회원 주문 조회 및 회원 소셜 로그인 서비스를 제공하기 위해 아래와 같은 최소한의 개인정보를 수집하고 있습니다.
              </p>
              <div className="bg-[#13131b] border border-white/10 rounded-xl p-4 space-y-2">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-dream-blue-light mt-1 flex-shrink-0" />
                  <span><strong>비회원 서비스 이용 시:</strong> 연락처(전화번호), 비밀번호(조회 및 본인 확인용)</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-dream-blue-light mt-1 flex-shrink-0" />
                  <span><strong>회원 소셜 로그인 시:</strong> 소셜 제공기관(구글, 카카오)에서 제공하는 고유 식별 ID, 닉네임, 프로필 이메일 정보</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-dream-blue-light mt-1 flex-shrink-0" />
                  <span><strong>결제 시:</strong> 카드사 정보, 이메일, 승인 번호 등 결제대행업체(Toss Payments)로부터 전달되는 승인 정보</span>
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                2. 개인정보의 수집 및 이용 목적
              </h2>
              <p>
                수집된 개인정보는 다음의 목적을 위해서만 사용되며, 목적이 변경될 경우 사전 동의를 구할 예정입니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>비회원 구매 이력 조회 및 해몽 결과서 개별 식별용</li>
                <li>AI 기반 꿈 해석 및 이미지 시각화 결과물 전송 및 매핑</li>
                <li>구매 계약 이행 및 결제 대금 정산 처리</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                3. 개인정보의 제3자 제공 및 외부 API 전송
              </h2>
              <p>
                회사는 유저의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 핵심 AI 서비스 제공을 위해 최소한의 정보를 암호화하여 연동하고 있습니다.
              </p>
              <div className="bg-[#13131b] border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-2 text-xs font-semibold text-slate-400">
                  <span>제공받는 자 (서비스)</span>
                  <span>제공 목적 및 데이터</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-white font-medium">Google Gemini API</span>
                  <span className="text-slate-400">꿈 분석 텍스트 도출 (꿈 내용만 전달, 식별정보 미포함)</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-white font-medium">Toss Payments SDK</span>
                  <span className="text-slate-400">안전결제 위젯 연동 (주문 ID, 결제 가격)</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                4. 개인정보의 보유 및 이용 기간
              </h2>
              <p>
                원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 보존합니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                5. 개인정보 파기 절차 및 방법
              </h2>
              <p>
                회사는 개인정보 보존기간이 경과하거나 처리목적이 달성되었을 때는 지체 없이 해당 개인정보를 파기합니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 완전히 삭제합니다.</li>
                <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-dream-purple rounded-full" />
                6. 정보주체와 법정대리인의 권리·의무 및 행사방법
              </h2>
              <p>
                이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지 및 데이터 완전 삭제(탈퇴)를 요청할 수 있습니다. 
                비회원의 경우 언제든지 브라우저 임시 세션 삭제 혹은 문의하기 채널을 통해 본인 확인 후 이전 주문 내역의 완전 삭제를 요청하실 수 있습니다.
              </p>
            </section>

          </div>

          {/* Footer Navigation */}
          <div className="border-t border-white/10 pt-6 flex items-center justify-between">
            <Link href="/terms" className="text-xs text-slate-400 hover:text-white transition-colors underline decoration-dotted">
              이용약관 보러가기
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-xs text-dream-purple-light hover:text-white hover:bg-white/5 cursor-pointer">
                개인정보 관련 문의하기
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
