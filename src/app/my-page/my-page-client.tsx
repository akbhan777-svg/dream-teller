"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X, Moon, CreditCard, History, LogOut, Award, CalendarDays, Sparkles, Loader2 } from "lucide-react";
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
        item.date.getFullYear() === date.getFullYear() &&
        item.date.getMonth() === date.getMonth() &&
        item.date.getDate() === date.getDate()
    );

    if (foundDream) {
      router.push(`/dream-result/${foundDream.id}`);
    } else {
      alert(`${date.toLocaleDateString()}에는 작성한 꿈 일기가 없습니다.`);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
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
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 도중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
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
    <div className="min-h-screen bg-background relative overflow-hidden pt-24 pb-16 px-4 md:px-8">
      {/* 몽환적 백그라운드 디자인 */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-dream-purple/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-dream-blue/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* 상단 프로필 및 충전 안내 영역 */}
        <div className="relative bg-[#15151a]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-dream-purple to-transparent" />
          
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-dream-purple to-dream-pink p-[2px] shadow-[0_0_20px_rgba(139,92,246,0.25)] flex-shrink-0">
              <div className="w-full h-full bg-[#15151a] rounded-2xl flex items-center justify-center">
                <Moon className="w-8 h-8 text-dream-pink-light animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      maxLength={10}
                      className="bg-white/5 border border-white/15 rounded-lg px-2 py-0.5 text-sm text-white focus:outline-none focus:border-dream-purple-light max-w-[120px]"
                    />
                    <button 
                      onClick={handleSaveNickname}
                      disabled={isSaving}
                      className="p-1 hover:bg-white/5 rounded text-green-400 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="p-1 hover:bg-white/5 rounded text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{nickname}</h2>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      aria-label="닉네임 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-dream-purple/20 border border-dream-purple/30 text-dream-purple-light font-bold">
                  {loginProvider === "google" ? "Google" : "Kakao"} 회원
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-medium">{email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
            <div className="text-left md:text-right space-y-1">
              <p className="text-xs text-slate-400 font-semibold">보유 중인 분석 이용권</p>
              <div className="flex items-baseline gap-1 justify-start md:justify-end">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-dream-purple-light to-dream-pink-light">
                  {remainingPasses}
                </span>
                <span className="text-sm font-bold text-slate-300">회</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => router.push("/#pass-charge")}
                className="bg-gradient-to-r from-dream-purple to-dream-pink hover:opacity-90 text-white font-bold px-5 py-5 rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs md:text-sm"
              >
                충전하기
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-white/10 bg-black/20 text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer rounded-xl py-5 px-3"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 중단 레이아웃 분할 (해몽 기록 리스트 & 캘린더 / 결제 내역) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 해몽 역사 리스트 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-dream-purple-light" />
                나의 꿈 해몽 기록
              </h3>
              <span className="text-xs text-slate-400 font-medium">총 {dreamHistory.length}개</span>
            </div>

            <div className="space-y-4">
              {dreamHistory.slice(0, visibleDreams).map((dream) => (
                <div 
                  key={dream.id}
                  onClick={() => router.push(`/dream-result/${dream.id}`)}
                  className="group relative bg-[#15151a]/60 hover:bg-[#1a1a24]/80 border border-white/5 hover:border-white/15 rounded-2xl p-4 md:p-5 transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                      {dream.imageUrl ? (
                        <img 
                          src={dream.imageUrl} 
                          alt="AI Dream Thumbnail" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <Moon className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dream-purple/20 text-dream-purple-light">
                          {dream.expert === "freud" ? "프로이트" : dream.expert === "jung" ? "융" : dream.expert === "gestalt" ? "게슈탈트" : "신경과학"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {dream.date.toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <h4 className="text-sm md:text-base font-bold text-white truncate max-w-[90%]">{dream.title}</h4>
                    </div>
                  </div>

                  <span className="text-xs text-dream-pink font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    보기
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              ))}

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

          {/* 캘린더 연동 영역 */}
          <div className="bg-[#15151a]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-md h-fit space-y-4">
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-dream-blue-light" />
              해몽 캘린더
            </h3>
            
            <div className="bg-black/20 rounded-2xl p-2 border border-white/5">
              <Calendar 
                mode="single"
                onSelect={(date) => date && handleDateClick(date)}
                className="w-full text-white"
                modifiers={{
                  highlighted: highlightedDates
                }}
                modifiersClassNames={{
                  highlighted: "bg-dream-purple/40 text-white font-bold rounded-lg border border-dream-purple/60"
                }}
              />
            </div>
            
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              * 보라색으로 강조된 날짜는 꿈 기록 및 AI 분석이 완료된 날입니다. 날짜를 누르면 당시 결과 페이지로 즉시 이동합니다.
            </p>
          </div>

        </div>

        {/* 하단 레이아웃 분할 (결제 내역) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 결제 및 충전 내역 */}
          <div className="lg:col-span-2 bg-[#1c1c21]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
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

      </div>

      {/* 로그아웃 커스텀 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-[#15151a]/95 border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-[0_0_35px_rgba(139,92,246,0.3)] text-center animate-in scale-in duration-300">
            {/* 상단 포인트 데코 라인 */}
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
                onClick={confirmLogout}
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
