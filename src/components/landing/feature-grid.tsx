import { Brain, Sparkles, Image as ImageIcon, Calendar } from "lucide-react";

/**
 * FeatureGrid 컴포넌트
 * Bento Grid 레이아웃을 통해 주요 서비스 기능을 직관적이고 미려하게 소개
 */
const FeatureGrid = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* 몽환적인 배경 연출 */}
      <div className="absolute top-1/2 right-1/4 -z-10 h-96 w-96 rounded-full bg-dream-blue/10 blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-10 left-10 -z-10 h-80 w-80 rounded-full bg-dream-purple/10 blur-[100px]" />

      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            무의식의 세계를 해석하는 새로운 방법
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            단순한 키워드 사전이 아닌, 고도화된 AI가 당신의 밤을 분석해 드립니다.
          </p>
        </div>

        {/* 12열 그리드를 활용한 비대칭 Bento Grid 레이아웃 */}
        <div className="grid grid-cols-12 gap-6">
          {/* Card 1 (Main/Large) - 전문 관점 선택 (7 cols) */}
          <div className="bento-card group col-span-12 overflow-hidden rounded-3xl border border-white/10 bg-card/45 p-8 backdrop-blur-md transition-all duration-300 md:col-span-7 flex flex-col justify-between min-h-[320px]">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-dream-purple/20 text-dream-purple-light border border-dream-purple/30 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">프로이트, 칼 융, 그리고 신경과학까지</h3>
                <p className="text-slate-400 leading-relaxed">
                  하나의 꿈, 네 가지 학문적 렌즈. 분석을 원하는 전문 관점을 선택해 나만을 위한 맞춤형 심도 깊은 꿈 해석을 받아보세요.
                </p>
              </div>
            </div>
            {/* 시각적 요소를 추가하기 위한 은은한 그라데이션 장식 */}
            <div className="mt-8 h-2 w-full rounded-full bg-gradient-to-r from-dream-purple to-dream-blue opacity-50" />
          </div>

          {/* Card 2 - AI 심층 분석 (5 cols) */}
          <div className="bento-card group col-span-12 overflow-hidden rounded-3xl border border-white/10 bg-card/45 p-8 backdrop-blur-md transition-all duration-300 md:col-span-5 flex flex-col justify-between min-h-[320px]">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-dream-blue/20 text-dream-blue-light border border-dream-blue/30 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">키워드 검색은 그만, AI 심층 해석</h3>
                <p className="text-slate-400 leading-relaxed">
                  단순한 단어 매칭을 넘어서서 꿈 속의 복잡한 감정선, 서사 구조, 심리학적 상징들을 통합적으로 분석하여 맞춤 리포트를 제공합니다.
                </p>
              </div>
            </div>
            <div className="mt-8 h-2 w-full rounded-full bg-gradient-to-r from-dream-blue to-dream-pink opacity-50" />
          </div>

          {/* Card 3 - AI 꿈 시각화 (5 cols) */}
          <div className="bento-card group col-span-12 overflow-hidden rounded-3xl border border-white/10 bg-card/45 p-8 backdrop-blur-md transition-all duration-300 md:col-span-5 flex flex-col justify-between min-h-[320px]">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-dream-pink/20 text-dream-pink-light border border-dream-pink/30 group-hover:scale-110 transition-transform duration-300">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">꿈을 다시 눈앞에</h3>
                <p className="text-slate-400 leading-relaxed">
                  AI 이미지 제너레이터가 꿈의 주요 장면을 몽환적인 화풍의 고화질 이미지로 시각화합니다. 머릿속의 어렴풋한 이미지를 직접 소장해보세요.
                </p>
              </div>
            </div>
            <div className="mt-8 h-2 w-full rounded-full bg-gradient-to-r from-dream-pink to-dream-purple opacity-50" />
          </div>

          {/* Card 4 - 기록 & 공유 (7 cols) */}
          <div className="bento-card group col-span-12 overflow-hidden rounded-3xl border border-white/10 bg-card/45 p-8 backdrop-blur-md transition-all duration-300 md:col-span-7 flex flex-col justify-between min-h-[320px]">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-dream-purple/20 text-dream-purple-light border border-dream-purple/30 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">나만의 꿈 아카이브</h3>
                <p className="text-slate-400 leading-relaxed">
                  마이페이지 캘린더에 누적되는 꿈 기록 히스토리를 통해 자신의 장기적인 심리 패턴과 무의식 흐름의 변화를 관찰하고 친구와 쉽게 링크로 공유하세요.
                </p>
              </div>
            </div>
            <div className="mt-8 h-2 w-full rounded-full bg-gradient-to-r from-dream-purple via-dream-blue to-dream-pink opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
