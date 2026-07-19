"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";

// 개발 환경과 프로덕트 환경의 도메인을 동적으로 획득하는 헬퍼 함수
const getRedirectURL = () => {
  if (typeof window !== "undefined") {
    // 브라우저 환경에서는 현재 origin을 기반으로 리다이렉트 URL 생성
    const origin = window.location.origin;
    return `${origin}/dream-teller`;
  }
  // 서버 사이드 빌드 대비 Fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${siteUrl}/dream-teller`;
};

const AuthClientPage = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: "google" | "kakao") => {
    setIsLoading(provider);

    try {
      // 1단계: 백엔드 API인 /api/auth/login을 호출
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "소셜 로그인 요청 실패");
      }

      // 2단계: Supabase가 반환한 구글/카카오 OAuth 페이지로 리다이렉트
      window.location.href = data.url;
    } catch (error) {
      console.error(`${provider} 로그인 처리 중 오류 발생:`, error);
      alert("로그인 처리 중 에러가 발생했습니다. 다시 시도해 주세요.");
      setIsLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center pt-24 pb-16 px-4">
      {/* Background Aurora / Glow Effects (디자인 가이드: Mystical, Vibrant, Fluid) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-dream-purple/20 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-dream-blue/20 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-dream-pink/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating particles effect (몽환적 연출) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.4))] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
        
        {/* Glow behind container */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-dream-purple via-dream-blue to-dream-pink rounded-[2rem] blur-2xl opacity-40 animate-pulse duration-[6000ms] pointer-events-none" />
        
        {/* Card Container (Ivory Base Aurora Glow) */}
        <div className="relative bg-[#15151a]/85 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center overflow-hidden">
          {/* Card 내상단 은은한 핑크/오렌지 하이라이트 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-gradient-to-r from-transparent via-dream-pink to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[50px] bg-dream-pink/10 blur-xl rounded-full" />

          {/* Logo & Subtitle */}
          <div className="mb-10 relative">
            <div className="inline-flex p-3 bg-white/5 rounded-2xl border border-white/10 mb-4 shadow-[0_0_20px_rgba(139,92,246,0.25)] relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-dream-purple to-dream-pink opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <Sparkles className="w-6 h-6 text-dream-pink animate-pulse" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2.5">
              Dream Teller
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto">
              어젯밤 당신의 무의식이 보낸 메시지, <br />
              소셜 로그인으로 빠르게 분석을 시작하세요.
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-4">
            
            {/* 1. Google 공식 로그인 버튼 */}
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-[#3c4043] font-semibold py-3.5 px-4 rounded-xl border border-transparent transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading === "google" ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span className="text-sm tracking-wide">Google 계정으로 로그인</span>
            </button>

            {/* 2. Kakao 공식 로그인 버튼 */}
            <button
              onClick={() => handleSocialLogin("kakao")}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_12px_rgba(254,229,0,0.15)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading === "kakao" ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 3c-4.97 0-9 3.184-9 7.11 0 2.52 1.657 4.739 4.162 5.926l-.837 3.092c-.1.365.114.717.478.788.115.023.232.012.338-.032l3.616-2.39c.408.082.827.126 1.243.126 4.97 0 9-3.183 9-7.11C21 6.184 16.97 3 12 3z" fill="#191919"/>
                </svg>
              )}
              <span className="text-sm tracking-wide">카카오 로그인</span>
            </button>

          </div>

          {/* Footer Notice */}
          <div className="mt-8 text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
            로그인 시 Dream Teller의{" "}
            <a href="/terms" className="underline hover:text-slate-400 transition-colors">이용약관</a>{" "}
            및{" "}
            <a href="/privacy" className="underline hover:text-slate-400 transition-colors">개인정보처리방침</a>
            에 동의하는 것으로 간주됩니다.
          </div>

        </div>
      </div>
    </main>
  );
};

export default AuthClientPage;
