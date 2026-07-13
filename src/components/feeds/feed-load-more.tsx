"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Moon, Brain, Eye, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** 전문가 관점 아이콘/라벨 매핑 */
const EXPERT_MAP: Record<string, { label: string; icon: typeof Eye; color: string }> = {
  freud: { label: "프로이트", icon: Eye, color: "text-dream-pink-light" },
  jung: { label: "칼 융", icon: Moon, color: "text-dream-purple-light" },
  neuroscience: { label: "신경과학", icon: Brain, color: "text-dream-blue-light" },
  gestalt: { label: "게슈탈트", icon: Sparkles, color: "text-yellow-400" },
};

interface FeedItem {
  id: string;
  nickname: string;
  avatar: string;
  expert: string;
  dreamTitle: string;
  dreamSummary: string;
  analysisSummary: string;
  hasImage: boolean;
  imageUrl: string | null;
  createdAt: string;
}

/** 추가로 로드될 더미 피드 데이터 (2페이지) */
const EXTRA_FEEDS_PAGE2: FeedItem[] = [
  {
    id: "feed-7",
    nickname: "잠든고래",
    avatar: "https://picsum.photos/seed/avatar7/80/80",
    expert: "neuroscience",
    dreamTitle: "물속에서 숨을 쉴 수 있었던 꿈",
    dreamSummary: "깊은 바다 속에 있었는데 놀랍게도 숨을 쉴 수 있었어요. 형형색색의 산호초와 물고기가 주위를 감싸고, 멀리서 고래의 노래가 들려왔습니다. 물속이 오히려 세상보다 더 편안하게 느껴졌습니다.",
    analysisSummary: "신경과학적으로 수중 호흡 꿈은 뇌간의 호흡 제어 센터가 REM 수면 중 각성 상태와 다른 모드로 작동할 때 발생합니다. 편안함은 부교감 신경계의 이완 반응이 강하게 반영된 것이며, 고래 소리는 청각 피질의 자발적 신경 활동으로 설명됩니다.",
    hasImage: true,
    imageUrl: "https://picsum.photos/seed/dream7/600/400",
    createdAt: "2025-07-09T20:30:00",
  },
  {
    id: "feed-8",
    nickname: "은하수나그네",
    avatar: "https://picsum.photos/seed/avatar8/80/80",
    expert: "jung",
    dreamTitle: "거울 속의 내가 다르게 행동하는 꿈",
    dreamSummary: "화장실 거울을 보고 있었는데 거울 속의 제가 저와 다르게 움직이기 시작했어요. 거울 속의 저는 웃고 있었고, 저한테 뭔가를 말하려는 것처럼 입을 움직였지만 소리는 들리지 않았습니다.",
    analysisSummary: "칼 융의 그림자(Shadow) 원형 이론에 따르면, 거울 속에서 독립적으로 행동하는 '나'는 의식이 억압한 그림자 인격의 현현입니다. 소리 없는 말은 아직 의식 수준에서 통합되지 못한 무의식적 메시지를 상징하며, 이는 개성화 과정의 초대장과 같습니다.",
    hasImage: false,
    imageUrl: null,
    createdAt: "2025-07-09T15:10:00",
  },
  {
    id: "feed-9",
    nickname: "보라별지기",
    avatar: "https://picsum.photos/seed/avatar9/80/80",
    expert: "gestalt",
    dreamTitle: "끝없는 계단을 올라가는 꿈",
    dreamSummary: "나선형 계단이 끝없이 이어져 있었고, 위로 올라가면 갈수록 주변이 밝아졌어요. 다리가 아팠지만 멈출 수 없었고, 어딘가에 도달해야 한다는 강한 의무감이 있었습니다. 꼭대기에 무엇이 있는지는 끝내 알 수 없었습니다.",
    analysisSummary: "게슈탈트 관점에서 끝없는 계단은 '지금-여기'에서 당신이 경험하는 성취에 대한 갈망과 동시에 완결에 대한 불안의 형태적 표현입니다. 멈출 수 없는 의무감은 현재 삶에서 느끼는 외부 기대의 내면화이며, 보이지 않는 꼭대기는 미완결 욕구(Unfinished Business)를 반영합니다.",
    hasImage: true,
    imageUrl: "https://picsum.photos/seed/dream9/600/400",
    createdAt: "2025-07-08T12:00:00",
  },
];

/** 추가 더미 피드 데이터 (3페이지) */
const EXTRA_FEEDS_PAGE3: FeedItem[] = [
  {
    id: "feed-10",
    nickname: "새벽빛고양이",
    avatar: "https://picsum.photos/seed/avatar10/80/80",
    expert: "freud",
    dreamTitle: "어두운 복도에서 문을 여는 꿈",
    dreamSummary: "길고 어두운 복도에 문이 양쪽으로 줄지어 있었습니다. 하나씩 열어보면 안에는 전혀 다른 풍경이 펼쳐져 있었어요. 어떤 방에는 유년 시절 교실이, 어떤 방에는 바다가 있었습니다.",
    analysisSummary: "프로이트의 분석에 따르면, 복도는 의식과 무의식 사이의 경계를 상징합니다. 각각의 문은 억압된 기억의 저장소이며, 다양한 풍경은 생의 다양한 시기에 해결되지 않은 감정적 잔여물들이 상징적으로 재구성된 것입니다.",
    hasImage: true,
    imageUrl: "https://picsum.photos/seed/dream10/600/400",
    createdAt: "2025-07-07T18:45:00",
  },
  {
    id: "feed-11",
    nickname: "달빛정원사",
    avatar: "https://picsum.photos/seed/avatar11/80/80",
    expert: "neuroscience",
    dreamTitle: "이가 빠지는 꿈",
    dreamSummary: "대화를 하고 있는 중에 갑자기 이가 하나씩 빠지기 시작했어요. 손으로 받아보면 깨끗하게 빠진 이가 손바닥에 놓여 있었고, 당황스러웠지만 아프지는 않았습니다. 계속 빠져서 결국 이가 하나도 남지 않았습니다.",
    analysisSummary: "신경과학적으로 이가 빠지는 꿈은 수면 중 삼차신경(Trigeminal nerve)의 자발적 신호 활성화와 연관이 있습니다. 통증 없이 빠지는 감각은 체성감각 피질의 부분적 활성화 패턴을 반영하며, 이는 스트레스 호르몬(코르티솔) 수준이 높은 시기에 빈번하게 보고됩니다.",
    hasImage: false,
    imageUrl: null,
    createdAt: "2025-07-07T07:20:00",
  },
];

const ALL_EXTRA_PAGES = [EXTRA_FEEDS_PAGE2, EXTRA_FEEDS_PAGE3];

/** 날짜를 상대적 시간으로 표시 */
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

/** 더보기 버튼 + 추가 피드 로딩 컴포넌트 */
const FeedLoadMore = () => {
  const [loadedPages, setLoadedPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const hasMore = loadedPages < ALL_EXTRA_PAGES.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    // 로딩 시뮬레이션
    setTimeout(() => {
      setLoadedPages((prev) => prev + 1);
      setIsLoading(false);
    }, 800);
  };

  // 현재까지 로드된 추가 피드들을 합침
  const loadedFeeds = ALL_EXTRA_PAGES.slice(0, loadedPages).flat();

  return (
    <>
      {/* 추가 로드된 피드 카드들 */}
      {loadedFeeds.map((feed, index) => {
        const expertInfo = EXPERT_MAP[feed.expert];
        const ExpertIcon = expertInfo?.icon ?? Sparkles;

        return (
          <article
            key={feed.id}
            className={cn(
              "bg-[#1c1c21]/70 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20",
              "animate-in fade-in slide-in-from-bottom-4",
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                <Image
                  src={feed.avatar}
                  alt={`${feed.nickname} 프로필`}
                  fill
                  className="object-cover"
                  sizes="40px"
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

            {/* Card Body */}
            <div className="px-5 pb-4">
              <h2 className="text-lg font-bold text-white mb-2 leading-snug">{feed.dreamTitle}</h2>
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{feed.dreamSummary}</p>
            </div>

            {/* Card Image */}
            {feed.hasImage && feed.imageUrl && (
              <div className="relative w-full aspect-[3/2] border-t border-b border-white/5">
                <Image
                  src={feed.imageUrl}
                  alt={`${feed.dreamTitle} AI 시각화`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 672px) 100vw, 672px"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-xs text-slate-300 px-2.5 py-1 rounded-full border border-white/10">
                  AI 시각화 이미지
                </div>
              </div>
            )}

            {/* Card Footer */}
            <div className="px-5 py-4 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wider">AI 분석 요약</p>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{feed.analysisSummary}</p>
              <Link
                href={`/dream-result/${feed.id}`}
                className="inline-flex items-center gap-1 mt-3 text-sm text-dream-purple-light hover:text-white transition-colors"
              >
                전체 해석 보기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        );
      })}

      {/* 더보기 / 완료 표시 */}
      <div className="flex justify-center py-8">
        {hasMore ? (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white font-medium hover:bg-white/10 hover:border-white/25 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>불러오는 중...</span>
              </>
            ) : (
              <span>더 많은 꿈 해석 보기</span>
            )}
          </button>
        ) : (
          <p className="text-sm text-slate-500">모든 피드를 불러왔습니다.</p>
        )}
      </div>
    </>
  );
};

export default FeedLoadMore;
