import Image from "next/image";
import { cn } from "@/lib/utils";
import { Moon, Brain, Eye, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import FeedLoadMore from "@/components/feeds/feed-load-more";

export const metadata = {
  title: "꿈 해석 피드 | Dream Teller",
  description: "다른 유저들의 꿈 해석 사례를 살펴보세요. AI가 분석한 다양한 꿈 해석 리포트를 확인할 수 있습니다.",
};

/** 전문가 관점 아이콘/라벨 매핑 */
const EXPERT_MAP: Record<string, { label: string; icon: typeof Eye; color: string }> = {
  freud: { label: "프로이트", icon: Eye, color: "text-dream-pink-light" },
  jung: { label: "칼 융", icon: Moon, color: "text-dream-purple-light" },
  neuroscience: { label: "신경과학", icon: Brain, color: "text-dream-blue-light" },
  gestalt: { label: "게슈탈트", icon: Sparkles, color: "text-yellow-400" },
};

import { getPublicDreams } from "@/app/actions/order-action";

/** 날짜를 상대적 시간으로 표시 (예: "2시간 전", "3일 전") */
const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
};

const FeedsPage = async () => {
  const feeds = await getPublicDreams(10);

  return (
    <main className="min-h-screen bg-background relative overflow-hidden pt-24 pb-20">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-dream-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-dream-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-2xl">
        {/* Page Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            꿈 해석 피드
          </h1>
          <p className="text-slate-400 text-base">
            다른 유저들의 꿈 해석 사례를 살펴보세요.
          </p>
        </div>

        {/* Feed Cards */}
        <div className="space-y-4">
          {feeds.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p>아직 등록된 꿈 해몽 피드가 없습니다.</p>
            </div>
          )}
          {feeds.map((feed: any, index: number) => {
            const expertInfo = EXPERT_MAP[feed.expert];
            const ExpertIcon = expertInfo?.icon ?? Sparkles;
            const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${feed.nickname}`;

            return (
              <article
                key={feed.id}
                className={cn(
                  "bg-[#1c1c21]/70 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20",
                  "animate-in fade-in slide-in-from-bottom-4",
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Card Header: 프로필 + 전문가 뱃지 */}
                <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                    <img
                      src={avatar}
                      alt={`${feed.nickname} 프로필`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{feed.nickname}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <ExpertIcon className={cn("w-3 h-3", expertInfo?.color)} />
                      <span className={cn(expertInfo?.color)}>{expertInfo?.label}</span>
                      <span>·</span>
                      <span>{getRelativeTime(feed.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body: 꿈 타이틀 + 내용 요약 */}
                <div className="px-5 pb-4">
                  <h2 className="text-lg font-bold text-white mb-2 leading-snug">{feed.dreamTitle}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{feed.dreamSummary}</p>
                </div>

                {/* Card Image (있는 경우만) */}
                {feed.hasImage && feed.imageUrl && (
                  <div className="relative w-full aspect-[3/2] border-t border-b border-white/5">
                    <Image
                      src={feed.imageUrl}
                      alt={`${feed.dreamTitle} AI 시각화`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 672px) 100vw, 672px"
                    />
                    {/* 이미지 오버레이 뱃지 */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-xs text-slate-300 px-2.5 py-1 rounded-full border border-white/10">
                      AI 시각화 이미지
                    </div>
                  </div>
                )}

                {/* Card Footer: 분석 요약 미리보기 */}
                <div className="px-5 py-4 border-t border-white/5">
                  <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wider">AI 분석 요약</p>
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{feed.analysisSummary}</p>
                  <Link
                    href={`/dream-result/${feed.orderId}`}
                    className="inline-flex items-center gap-1 mt-3 text-sm text-dream-purple-light hover:text-white transition-colors"
                  >
                    전체 해석 보기
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* 더보기 버튼 (Pagination 컴포넌트) */}
        <FeedLoadMore />
      </div>
    </main>
  );
};

export default FeedsPage;
