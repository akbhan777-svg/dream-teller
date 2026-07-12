import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * HeroSection 컴포넌트
 * Nuumx AI 레퍼런스 스타일: 거대한 타이포그래피, 깊은 오로라 광원, 글래스모피즘 CTA 버튼
 */
const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-20 text-center">
      {/* 초거대 배경 광원 데코레이션 (Nuumx AI 스타일) */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-dream-purple/30 blur-[150px] animate-glow-pulse mix-blend-screen" />
      <div className="absolute top-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-dream-blue/20 blur-[120px] mix-blend-screen animate-float" />
      <div className="absolute bottom-1/4 left-1/4 -z-10 h-80 w-80 rounded-full bg-dream-pink/20 blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 mx-auto max-w-5xl space-y-10">
        {/* 압도적인 크기의 타이포그래피 */}
        <h1 className="animate-fade-in-up text-6xl font-black tracking-tighter sm:text-7xl md:text-[6rem] lg:text-[7.5rem] leading-[1.1]">
          <span className="block text-white drop-shadow-2xl opacity-95">어젯밤 꿈,</span>
          <span className="text-aurora-gradient mt-2 block drop-shadow-2xl pb-4">아직 기억나시나요?</span>
        </h1>

        <p className="animate-fade-in-up-delay-1 mx-auto max-w-2xl text-lg text-slate-300 md:text-2xl leading-relaxed font-medium">
          프로이트부터 신경과학까지, 4가지 전문 관점으로 AI가 당신의 꿈을 분석합니다.
          어젯밤 꿈을 적으면, 3분 안에 당신만의 꿈 해석 리포트가 완성됩니다.
        </p>

        {/* 글래스모피즘 프리미엄 CTA 버튼 */}
        <div className="animate-fade-in-up-delay-2 flex justify-center pt-8">
          <Link href="/dream-teller" passHref>
            <div className="group relative inline-flex p-[2px] rounded-full bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]">
              <span className="absolute inset-0 bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <Button className="relative bg-background/80 backdrop-blur-md hover:bg-transparent text-lg font-bold text-white px-10 py-7 rounded-full border border-white/5 transition-all duration-300 z-10">
                내 꿈 해석 시작하기
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;