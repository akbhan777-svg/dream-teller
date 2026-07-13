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

/** 더미 피드 데이터 (faker-js urlPicsumPhotos 기반 이미지 포함) */
const DUMMY_FEEDS = [
  {
    id: "feed-1",
    nickname: "별빛수집가",
    avatar: "https://picsum.photos/seed/avatar1/80/80",
    expert: "jung",
    dreamTitle: "끝없이 펼쳐진 보라색 바다 위를 걷는 꿈",
    dreamSummary: "넓고 고요한 보라색 바다 위를 맨발로 걷고 있었습니다. 발밑으로 물결이 일렁이는데 전혀 차갑지 않고 따뜻했어요. 수평선 너머로 거대한 달이 떠오르고 있었고, 달빛이 바다 위에 금빛 길을 만들어 주었습니다.",
    analysisSummary: "보라색 바다는 당신의 내면에 흐르는 깊은 영성과 직관의 상징입니다. 칼 융의 원형 분석에 따르면, '바다 위를 걷는' 행위는 집단 무의식과 교류하는 과정을 의미하며, 금빛 달의 길은 자기(Self) 실현을 향한 개성화 과정의 시작을 암시합니다.",
    hasImage: true,
    imageUrl: "https://picsum.photos/seed/dream1/600/400",
    createdAt: "2025-07-12T14:32:00",
  },
  {
    id: "feed-2",
    nickname: "몽환여행자",
    avatar: "https://picsum.photos/seed/avatar2/80/80",
    expert: "freud",
    dreamTitle: "어린 시절 할머니 집에서 숨바꼭질하는 꿈",
    dreamSummary: "어린 시절 자주 놀러 갔던 할머니 집에서 누군가와 숨바꼭질을 하고 있었어요. 숨어 있는데 찾는 사람의 발소리가 점점 가까워졌고, 심장이 빠르게 뛰었습니다. 그런데 결국 찾아온 건 어린 시절의 저 자신이었습니다.",
    analysisSummary: "프로이트 분석에 따르면, 할머니 집이라는 공간은 안전과 보호의 근원적 욕구를 상징합니다. 숨바꼭질은 현실에서 억압하고 있는 과거의 감정이나 기억을 의미하며, '어린 시절의 나'가 찾아오는 것은 내면 아이(Inner Child)와의 재회를 통한 해결되지 않은 감정의 직면을 나타냅니다.",
    hasImage: false,
    imageUrl: null,
    createdAt: "2025-07-12T11:05:00",
  },
  {
    id: "feed-3",
    nickname: "새벽의기록",
    avatar: "https://picsum.photos/seed/avatar3/80/80",
    expert: "neuroscience",
    dreamTitle: "높은 건물 옥상에서 하늘을 나는 꿈",
    dreamSummary: "초고층 빌딩 옥상 끝에 서 있었는데, 두려움 대신 자유로움이 느껴졌어요. 한 발짝 내딛자 몸이 가볍게 떠올랐고, 도시의 야경 위를 빠르게 날아다녔습니다. 바람이 세게 불었지만 전혀 무섭지 않았습니다.",
    analysisSummary: "신경과학적 관점에서 비행 꿈은 REM 수면 중 전정감각(균형 감각)이 비활성화되면서 발생합니다. 전두엽의 판단 기능이 억제되어 '두려움' 대신 '자유'를 느끼는 것이며, 이는 편도체의 공포 반응이 낮은 상태에서 쾌감 중추가 활성화된 신경학적 상태를 반영합니다.",
    hasImage: true,
    imageUrl: "https://picsum.photos/seed/dream3/600/400",
    createdAt: "2025-07-11T22:18:00",
  },
  {
    id: "feed-4",
    nickname: "밤하늘꿈꾸기",
    avatar: "https://picsum.photos/seed/avatar4/80/80",
    expert: "gestalt",
    dreamTitle: "시험 시간에 연필이 계속 부러지는 꿈",
    dreamSummary: "중요한 시험을 보고 있는데, 답을 쓰려고 할 때마다 연필이 똑 하고 부러졌어요. 새 연필을 꺼내도 또 부러지고, 시간은 계속 흘러갔습니다. 주변 사람들은 모두 열심히 쓰고 있는데 저만 아무것도 못 하고 있었습니다.",
    analysisSummary: "게슈탈트 관점에서 부러지는 연필은 '지금-여기'에서 당신이 느끼는 표현의 좌절과 무력감의 형태적 투사입니다. 주변인의 여유로운 모습과 당신의 고립감의 대비는 미완결 과제(Unfinished Business), 즉 현재 삶에서 해결하지 못한 불안의 현상학적 표출입니다.",
    hasImage: false,
    imageUrl: null,
    createdAt: "2025-07-11T09:45:00",
  },
  {
    id: "feed-5",
    nickname: "루나드리머",
    avatar: "https://picsum.photos/seed/avatar5/80/80",
    expert: "jung",
    dreamTitle: "거대한 도서관에서 빛나는 책을 발견하는 꿈",
    dreamSummary: "끝이 보이지 않는 거대한 도서관에 있었습니다. 수천 개의 책장 사이를 걷다가, 유독 한 권의 책에서 은은한 금빛이 새어 나오고 있었어요. 책을 열자 글자 대신 별들이 쏟아져 나왔고, 도서관 전체가 우주처럼 변했습니다.",
    analysisSummary: "칼 융의 분석틀에서 거대한 도서관은 집단 무의식의 보고(寶庫)를 의미합니다. 빛나는 책은 개성화(Individuation) 과정에서 발견하게 되는 자기(Self)의 원형이며, 글자가 별로 변하는 순간은 의식과 무의식의 통합, 즉 누미노제(Numinose) 경험의 상징적 표현입니다.",
    hasImage: true,
    imageUrl: "https://picsum.photos/seed/dream5/600/400",
    createdAt: "2025-07-10T16:20:00",
  },
  {
    id: "feed-6",
    nickname: "꿈속산책자",
    avatar: "https://picsum.photos/seed/avatar6/80/80",
    expert: "freud",
    dreamTitle: "낯선 도시에서 집을 찾지 못하는 꿈",
    dreamSummary: "완전히 낯선 도시에 있었는데 집에 돌아가야 한다는 강한 느낌이 들었어요. 골목을 돌고 또 돌았지만 어디가 어딘지 전혀 알 수 없었고, 지도를 봐도 글씨가 읽히지 않았습니다. 점점 해가 지면서 불안함이 커졌습니다.",
    analysisSummary: "프로이트 분석에 따르면 '집을 찾지 못하는' 꿈은 현실에서의 정체성 혼란과 소속감의 결핍을 반영합니다. 읽히지 않는 지도는 문제 해결의 실마리가 의식 수준에서 차단되어 있음을, 저물어가는 해는 시간에 쫓기는 무의식적 압박감을 상징합니다.",
    hasImage: false,
    imageUrl: null,
    createdAt: "2025-07-10T08:12:00",
  },
];

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

const FeedsPage = () => {
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
          {DUMMY_FEEDS.map((feed, index) => {
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
                {/* Card Header: 프로필 + 전문가 뱃지 */}
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
        </div>

        {/* 더보기 버튼 (Pagination 컴포넌트) */}
        <FeedLoadMore />
      </div>
    </main>
  );
};

export default FeedsPage;
