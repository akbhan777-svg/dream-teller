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
import { getPublicDreams } from "@/app/actions/order-action";

/**
 * ExamplesFeed 컴포넌트
 * 이전 사용자들이 생성한 꿈 해몽 결과와 AI 이미지 예시 카드를 노출
 */
const ExamplesFeed = async () => {
  const dreamExamples = await getPublicDreams(3);
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
          {dreamExamples.map((example: any) => {
            const expertLabel = example.expert === "jung" ? "칼 융 (분석심리학)" : example.expert === "neuroscience" ? "신경과학" : example.expert === "freud" ? "프로이트 (정신분석학)" : "게슈탈트";
            return (
            <Link 
              key={example.id} 
              href={`/dream-result/${example.orderId}`}
              className="group bento-card flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/45 backdrop-blur-md transition-all duration-300"
            >
              {/* 꿈 이미지 영역 */}
              <div className="relative h-60 w-full overflow-hidden">
                {example.hasImage && example.imageUrl ? (
                  <Image
                    src={example.imageUrl}
                    alt={example.dreamTitle}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-dream-purple/40 to-dream-pink/40 flex items-center justify-center">
                    <span className="text-white/60 text-sm">이미지 없음</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-dream-purple/80 border border-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {expertLabel}
                </span>
              </div>

              {/* 정보 텍스트 영역 */}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="space-y-3">
                  <span className="text-xs text-slate-400">꿈을 꾼 이: {example.nickname}</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-dream-blue-light transition-colors duration-300">
                    {example.dreamTitle}
                  </h3>
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    &ldquo;{example.dreamSummary}&rdquo;
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs font-semibold text-dream-blue-light group-hover:text-dream-pink-light transition-colors duration-300">
                  <span>심층 해몽 보기</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </Link>
            );
          })}
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
