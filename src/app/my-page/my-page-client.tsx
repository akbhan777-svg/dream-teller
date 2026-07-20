"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X, Moon, CreditCard, History, LogOut, Award, CalendarDays, Sparkles, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface DreamHistoryItem {
  id: string;
  title: string;
  date: Date;
  expert: string;
  hasImage: boolean;
  imageUrl?: string;
}

interface PurchaseHistoryItem {
  id: string;
  itemName: string;
  price: number;
  date: string;
  status: string;
}

export default function MyPageClient() {
  const router = useRouter();
  const supabase = createClient();
  
  const [nickname, setNickname] = useState("로딩 중...");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [remainingPasses, setRemainingPasses] = useState(0);
  const [email, setEmail] = useState("");
  const [loginProvider, setLoginProvider] = useState<"google" | "kakao">("google");
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // 로그아웃 커스텀 모달 상태
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // 페이지네이션용 노출 개수 상태
  const [visibleDreams, setVisibleDreams] = useState(3);
  const [visiblePurchases, setVisiblePurchases] = useState(3);

  const today = new Date();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // 세션이 없으면 로그인 페이지로 리다이렉트
          router.replace("/auth");
          return;
        }

        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setNickname(profile.nickname || "사용자");
          setEditValue(profile.nickname || "사용자");
          setEmail(profile.email || "");
          setLoginProvider((profile.provider as "google" | "kakao") || "google");
          setRemainingPasses(profile.remaining_interprets || 0);
        }
      } catch (err) {
        console.error("프로필 획득 실패:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [supabase, router]);

  // 구매 내역 더미 데이터 (E2E 테스트용 150건 생성)
  const [purchaseHistory] = useState<PurchaseHistoryItem[]>(
    Array.from({ length: 150 }).map((_, i) => ({
      id: `p-${i + 1}`,
      itemName: i % 3 === 0 ? "5회 해석권 (다회권)" : i % 2 === 0 ? "10회 해석권 (다회권)" : "1회 해석권 (단판 + AI 이미지 추가)",
      price: i % 3 === 0 ? 7200 : i % 2 === 0 ? 13500 : 2000,
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: "결제 완료",
    }))
  );

  // 꿈 해석 기록 더미 데이터 (E2E 테스트용 150건 생성)
  const [dreamHistory] = useState<DreamHistoryItem[]>(
    Array.from({ length: 150 }).map((_, i) => ({
      id: `feed-${i + 1}`,
      title: `테스트 꿈 해몽 데이터 ${i + 1} - ${["프로이트", "융", "게슈탈트", "신경과학"][i % 4]}`,
      date: new Date(today.getTime() - (i % 30) * 24 * 60 * 60 * 1000), // 최근 30일 내 분산
      expert: ["freud", "jung", "gestalt", "neuroscience"][i % 4],
      hasImage: i % 2 === 0,
      imageUrl: i % 2 === 0 ? `https://picsum.photos/seed/dream${i}/80/80` : undefined,
    }))
  );

  // 캘린더 연동용 날짜 배열
  const highlightedDates = dreamHistory.map((item) => item.date);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNickname = async () => {
    if (!editValue.trim()) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname: editValue }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "닉네임 업데이트 실패");
      }

      setNickname(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
      alert("닉네임을 변경하는 도중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(nickname);
    setIsEditing(false);
  };

  const handleDateClick = (date: Date) => {
    // 클릭된 날짜와 일치하는 꿈의 ID를 찾아서 상세 페이지로 라우팅
    const foundDream = dreamHistory.find(
      (item) =>
        item.date.getDate() === date.getDate() &&
        item.date.getMonth() === date.getMonth() &&
        item.date.getFullYear() === date.getFullYear()
    );

    if (foundDream) {
      router.push(`/dream-result/${foundDream.id}`);
    } else {
      alert(`${date.toLocaleDateString()}에는 저장된 해몽 기록이 없습니다.`);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-dream-purple-light mb-4" />
        <p className="text-sm">프로필 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* 1. 상단 프로필 및 잔여 횟수 카드 */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-dream-purple via-dream-blue to-dream-pink rounded-3xl blur-xl opacity-30 pointer-events-none" />
        
        <div className="relative bg-[#1c1c21]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* 유저 기본 정보 */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-dream-purple to-dream-pink p-[2px] shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <div className="w-full h-full bg-[#15151a] rounded-full flex items-center justify-center">
                <Moon className="w-8 h-8 text-dream-pink-light" />
              </div>
            </div>

            <div className="space-y-1.5">
              {/* 닉네임 수정 폼 */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      maxLength={15}
                      className="bg-white/10 border border-white/20 rounded-lg px-2 py-0.5 text-white text-base focus:outline-none focus:border-dream-purple-light"
                    />
                    <button 
                      onClick={handleSaveNickname} 
                      disabled={isSaving}
                      className="p-1 hover:bg-white/10 rounded text-green-400 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={handleCancelEdit} className="p-1 hover:bg-white/10 rounded text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-white">{nickname}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* 연동 소셜 및 이메일 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  {loginProvider === "google" ? (
                    <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs text-white">
                      {/* Google G 로고 심플 SVG */}
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.244 4.114-3.415 0-6.195-2.78-6.195-6.195s2.78-6.195 6.195-6.195c1.485 0 2.89.525 3.99 1.485l3.12-3.12C18.91 1.77 15.68 1 12.24 1 5.92 1 1 5.92 1 12.24S5.92 23.48 12.24 23.48c6.12 0 11.24-4.4 11.24-11.24 0-.68-.08-1.36-.24-1.955H12.24z"/>
                      </svg>
                      Google
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#FEE500]/10 border border-[#FEE500]/25 px-2 py-0.5 rounded text-xs text-[#FEE500]">
                      Kakao
                    </span>
                  )}
                  <span>{email}</span>
                </div>
                
                {/* 로그아웃 버튼 이메일 하단에 배치 */}
                <div className="pt-1">
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 text-xs text-red-400/80 hover:text-red-400 hover:underline transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 잔여 횟수 박스 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] md:min-w-[240px]">
            <div className="p-3 bg-dream-pink/10 rounded-xl text-dream-pink-light">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">잔여 꿈 해몽 횟수</p>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-dream-pink to-dream-purple">
                {remainingPasses}회
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 무의식 캘린더 섹션 */}
      <section className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* 캘린더 카드 */}
        <div className="md:col-span-5 relative">
          <div className="absolute -inset-1 bg-dream-blue/20 blur-xl rounded-[2rem] opacity-40 pointer-events-none" />
          <div className="relative bg-[#1c1c21]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays className="w-5 h-5 text-dream-blue-light" />
              <h3 className="text-lg font-bold text-white">나의 무의식 캘린더</h3>
            </div>
            <Calendar 
              highlightedDates={highlightedDates} 
              onDateClick={handleDateClick}
              className="max-w-none w-full"
            />
            <p className="text-xs text-slate-500 mt-4 text-center">
              * 보라색으로 강조된 날짜를 클릭하면 해당 해몽 리포트로 이동합니다.
            </p>
          </div>
        </div>

        {/* 3. 내역 리스트 (과거 꿈 해몽 기록 + 결제 내역) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* 과거 꿈 해몽 내역 */}
          <div className="bg-[#1c1c21]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-dream-purple-light" />
              <h3 className="text-lg font-bold text-white">꿈 해몽 기록</h3>
            </div>
            
            <div className="space-y-3">
              {dreamHistory.slice(0, visibleDreams).map((item) => (
                <Link
                  key={item.id}
                  href={`/dream-result/${item.id}`}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-white/15 rounded-xl transition-all group gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* 2. 이미지 추가 옵션 여부에 따른 분기 처리 */}
                    {item.hasImage && item.imageUrl ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.15)]">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      // 텍스트 전용 꿈 해석 내역에도 세련된 아이콘 로고(Sparkles) 적용
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-dream-purple/20 to-dream-pink/20 border border-white/10 flex-shrink-0 flex items-center justify-center text-dream-pink-light shadow-[0_0_10px_rgba(139,92,246,0.1)] group-hover:from-dream-purple/30 group-hover:to-dream-pink/30 transition-all duration-300">
                        <Sparkles className="w-5 h-5 text-dream-pink" />
                      </div>
                    )}
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-dream-purple-light transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.date.toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-dream-purple/20 text-dream-purple-light flex-shrink-0 font-medium">
                    {item.expert === "jung" ? "칼 융" : item.expert === "neuroscience" ? "신경과학" : item.expert === "freud" ? "프로이트" : "게슈탈트"}
                  </span>
                </Link>
              ))}

              {/* 3. 해몽 내역 '더보기' 버튼 적용 */}
              {dreamHistory.length > visibleDreams && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setVisibleDreams((prev) => prev + 3)}
                    className="text-xs text-dream-purple-light hover:text-white font-medium transition-all py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
                  >
                    이전 꿈 해몽 더보기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 결제 및 충전 내역 */}
          <div className="bg-[#1c1c21]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-dream-blue-light" />
              <h3 className="text-lg font-bold text-white">구매 및 충전 내역</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {purchaseHistory.slice(0, visiblePurchases).map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">{item.itemName}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{item.price.toLocaleString()}원</p>
                    <p className="text-[10px] text-dream-blue-light font-medium">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>

            {purchaseHistory.length > visiblePurchases && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setVisiblePurchases((prev) => prev + 3)}
                  className="text-xs text-dream-blue-light hover:text-white font-medium transition-all py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
                >
                  구매 내역 더보기
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 4. 로그아웃 세련된 커스텀 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-[#1a1a20]/95 border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-[0_0_35px_rgba(139,92,246,0.3)] text-center animate-in scale-in duration-300">
            {/* 상단 핑크/오렌지 라인 */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-dream-pink to-transparent" />
            
            <div className="p-3 bg-red-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-red-400">
              <LogOut className="w-5 h-5" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">로그아웃</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {isLoggingOut ? "무의식의 공간에서 로그아웃 중..." : "정말 로그아웃 하시겠습니까?"}
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="border-white/10 hover:bg-white/5 text-slate-300 w-24 rounded-xl py-5"
              >
                취소
              </Button>
              <Button
                disabled={isLoggingOut}
                onClick={async () => {
                  setIsLoggingOut(true);
                  try {
                    const response = await fetch("/api/auth/logout", {
                      method: "POST",
                    });
                    if (response.ok) {
                      window.location.href = "/";
                    } else {
                      throw new Error("로그아웃 실패");
                    }
                  } catch (err) {
                    console.error("로그아웃 에러:", err);
                    alert("로그아웃 처리 중 에러가 발생했습니다.");
                    setIsLoggingOut(false);
                    setShowLogoutModal(false);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white w-28 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)] py-5"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "로그아웃"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
