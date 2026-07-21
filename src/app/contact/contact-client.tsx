"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, MessageCircle, HelpCircle, Mail, User, 
  MenuSquare, Send, CheckCircle2, ChevronDown, Sparkles, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

export default function ContactClient() {
  const router = useRouter();
  
  // FAQ 목록 데이터
  const faqList: FAQItem[] = [
    {
      question: "AI 분석 및 리포트 완성은 평균 몇 분 정도 소요되나요?",
      answer: "보통 결제가 성공적으로 처리된 뒤 3분 내에 모든 분석 텍스트 도출 및 DALL-E 기반 이미지 시각화가 완료됩니다. AI 파이프라인 연산이 끝나는 대로 보고서 페이지가 자동으로 완성되어 나타납니다."
    },
    {
      question: "결제가 완료되었는데 보고서 페이지가 열리지 않고 멈춰있습니다.",
      answer: "일시적인 클라우드 서버나 API 제공 업체의 일시적 네트워크 지연일 수 있습니다. 본 문의하기 페이지 하단의 접수 폼을 통해 주문 번호와 결제 연락처를 적어 제출해 주시면 24시간 내에 결과를 즉시 복구해 드리거나 수동 복원을 진행해 드립니다."
    },
    {
      question: "비회원 결제인데 보고서 확인 링크(URL)를 잃어버렸습니다.",
      answer: "비회원 유저이시더라도 결제 4단계에서 직접 설정하셨던 '전화번호'와 '비밀번호 4자리'만 있으면 언제든 다시 열람하실 수 있습니다. 우측 상단의 비회원 로그인(/guest-login) 페이지로 가셔서 로그인하시면 이전 해몽 내역을 안전하게 모아서 조회하실 수 있습니다."
    },
    {
      question: "결제 취소 또는 전액 환불은 어떻게 신청하나요?",
      answer: "AI 연산 파이프라인이 즉시 기동되기 전(결제 완료 직후 상태)에는 전액 즉시 환불이 가능합니다. 단, 이미 AI 연산이 완료되어 텍스트 해몽 및 이미지가 완전히 추출된 리포트에 대해서는 디지털 콘텐츠 특성상 환불이 불가합니다. 세부 조항은 이용약관 제3조를 참고 바랍니다."
    }
  ];

  // FAQ 아코디언 상태 관리 (인덱스)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // 문의하기 입력 폼 상태
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("inquiry");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !name || !content) {
      setError("모든 필수 입력란을 채워주세요.");
      return;
    }

    setIsLoading(true);

    // 문의 접수 가상 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessModal(true);
      // 입력 폼 클리어
      setEmail("");
      setName("");
      setContent("");
      setCategory("inquiry");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        홈으로 돌아가기
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: FAQ (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex p-2.5 bg-dream-purple/20 rounded-xl border border-dream-purple/30">
              <HelpCircle className="w-5 h-5 text-dream-purple-light" />
            </div>
            <h2 className="text-xl font-bold text-white">자주 묻는 질문 (FAQ)</h2>
          </div>

          <div className="space-y-3">
            {faqList.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className={cn(
                    "rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer",
                    isOpen 
                      ? "border-dream-purple/40 bg-[#1f1f2e] shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
                      : "border-white/10 bg-[#161622]/85 hover:border-white/20"
                  )}
                  onClick={() => toggleFaq(idx)}
                >
                  {/* FAQ Header */}
                  <div className="p-5 flex items-center justify-between gap-4">
                    <h4 className="text-sm font-bold text-white group-hover:text-dream-purple-light transition-colors leading-relaxed">
                      {faq.question}
                    </h4>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0", isOpen && "rotate-180 text-dream-purple-light")} />
                  </div>

                  {/* FAQ Content */}
                  <div 
                    className={cn(
                      "transition-all duration-300 origin-top overflow-hidden",
                      isOpen ? "max-h-[300px] opacity-100 border-t border-white/5 bg-[#13131b]/50" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="p-5 text-xs text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Inquiry Form (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex p-2.5 bg-dream-pink/20 rounded-xl border border-dream-pink/30">
              <MessageCircle className="w-5 h-5 text-dream-pink-light" />
            </div>
            <h2 className="text-xl font-bold text-white">1:1 문의 접수</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#1f1f2e] p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 px-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-dream-purple-light" /> 이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  placeholder="홍길동"
                  disabled={isLoading}
                  className="w-full bg-[#13131b] text-white p-3.5 rounded-xl border border-white/20 focus:border-dream-purple focus:bg-[#0d0d12] focus:outline-none text-xs placeholder:text-slate-500 shadow-inner transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 px-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-dream-purple-light" /> 회신받을 이메일 주소
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="dreamer@example.com"
                  disabled={isLoading}
                  className="w-full bg-[#13131b] text-white p-3.5 rounded-xl border border-white/20 focus:border-dream-purple focus:bg-[#0d0d12] focus:outline-none text-xs placeholder:text-slate-500 shadow-inner transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 px-1 flex items-center gap-1.5">
                  <MenuSquare className="w-3.5 h-3.5 text-dream-purple-light" /> 문의 유형
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-[#13131b] text-white p-3.5 rounded-xl border border-white/20 focus:border-dream-purple focus:outline-none text-xs shadow-inner cursor-pointer"
                >
                  <option value="inquiry">일반 문의</option>
                  <option value="payment">결제 오류 / 위젯 문의</option>
                  <option value="refund">환불 / 취소 요청</option>
                  <option value="other">기타</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 px-1 flex items-center gap-1.5">
                  상세 문의 내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => { setContent(e.target.value); setError(""); }}
                  placeholder="문의하실 상세 내용을 적어주세요. 결제 취소 요청 시 '주문 번호' 또는 '전화번호'를 남겨주시면 더 신속한 처리가 가능합니다."
                  disabled={isLoading}
                  rows={5}
                  className="w-full bg-[#13131b] text-white p-4 rounded-xl border border-white/20 focus:border-dream-purple focus:bg-[#0d0d12] focus:outline-none text-xs placeholder:text-slate-500 shadow-inner resize-none transition-all leading-relaxed"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 font-semibold px-1">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-dream-purple to-dream-blue hover:opacity-90 text-white font-bold py-5 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>접수하는 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>문의 접수하기</span>
                  </>
                )}
              </Button>

            </form>
          </div>
        </div>

      </div>

      {/* Floating Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#1f1f2e] p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="mx-auto w-12 h-12 rounded-full bg-dream-blue/20 flex items-center justify-center mb-4 border border-dream-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <CheckCircle2 className="w-6 h-6 text-dream-blue-light" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">문의 접수 완료</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              1:1 문의가 안전하게 접수되었습니다.<br />
              기재해주신 메일 주소로 영업일 기준 24시간 이내에 성심껏 회신해 드리겠습니다.
            </p>

            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-dream-purple to-dream-blue hover:opacity-90 text-white font-semibold py-3.5 rounded-xl cursor-pointer text-xs"
            >
              확인
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
