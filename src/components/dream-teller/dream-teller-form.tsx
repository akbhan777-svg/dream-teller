"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Sparkles, Brain, Moon, Eye, CheckCircle2, Phone, Lock, EyeOff, UserCheck, UserX, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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

  // 실제 Supabase 세션 기반 로그인 여부 상태 및 잔여 횟수 State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [remainingPasses, setRemainingPasses] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 세션 스토리지에서 보존된 데이터 복원
      const savedContent = sessionStorage.getItem("dreamContent");
      const savedPhone = sessionStorage.getItem("guestPhone") || sessionStorage.getItem("guestLoginPhone");
      const savedPassword = sessionStorage.getItem("guestPassword") || sessionStorage.getItem("guestLoginPassword");
      const isReinterpreting = sessionStorage.getItem("isReinterpreting") === "true";

      if (user) {
        setIsLoggedIn(true);
        // 회원인 경우 1단계를 자동으로 패스하고 바로 2단계(해몽 관점 선택)부터 활성화
        setActiveStep(2);
        if (savedContent && isReinterpreting) {
          setDreamContent(savedContent);
        }

        // DB에서 잔여 횟수 조회
        const { data: userData } = await supabase
          .from("users")
          .select("remaining_interprets")
          .eq("id", user.id)
          .single();
          
        if (userData) {
          const userRecord = userData as { remaining_interprets?: number };
          setRemainingPasses(userRecord.remaining_interprets || 0);
        }
      } else {
        setIsLoggedIn(false);
        setRemainingPasses(0);
        
        // 이미 비회원 주문 조회를 진행하여 세션이 존재하는 비회원 또는 재해몽 신청 시 1단계를 생략하고 바로 2단계로 이동
        if (savedPhone && savedPassword) {
          setGuestPhone(savedPhone);
          setGuestPassword(savedPassword);
          if (savedContent && isReinterpreting) {
            setDreamContent(savedContent);
          }
          setActiveStep(2);
        } else {
          // 세션 정보가 없는 최초 진입 비회원만 1단계부터 시작
          setActiveStep(1);
          setGuestPhone("");
          setGuestPassword("");
        }
      }

      // 참고: isReinterpreting 플래그는 여기서 지우지 않고 handlePayment(결제 완료 시점)에서 지움으로써
      // React Strict Mode의 useEffect 2회 실행 문제나 페이지 새로고침 시에도 UX가 유지되도록 함
    };
    checkAuth();
  }, [supabase]);

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

  const [showMemberOnlyModal, setShowMemberOnlyModal] = useState(false);

  // 결제 옵션 선택 시 비회원은 다회권(pass5, pass10) 제한 및 팝업 안내
  const handlePaymentOptionSelect = (option: PaymentOption) => {
    if (!isLoggedIn && (option === "pass5" || option === "pass10")) {
      setShowMemberOnlyModal(true);
      return;
    }
    setPaymentOption(option);
  };

  // 휴대폰 번호 하이픈 자동 포맷터
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePayment = () => {
    if (!isLoggedIn && (paymentOption === "pass5" || paymentOption === "pass10")) {
      setShowMemberOnlyModal(true);
      return;
    }

    const amount = calculateTotal();
    
    const searchParams = new URLSearchParams({
      amount: amount.toString(),
      plan: paymentOption || "single",
      expert: expert || "",
      isLoggedIn: isLoggedIn.toString(),
      includesImage: includeImage.toString(),
    });
    
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dreamContent", dreamContent);
      if (!isLoggedIn) {
        sessionStorage.setItem("guestPhone", guestPhone);
        sessionStorage.setItem("guestPassword", guestPassword);
      }
      // 결제 단계로 넘어가면 재해석 플래그 초기화
      sessionStorage.removeItem("isReinterpreting");
    }

    router.push(`/payments?${searchParams.toString()}`);
  };

  const isStepOpen = (step: Step) => expandAll || activeStep === step;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 relative pb-32">
      {/* 상단 컨트롤 영역 (모두 펼쳐보기) */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setExpandAll(!expandAll)}
          className="text-sm text-dream-purple-light hover:text-white transition-colors flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10"
        >
          {expandAll ? "단계별로 보기" : "모두 펼쳐보기"}
          <ChevronDown className={cn("w-4 h-4 transition-transform", expandAll && "rotate-180")} />
        </button>
      </div>

      {/* Step 1: 본인 인증 및 비회원 정보 입력 */}
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
              본인 확인 (로그인 또는 비회원)
            </h2>
            {((isLoggedIn) || (!isLoggedIn && guestPhone.length >= 12 && guestPassword.length >= 4)) && !isStepOpen(1) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-normal bg-white/10 px-2.5 py-1 rounded-md border border-white/5">
                  {isLoggedIn ? "회원 인증됨" : "비회원 정보 입력됨"}
                </span>
                <CheckCircle2 className="w-5 h-5 text-dream-blue-light" />
                <span className="text-xs text-dream-purple-light hover:text-white transition-colors ml-1 font-semibold">펼쳐보기</span>
              </div>
            )}
          </div>
          
          <div className={cn("transition-all duration-500 origin-top", isStepOpen(1) ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden m-0")}>
            {isLoggedIn ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                  <UserCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">회원 인증 완료</h3>
                  <p className="text-slate-400 text-sm mt-2">안전하게 해몽을 진행하실 수 있습니다.</p>
                </div>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextStep(2);
                  }}
                  className="mt-4 bg-gradient-to-r from-dream-purple to-dream-pink text-white px-8 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg"
                >
                  다음 단계로
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-5 rounded-xl border border-dream-blue/30 bg-dream-blue/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-dream-blue-light" />
                      회원이신가요? (소셜 3초 간편가입 포함)
                    </h3>
                    <p className="text-slate-300 text-sm mt-1">로그인 및 가입 시 작성 중인 데이터가 보존되며, 다회권 할인 혜택도 제공됩니다.</p>
                  </div>
                  <Button onClick={() => router.push("/auth")} className="whitespace-nowrap bg-dream-blue hover:bg-dream-blue-light text-white font-bold">
                    로그인 / 회원가입
                  </Button>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">또는 비회원으로 계속하기</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="space-y-4">
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
                      <label className="text-xs font-semibold text-slate-300 px-1 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-dream-purple-light" /> 조회용 보안 PIN (숫자 4자리)</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          name="guest-pin"
                          autoComplete="off"
                          data-lpignore="true"
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value.replace(/\D/g, ""))}
                          placeholder="예: 8942 (숫자 4자리)"
                          style={{ WebkitTextSecurity: showPassword ? "none" : "disc" }}
                          className="w-full bg-[#13131b] text-white p-3.5 rounded-xl border border-white/20 focus:border-dream-purple focus:bg-[#0d0d12] focus:outline-none text-sm placeholder:text-slate-500 pr-10 shadow-inner transition-all font-mono tracking-widest"
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
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextStep(2);
                      }} 
                      disabled={guestPhone.length < 12 || guestPassword.length < 4}
                      className={cn(
                        "transition-all duration-300 font-semibold px-8 py-2.5 rounded-full shadow-lg border",
                        guestPhone.length >= 12 && guestPassword.length >= 4
                          ? "bg-gradient-to-r from-dream-purple to-dream-pink text-white border-white/20 hover:scale-105" 
                          : "bg-white/10 text-slate-400 border-white/10 opacity-50 cursor-not-allowed"
                      )}
                    >
                      다음 단계로
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: 전문가 선택 */}
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
              원하는 해몽 관점을 선택하세요
            </h2>
            {expert && !isStepOpen(2) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-normal bg-white/10 px-2.5 py-1 rounded-md border border-white/5">
                  {EXPERTS.find(e => e.id === expert)?.name || ""}
                </span>
                <CheckCircle2 className="w-5 h-5 text-dream-blue-light" />
                <span className="text-xs text-dream-purple-light hover:text-white transition-colors ml-1 font-semibold">펼쳐보기</span>
              </div>
            )}
          </div>
          
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 origin-top", isStepOpen(2) ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden m-0")}>
            {EXPERTS.map((exp) => (
              <button
                key={exp.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpert(exp.id as ExpertField);
                  setTimeout(() => handleNextStep(3), 300);
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

      {/* Step 3: 꿈 내용 입력 */}
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
              어떤 꿈을 꾸셨나요?
            </h2>
            {dreamContent.trim().length >= 20 && !isStepOpen(3) && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-dream-blue-light" />
                <span className="text-xs text-dream-purple-light hover:text-white transition-colors ml-1 font-semibold">펼쳐보기</span>
              </div>
            )}
          </div>
          
          <div className={cn("transition-all duration-500 origin-top", isStepOpen(3) ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden m-0")}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue rounded-xl blur opacity-25 group-focus-within:opacity-60 transition duration-1000 group-focus-within:duration-200" />
              <textarea
                value={dreamContent}
                onChange={(e) => setDreamContent(e.target.value)}
                placeholder="꿈의 배경, 등장인물, 느꼈던 감정 등을 상세히 적어주시면 더 정확한 분석이 가능합니다. (최소 20자 이상)"
                className="relative w-full h-48 bg-[#13131b] text-white p-6 rounded-xl border border-white/20 focus:border-dream-purple focus:bg-[#0d0d12] focus:outline-none focus:ring-1 focus:ring-dream-purple resize-none placeholder:text-slate-500 text-lg leading-relaxed shadow-inner transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-xs px-3 py-1 rounded-full font-semibold border transition-all flex items-center gap-1.5",
                  dreamContent.trim().length < 20 
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.15)]"
                )}>
                  {dreamContent.trim().length < 20 ? (
                    <><span>⚠️</span> <span>최소 20자 필요 ({dreamContent.trim().length}/20)</span></>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> <span>{dreamContent.trim().length}자 작성 완료</span></>
                  )}
                </span>
                
                {/* 시각적 프로그레스 바 */}
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      dreamContent.trim().length < 20 ? "bg-amber-400" : "bg-emerald-400"
                    )}
                    style={{ width: `${Math.min(100, (dreamContent.trim().length / 20) * 100)}%` }}
                  />
                </div>
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextStep(4);
                }} 
                disabled={dreamContent.trim().length < 20}
                className={cn(
                  "border cursor-pointer transition-all duration-300 font-semibold px-6",
                  dreamContent.trim().length >= 20 
                    ? "bg-gradient-to-r from-dream-purple to-dream-pink text-white border-white/20 shadow-lg hover:scale-105" 
                    : "bg-white/10 text-slate-400 border-white/10 opacity-50"
                )}
              >
                다음 단계로
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: 결제 옵션 */}
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
              결제 옵션 선택
            </h2>
            {paymentOption && !isStepOpen(4) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-normal bg-white/10 px-2.5 py-1 rounded-md border border-white/5">
                  {paymentOption === "single" ? "1회권" : paymentOption === "pass5" ? "5회권" : "10회권"}
                </span>
                <CheckCircle2 className="w-5 h-5 text-dream-blue-light" />
                <span className="text-xs text-dream-purple-light hover:text-white transition-colors ml-1 font-semibold">펼쳐보기</span>
              </div>
            )}
          </div>
          
          <div className={cn("transition-all duration-500 origin-top", isStepOpen(4) ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden m-0")}>
            <div className="space-y-4">
              {/* 잔여 횟수 사용 (회원 전용) */}
              {isLoggedIn && (
                <label 
                  onClick={() => {
                    if (remainingPasses < 1) {
                      alert("보유하신 다회권 잔여 횟수가 없습니다 (0회). 5회 또는 10회 다회권을 먼저 구매해 주세요.");
                      setPaymentOption("single");
                    }
                  }}
                  className={cn(
                    "flex items-start justify-between p-5 rounded-xl border transition-all relative overflow-hidden",
                    remainingPasses < 1 ? "opacity-60 cursor-not-allowed border-white/10 bg-[#13131b]" : "cursor-pointer",
                    paymentOption === "use_pass" && remainingPasses >= 1 ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]" : "border-white/20 bg-[#13131b] hover:bg-[#1a1a24] hover:border-white/30"
                  )}
                >
                  <div className={cn("absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md z-10", remainingPasses > 0 ? "bg-emerald-500" : "bg-slate-600")}>
                    {remainingPasses > 0 ? `보유 횟수 ${remainingPasses}회` : "보유 횟수 0회"}
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <input 
                      type="radio" 
                      name="payment" 
                      disabled={remainingPasses < 1}
                      checked={paymentOption === "use_pass" && remainingPasses >= 1} 
                      onChange={() => {
                        if (remainingPasses >= 1) handlePaymentOptionSelect("use_pass");
                      }} 
                      className="mt-1 w-4 h-4 accent-emerald-400 disabled:opacity-30" 
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-emerald-400" />
                        잔여 횟수 사용 {remainingPasses > 0 && <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">{remainingPasses}회 보유 중</span>}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {remainingPasses > 0 
                          ? "보유 중인 다회권의 잔여 횟수 1회를 사용하여 해석합니다. (이미지 포함)" 
                          : "보유 중인 잔여 횟수가 없습니다. 아래 다회권을 구매하시면 자동 충전됩니다."}
                      </p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-xl font-bold text-emerald-400">0원</div>
                    <div className="text-xs text-slate-400">잔여 1회 차감</div>
                  </div>
                </label>
              )}

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

      {/* Sticky Bottom Checkout Bar */}
      {(expandAll || activeStep >= 4) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-black/60 backdrop-blur-xl border-t border-white/10 animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">최종 결제 금액</p>
              <p className="text-2xl md:text-3xl font-black text-white">
                {calculateTotal().toLocaleString()}<span className="text-lg font-normal text-slate-300 ml-1">원</span>
              </p>
            </div>
            
            <button 
              onClick={handlePayment}
              disabled={
                !expert || 
                dreamContent.trim().length < 20 || 
                (!isLoggedIn && (guestPhone.length < 12 || guestPassword.length < 4 || paymentOption !== "single"))
              }
              className="group relative inline-flex p-[2px] rounded-full bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
              <div className="relative bg-background/80 backdrop-blur-md text-white font-bold px-8 py-3 md:px-12 md:py-4 rounded-full border border-white/5 transition-all z-10 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>
                  {paymentOption === "use_pass" ? "해몽 시작하기" : "결제하기"}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 회원 전용 다회권 선택 시 비회원 안내 팝업 모달 */}
      {showMemberOnlyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-[#181824] border border-dream-purple/40 rounded-3xl p-6 md:p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
            <div className="w-16 h-16 rounded-full bg-dream-purple/20 border border-dream-purple/40 flex items-center justify-center mx-auto text-dream-purple-light">
              <Sparkles className="w-8 h-8 text-dream-pink animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">회원 전용 할인 상품입니다</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                다회권(5회/10회) 할인 혜택은 **회원 전용 서비스**입니다.<br />
                3초 간편 소셜 가입 후 즉시 할인가로 이용하실 수 있습니다!
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => router.push("/auth")}
                className="w-full bg-gradient-to-r from-dream-purple to-dream-pink text-white font-bold py-6 rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>3초 회원가입 / 로그인하고 할인받기</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowMemberOnlyModal(false);
                  setPaymentOption("single");
                }}
                className="w-full border-white/20 text-slate-300 hover:text-white hover:bg-white/5 py-6 rounded-xl cursor-pointer text-sm"
              >
                1회권(단판)으로 변경하여 결제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
