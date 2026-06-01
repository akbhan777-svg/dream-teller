import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface DreamExample {
  id: string;
  title: string;
  excerpt: string;
  expertField: string;
  expertLabel: string;
  imageUrl: string;
  author: string;
}

const dreamExamples: DreamExample[] = [
  {
    id: "dummy-order-1",
    title: "심연의 우주 바다와 푸른 고래",
    excerpt: "우주처럼 넓고 캄캄한 바다에서 거대한 푸른 고래와 함께 헤엄쳤어요. 두려움보다는 마음이 아늑하고 평온해졌습니다.",
    expertField: "jung",
    expertLabel: "칼 융 (분석심리학)",
    imageUrl: "/images/dream-whale.png",
    author: "무의식 탐험가"
  },
  {
    id: "dummy-order-2",
    title: "숲속 나비와 황금빛 차원의 문",
    excerpt: "울창하고 어두운 숲속을 헤매다가 눈이 부시도록 빛나는 푸른 나비들을 발견했어요. 나비들을 따라가니 덩굴로 둘러싸인 황금빛 문이 열려 있었습니다.",
    expertField: "freud",
    expertLabel: "프로이트 (정신분석학)",
    imageUrl: "/images/dream-door.png",
    author: "새벽의 숲"
  },
  {
    id: "dummy-order-3",
    title: "시공간이 왜곡되어 흘러내리는 시계",
    excerpt: "모든 시계들이 허공에 흐물거리는 상태로 둥둥 떠 있었어요. 흐르는 시간의 굴레에서 완전히 해방되는 몽환적인 기분이 들었습니다.",
    expertField: "neuroscience",
    expertLabel: "신경과학",
    imageUrl: "/images/dream-clock.png",
    author: "크로노스"
  }
];

/**
 * ExamplesFeed 컴포넌트
 * 이전 사용자들이 생성한 꿈 해몽 결과와 AI 이미지 예시 카드를 노출
 */
const ExamplesFeed = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* 몽환적인 배경 광원 */}
      <div className="absolute top-1/3 left-10 -z-10 h-72 w-72 rounded-full bg-dream-pink/10 blur-[100px]" />
      <div className="absolute bottom-10 right-10 -z-10 h-96 w-96 rounded-full bg-dream-purple/10 blur-[120px] animate-glow-pulse" />

      <div className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            이미 밝혀진 무의식의 기록들
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            다른 이들은 어떤 꿈을 꾸었을까요? AI가 시각화하고 해몽한 생생한 결과물들을 확인해 보세요.
          </p>
        </div>

        {/* 예시 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dreamExamples.map((example) => (
            <Link 
              key={example.id} 
              href={`/dream-result/${example.id}`}
              className="group bento-card flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/45 backdrop-blur-md transition-all duration-300"
            >
              {/* 꿈 이미지 영역 */}
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={example.imageUrl}
                  alt={example.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-dream-purple/80 border border-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {example.expertLabel}
                </span>
              </div>

              {/* 정보 텍스트 영역 */}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="space-y-3">
                  <span className="text-xs text-slate-400">꿈을 꾼 이: {example.author}</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-dream-blue-light transition-colors duration-300">
                    {example.title}
                  </h3>
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    &ldquo;{example.excerpt}&rdquo;
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs font-semibold text-dream-blue-light group-hover:text-dream-pink-light transition-colors duration-300">
                  <span>심층 해몽 보기</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="flex justify-center">
          <Link href="/feeds" passHref>
            <Button className="border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full px-8 py-5 transition-all duration-300 hover:border-white/40">
              더 많은 꿈 해몽 보러가기
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExamplesFeed;
