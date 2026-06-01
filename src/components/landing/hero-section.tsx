import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * HeroSection 컴포넌트
 * 어젯밤 꿈의 분석을 시작하도록 유도하는 메인 Hero 영역
 */
const HeroSection = () => {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      {/* 몽환적인 분위기를 배가하기 위한 배경 광원 데코레이션 요소 */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-dream-purple/20 blur-[100px] animate-glow-pulse" />
      <div className="absolute bottom-1/3 left-1/3 -z-10 h-60 w-60 rounded-full bg-dream-pink/15 blur-[80px]" />
      
      <div className="mx-auto max-w-4xl space-y-8">
        {/* 순차적 페이드인 애니메이션을 적용하여 역동성 제공 */}
        <h1 className="animate-fade-in-up text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          <span className="block text-white">어젯밤 꿈,</span>
          <span className="text-aurora-gradient mt-2 block">아직 기억나시나요?</span>
        </h1>

        <p className="animate-fade-in-up-delay-1 mx-auto max-w-2xl text-lg text-slate-300 md:text-xl leading-relaxed">
          프로이트부터 신경과학까지, 4가지 전문 관점으로 AI가 당신의 꿈을 분석합니다.
          어젯밤 꿈을 적으면, 3분 안에 당신만의 꿈 해석 리포트가 완성됩니다.
        </p>

        <div className="animate-fade-in-up-delay-2 flex justify-center pt-4">
          <Link href="/dream-teller" passHref>
            <Button className="btn-aurora text-lg font-semibold text-white px-8 py-6 rounded-full shadow-lg border border-white/10">
              내 꿈 해석 시작하기
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
