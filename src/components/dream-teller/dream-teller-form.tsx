"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Sparkles, Brain, Moon, Eye, CheckCircle2, Phone, Lock, EyeOff, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;
type ExpertField = "freud" | "jung" | "neuroscience" | "gestalt" | null;
type PaymentOption = "single" | "pass5" | "pass10" | "use_pass" | null;

const EXPERTS = [
  { id: "freud", name: "프로이트", desc: "무의식의 억압된 욕망과 상징을 해독합니다.", icon: Eye },
  { id: "jung", name: "칼 융", desc: "인류 보편의 원형과 집단 무의식을 탐구합니다.", icon: Moon },
  { id: "neuroscience", name: "신경과학", desc: "뇌의 기억 처리와 신경학적 신호로 분석합니다.", icon: Brain },
  { id: "gestalt", name: "게슈탈트", desc: "현재의 감정과 형태주의적 자각을 중심으로 봅니다.", icon: Sparkles },
];

export default function DreamTellerForm() {
  const [activeStep, setActiveStep] = useState<Step>(1);
  const [expandAll, setExpandAll] = useState(false);

  // 테스트 및 세션 시뮬레이션을 위한 로그인 여부 상태 (기본값: 비로그인 상태)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form State
  const [expert, setExpert] = useState<ExpertField>(null);
  const [dreamContent, setDreamContent] = useState("");
  const [includeImage, setIncludeImage] = useState(true);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("single");

  // 비회원 입력 정보 State
  const [guestPhone, setGuestPhone] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Refs for auto-scrolling
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Calculate total amount
  const calculateTotal = () => {
    if (paymentOption === "use_pass") return 0;
    if (paymentOption === "pass5") return 7200;
    if (paymentOption === "pass10") return 13500;
    // single
    return 1500 + (includeImage ? 500 : 0);
  };

  const scrollToStep = (step: Step) => {
    setTimeout(() => {
      if (step === 1 && step1Ref.current) step1Ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      if (step === 2 && step2Ref.current) step2Ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      if (step === 3 && step3Ref.current) step3Ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      if (step === 4 && step4Ref.current) step4Ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleNextStep = (nextStep: Step) => {
    setActiveStep(nextStep);
    if (!expandAll) {
      scrollToStep(nextStep);
    }
  };

  // 결제 옵션 선택 시 비회원은 즉시 Step 4로 화면 전환 처리
  const handlePaymentOptionSelect = (option: PaymentOption) => {
    setPaymentOption(option);
    if (!isLoggedIn) {
      setTimeout(() => handleNextStep(4), 300);
    }
  };

  // 휴대폰 번호 하이픈 자동 포맷터
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePayment = () => {
    const amount = calculateTotal();
    
    const searchParams = new URLSearchParams({
      amount: amount.toString(),
      plan: paymentOption || "single",
      expert: expert || "",
      isLoggedIn: isLoggedIn.toString(),
    });
    
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dreamContent", dreamContent);
      if (!isLoggedIn) {
        sessionStorage.setItem("guestPhone", guestPhone);
        sessionStorage.setItem("guestPassword", guestPassword);
      }
    }

    router.push(`/payments?${searchParams.toString()}`);
  };

  const isStepOpen = (step: Step) => expandAll || activeStep === step;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 relative pb-32">
      {/* 모두 펼쳐보기 및 회원/비회원 전환 토글 (테스트 목적) */}
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const nextVal = !isLoggedIn;
            setIsLoggedIn(nextVal);
            if (nextVal && activeStep === 4) {
              setActiveStep(3);
            }
          }}
          className="border-white/10 bg-black/40 text-slate-300 hover:text-white"
        >
          {isLoggedIn ? (
            <><UserCheck className="w-4 h-4 mr-2 text-dream-pink" /> 회원 모드 (Step 1~3)</>
          ) : (
            <><UserX className="w-4 h-4 mr-2 text-slate-400" /> 비회원 모드 (Step 1~4)</>
          )}
        </Button>

        <button
          onClick={() => setExpandAll(!expandAll)}
          className="text-sm text-dream-purple-light hover:text-white transition-colors flex items-center gap-2"
        >
          {expandAll ? "단계별로 보기" : "모두 펼쳐보기"}
          <ChevronDown className={cn("w-4 h-4 transition-transform", expandAll && "rotate-180")} />
        </button>
      </div>

      {/* Step 1: 전문가 선택 */}
      <div 
        ref={step1Ref} 
        className={cn(
          "rounded-2xl border transition-all duration-500 overflow-hidden", 
          isStepOpen(1) 
            ? "border-dream-purple/40 bg-[#1f1f2e] shadow-[0_0_30px_rgba(139,92,246,0.15)]" 
            : "border-white/10 bg-[#161622]/85 opacity-55 hover:opacity-85 hover:border-white/20 cursor-pointer"
        )} 
        onClick={() => !isStepOpen(1) && setActiveStep(1)}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-dream-purple/20 text-dream-purple-light text-sm">1</span>
              원하는 해몽 관점을 선택하세요
            </h2>
            {expert && !isStepOpen(1) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-normal bg-white/10 px-2.5 py-1 rounded-md border border-white/5">
                  {EXPERTS.find(e => e.id === expert)?.name || ""}
                </span>
                <CheckCircle2 className="w-5 h-5 text-dream-blue-light" />
                <span className="text-xs text-dream-purple-light hover:text-white transition-colors ml-1 font-semibold">펼쳐보기</span>
              </div>
            )}
          </div>
          
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 origin-top", isStepOpen(1) ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden m-0")}>
            {EXPERTS.map((exp) => (
              <button
                key={exp.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpert(exp.id as ExpertField);
                  setTimeout(() => handleNextStep(2), 300);
                }}
                className={cn(
                  "flex flex-col items-start p-6 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer",
                  expert === exp.id
                    ? "border-dream-blue bg-dream-blue/20 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                    : "border-white/20 bg-[#13131b] hover:bg-[#1a1a24] hover:border-white/30"
                )}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br from-dream-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity", expert === exp.id && "opacity-100")} />
                <exp.icon className={cn("w-8 h-8 mb-4 relative z-10", expert === exp.id ? "text-dream-blue-light" : "text-slate-400")} />
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">{exp.name}</h3>
                <p className="text-slate-400 text-sm relative z-10">{exp.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: 꿈 내용 입력 */}
      <div 
        ref={step2Ref} 
        className={cn(
          "rounded-2xl border transition-all duration-500 overflow-hidden", 
          isStepOpen(2) 
            ? "border-dream-purple/40 bg-[#1f1f2e] shadow-[0_0_30px_rgba(139,92,246,0.15)]" 
            : "border-white/10 bg-[#161622]/85 opacity-55 hover:opacity-85 hover:border-white/20 cursor-pointer",
          activeStep < 2 && !expandAll && "hidden"
        )} 
        onClick={() => !isStepOpen(2) && activeStep >= 2 && setActiveStep(2)}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-dream-purple/20 text-dream-purple-light text-sm">2</span>
              어떤 꿈을 꾸셨나요?
            </h2>
            {dreamContent.length >= 20 && !isStepOpen(2) && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-dream-blue-light" />
                <span className="text-xs text-dream-purple-light hover:text-white transition-colors ml-1 font-semibold">펼쳐보기</span>
              </div>
            )}
          </div>
          
          <div className={cn("transition-all duration-500 origin-top", isStepOpen(2) ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden m-0")}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue rounded-xl blur opacity-25 group-focus-within:opacity-60 transition duration-1000 group-focus-within:duration-200" />
              <textarea
                value={dreamContent}
                onChange={(e) => setDreamContent(e.target.value)}
                placeholder="꿈의 배경, 등장인물, 느꼈던 감정 등을 상세히 적어주시면 더 정확한 분석이 가능합니다. (최소 20자 이상)"
                className="relative w-full h-48 bg-[#13131b] text-white p-6 rounded-xl border border-white/20 focus:border-dream-purple focus:bg-[#0d0d12] focus:outline-none focus:ring-1 focus:ring-dream-purple resize-none placeholder:text-slate-500 text-lg leading-relaxed shadow-inner transition-all"
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className={cn("text-sm", dreamContent.length < 20 ? "text-dream-pink-light" : "text-slate-400")}>
                {dreamContent.length} / 최소 20자
              </span>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextStep(3);
                }} 
                disabled={dreamContent.length < 20}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
              >
                다음 단계로
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: 결제 옵션 */}
      <div 
        ref={step3Ref} 
        className={cn(
          "rounded-2xl border transition-all duration-500 overflow-hidden", 
          isStepOpen(3) 
            ? "border-dream-purple/40 bg-[#1f1f2e] shadow-[0_0_30px_rgba(139,92,246,0.15)]" 
            : "border-white/10 bg-[#161622]/85 opacity-55 hover:opacity-85 hover:border-white/20 cursor-pointer",
          activeStep < 3 && !expandAll && "hidden"
        )} 
        onClick={() => !isStepOpen(3) && activeStep >= 3 && setActiveStep(3)}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-dream-purple/20 text-dream-purple-light text-sm">3</span>
              결제 옵션 선택
            </h2>
            {paymentOption && !isStepOpen(3) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-normal bg-white/10 px-2.5 py-1 rounded-md border border-white/5">
                  {paymentOption === "single" ? "1회권" : paymentOption === "pass5" ? "5회권" : "10회권"}
                </span>
                <CheckCircle2 className="w-5 h-5 text-dream-blue-light" />
                <span className="text-xs text-dream-purple-light hover:text-white transition-colors ml-1 font-semibold">펼쳐보기</span>
              </div>
            )}
          </div>
          
          <div className={cn("transition-all duration-500 origin-top", isStepOpen(3) ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden m-0")}>
            <div className="space-y-4">
              {/* 단판 결제 */}
              <label className={cn("flex items-start justify-between p-5 rounded-xl border cursor-pointer transition-all", paymentOption === "single" ? "border-dream-blue bg-dream-blue/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]" : "border-white/20 bg-[#13131b] hover:bg-[#1a1a24] hover:border-white/30")}>
                <div className="flex items-start gap-4">
                  <input type="radio" name="payment" checked={paymentOption === "single"} onChange={() => handlePaymentOptionSelect("single")} className="mt-1 w-4 h-4 accent-dream-blue" />
                  <div>
                    <h3 className="text-lg font-bold text-white">1회 해석권 (단판)</h3>
                    <p className="text-slate-400 text-sm mt-1">꿈 1개에 대한 심층 분석 리포트를 제공합니다.</p>
                    
                    {/* 이미지 추가 옵션 (단판 선택시에만 활성화) */}
                    {paymentOption === "single" && (
                      <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" id="includeImage" checked={includeImage} onChange={(e) => setIncludeImage(e.target.checked)} className="w-4 h-4 accent-dream-pink" />
                        <label htmlFor="includeImage" className="text-sm text-slate-300 cursor-pointer flex-1">
                          AI 시각화 이미지 추가 (+500원)
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">1,500원</div>
                </div>
              </label>

              {/* 5회권 */}
              <label className={cn("flex items-start justify-between p-5 rounded-xl border cursor-pointer transition-all relative overflow-hidden", paymentOption === "pass5" ? "border-dream-purple bg-dream-purple/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]" : "border-white/20 bg-[#13131b] hover:bg-[#1a1a24] hover:border-white/30")}>
                <div className="absolute top-0 right-0 bg-dream-purple text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md z-10">4% 할인 + 이미지 무료</div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />
                <div className="flex items-start gap-4 relative z-10">
                  <input type="radio" name="payment" checked={paymentOption === "pass5"} onChange={() => handlePaymentOptionSelect("pass5")} className="mt-1 w-4 h-4 accent-dream-purple" />
                  <div>
                    <h3 className="text-lg font-bold text-white">5회 해석권 (다회권)</h3>
                    <p className="text-slate-400 text-sm mt-1">회원 전용 할인 요금제. 이미지 생성 옵션이 무료로 포함됩니다.</p>
                  </div>
                </div>
                <div className="text-right mt-6 relative z-10">
                  <div className="text-sm text-slate-500 line-through">7,500원</div>
                  <div className="text-xl font-bold text-dream-purple-light">7,200원</div>
                </div>
              </label>

              {/* 10회권 */}
              <label className={cn("flex items-start justify-between p-5 rounded-xl border cursor-pointer transition-all relative overflow-hidden", paymentOption === "pass10" ? "border-dream-pink bg-dream-pink/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]" : "border-white/20 bg-[#13131b] hover:bg-[#1a1a24] hover:border-white/30")}>
                <div className="absolute top-0 right-0 bg-dream-pink text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md z-10">10% 할인 + 이미지 무료</div>
                <div className="flex items-start gap-4 relative z-10">
                  <input type="radio" name="payment" checked={paymentOption === "pass10"} onChange={() => handlePaymentOptionSelect("pass10")} className="mt-1 w-4 h-4 accent-dream-pink" />
                  <div>
                    <h3 className="text-lg font-bold text-white">10회 해석권 (다회권)</h3>
                    <p className="text-slate-400 text-sm mt-1">가장 높은 할인율. 이미지 생성 옵션이 무료로 포함됩니다.</p>
                  </div>
                </div>
                <div className="text-right mt-6 relative z-10">
                  <div className="text-sm text-slate-500 line-through">15,000원</div>
                  <div className="text-xl font-bold text-dream-pink-light">13,500원</div>
                </div>
              </label>
              
              {/* 유의사항 */}
              <div className="mt-6 p-4 rounded-lg bg-dream-blue/10 border border-dream-blue/30 text-sm text-slate-200">
                <p className="flex items-start gap-2">
                  <span className="mt-0.5 text-dream-blue-light">ℹ️</span>
                  <span>결제 후 보통 3분 이내에 생성이 완료됩니다. AI 분석 결과는 의학적 진단을 대체할 수 없습니다.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: 비회원 연락처 및 비밀번호 설정 (비회원 모드일 때만 노출) */}
      {!isLoggedIn && (
        <div 
          ref={step4Ref} 
          className={cn(
            "rounded-2xl border transition-all duration-500 overflow-hidden", 
            isStepOpen(4) 
              ? "border-dream-purple/40 bg-[#1f1f2e] shadow-[0_0_30px_rgba(139,92,246,0.15)]" 
              : "border-white/10 bg-[#161622]/85 opacity-55 hover:opacity-85 hover:border-white/20 cursor-pointer",
            activeStep < 4 && !expandAll && "hidden"
          )} 
          onClick={() => !isStepOpen(4) && activeStep >= 4 && setActiveStep(4)}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-dream-purple/20 text-dream-purple-light text-sm">4</span>
                비회원 정보 입력
              </h2>
              {guestPhone.length >= 12 && guestPassword.length >= 4 && !isStepOpen(4) && <CheckCircle2 className="w-6 h-6 text-dream-blue-light" />}
            </div>
            
            <div className={cn("transition-all duration-500 origin-top space-y-4", isStepOpen(4) ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden m-0")}>
              <p className="text-xs text-slate-400">
                결제 및 분석 완료 후, 해몽 보고서를 다시 열어볼 때 사용할 연락처와 비밀번호를 설정해 주세요.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 px-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-dream-purple-light" /> 전화번호</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(formatPhoneNumber(e.target.value))}
                    maxLength={13}
                    placeholder="010-1234-5678"
                    className="w-full bg-[#13131b] text-white p-3.5 rounded-xl border border-white/20 focus:border-dream-purple focus:bg-[#0d0d12] focus:outline-none text-sm placeholder:text-slate-500 shadow-inner transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 px-1 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-dream-purple-light" /> 비밀번호 (4자리 이상)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={guestPassword}
                      onChange={(e) => setGuestPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-[#13131b] text-white p-3.5 rounded-xl border border-white/20 focus:border-dream-purple focus:bg-[#0d0d12] focus:outline-none text-sm placeholder:text-slate-500 pr-10 shadow-inner transition-all"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassword(!showPassword);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-black/60 backdrop-blur-xl border-t border-white/10 animate-in slide-in-from-bottom-full duration-500">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">최종 결제 금액</p>
            <p className="text-2xl md:text-3xl font-black text-white">
              {calculateTotal().toLocaleString()}<span className="text-lg font-normal text-slate-300 ml-1">원</span>
            </p>
          </div>
          
          <button 
            onClick={(!isLoggedIn && activeStep === 3) ? () => handleNextStep(4) : handlePayment}
            disabled={
              !expert || 
              dreamContent.length < 20 || 
              (!isLoggedIn && activeStep === 4 && (guestPhone.length < 12 || guestPassword.length < 4))
            }
            className="group relative inline-flex p-[2px] rounded-full bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
            <div className="relative bg-background/80 backdrop-blur-md text-white font-bold px-8 py-3 md:px-12 md:py-4 rounded-full border border-white/5 transition-all z-10 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>
                {!isLoggedIn && activeStep === 3 ? "연락처 입력하기" : "결제하기"}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
