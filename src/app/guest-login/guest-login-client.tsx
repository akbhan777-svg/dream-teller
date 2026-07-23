"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, Loader2, Phone, Lock, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GuestLoginClient() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 페이지 진입 시 이전 비회원 조회 세션을 깨끗이 초기화
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("guestLoginPhone");
      sessionStorage.removeItem("guestLoginPassword");
      sessionStorage.removeItem("guestPhone");
      sessionStorage.removeItem("guestPassword");
      sessionStorage.removeItem("activeOrderId");
    }
  }, []);

  // 휴대폰 번호 입력 시 자동으로 하이픈(-) 추가해 주는 포맷터
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검증
    if (phone.length < 12) {
      setError("올바른 전화번호 형식을 입력해 주세요.");
      return;
    }
    if (password.length < 4) {
      setError("비밀번호는 4자리 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    // 로그인 진행 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("guestLoginPhone", phone);
        sessionStorage.setItem("guestLoginPassword", password);
      }
      // 로그인 완료 후 비회원 주문 조회 페이지로 라우팅
      router.push("/guest-check");
    }, 1500);
  };

  return (
    <div className="relative">
      {/* Glow behind container */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-dream-purple/30 via-dream-blue/20 to-dream-pink/30 rounded-3xl blur-xl opacity-60 pointer-events-none" />

      {/* Card Container */}
      <div className="relative bg-[#15151a]/85 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Logo & Intro */}
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex p-3 bg-white/5 rounded-2xl border border-white/10 mb-4 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Sparkles className="w-6 h-6 text-dream-pink" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">비회원 주문 조회</h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-[280px] mx-auto">
            결제 시 작성했던 연락처와 비밀번호를 입력하면 <br />
            이전 해몽 보고서를 다시 열어볼 수 있습니다.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. 전화번호 입력 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 px-1">전화번호</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={13}
                placeholder="010-1234-5678"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-dream-purple-light focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* 2. 비밀번호 입력 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 px-1">조회용 보안 PIN (숫자 4자리)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                name="guest-pin"
                autoComplete="off"
                data-lpignore="true"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="예: 8942 (숫자 4자리)"
                disabled={isLoading}
                style={{ WebkitTextSecurity: showPassword ? "none" : "disc" }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-dream-purple-light focus:bg-white/10 transition-all font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <p className="text-xs text-red-400 font-semibold px-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-dream-purple to-dream-blue hover:opacity-90 text-white font-bold py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.25)] flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>조회 중...</span>
              </>
            ) : (
              <span>내역 조회하기</span>
            )}
          </Button>
        </form>

      </div>
    </div>
  );
}
