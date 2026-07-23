"use client";

import { useState, useEffect, useCallback } from "react";
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
  orderId: string;
  title: string;
  date: Date;
  expert: string;
  hasImage: boolean;
  imageUrl?: string;
  status: "completed" | "analyzing";
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
  
  // DB에서 불러온 실제 데이터 State
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);
  const [dreamHistory, setDreamHistory] = useState<DreamHistoryItem[]>([]);
  
  // 로그아웃 커스텀 모달 상태
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // 페이지네이션용 노출 개수 상태 (기본 3개씩 노출)
  const [visibleDreams, setVisibleDreams] = useState(3);
  const [visiblePurchases, setVisiblePurchases] = useState(3);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/guest-login");
        return;
      }

      // 1. 유저 프로필 정보 조회
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile) {
        const userProf = profile as {
          nickname?: string;
          email?: string;
          provider?: "google" | "kakao";
          remaining_interprets?: number;
        };
        setNickname(userProf.nickname || "사용자");
        setEditValue(userProf.nickname || "사용자");
        setEmail(userProf.email || "");
        setLoginProvider((userProf.provider as "google" | "kakao") || "google");
        setRemainingPasses(userProf.remaining_interprets || 0);
      }

      // 2. 실제 DB orders & dream_results 조회
      const { data: ordersData, error: ordersError } = await (supabase
        .from("orders") as any)
        .select(`
          id,
          order_number,
          order_type,
          total_amount,
          payment_status,
          expert_field,
          dream_content,
          includes_image,
          created_at,
          dream_results (
            id,
            analysis_status,
            image_url,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!ordersError && ordersData) {
        // 결제 내역 바인딩
        const mappedPurchases: PurchaseHistoryItem[] = ordersData.map((order: any) => {
          let itemName = "1회 해석권 (단판)";
          if (order.order_type === "pass_charge_5") itemName = "5회 해석권 (다회권)";
          else if (order.order_type === "pass_charge_10") itemName = "10회 해석권 (다회권)";
          else if (order.order_type === "pass_use") itemName = "보유 잔여 횟수 사용";
          else if (order.includes_image) itemName = "1회 해석권 (단판 + AI 이미지)";

          let statusText = "결제 대기";
          if (order.payment_status === "paid") statusText = "결제 완료";
          else if (order.payment_status === "failed") statusText = "결제 실패";
          else if (order.payment_status === "refunded") statusText = "환불 완료";

          return {
            id: order.id,
            itemName,
            price: order.total_amount || 0,
            date: new Date(order.created_at).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: statusText,
          };
        });
        setPurchaseHistory(mappedPurchases);

        // 꿈 해석 내역 바인딩
        const mappedDreams: DreamHistoryItem[] = [];
        const nowTime = new Date().getTime();

        ordersData.forEach((order: any) => {
          const hasDreamRequest = Boolean(order.dream_content && order.dream_content.trim().length > 0);
          const isDreamOrderType = order.order_type === "single_interpretation" || order.order_type === "pass_use" || hasDreamRequest;

          if (order.payment_status === "paid" && isDreamOrderType) {
            const resultObj = Array.isArray(order.dream_results) 
              ? order.dream_results[0] 
              : order.dream_results;

            const isCompleted = resultObj && resultObj.analysis_status === "completed";
            
            const orderTime = new Date(order.created_at).getTime();
            const isRecent = nowTime - orderTime < 30 * 60 * 1000;
            const isAnalyzing = !isCompleted && isRecent;

            const titleSnippet = order.dream_content
              ? order.dream_content.length > 25
                ? order.dream_content.substring(0, 25) + "..."
                : order.dream_content
              : "꿈 해몽 요청";

            mappedDreams.push({
              id: resultObj?.id || order.id,
              orderId: order.order_number || order.id,
              title: isCompleted 
                ? `[해몽 완료] ${titleSnippet}` 
                : isAnalyzing 
                  ? `[AI 분석 진행 중] ${titleSnippet}`
                  : `[해몽 리포트] ${titleSnippet}`,
              date: new Date(order.created_at),
              expert: order.expert_field || "freud",
              hasImage: Boolean(order.includes_image),
              imageUrl: resultObj?.image_url,
              status: isAnalyzing ? "analyzing" : "completed",
            });
          }
        });

        setDreamHistory(mappedDreams);
      }
    } catch (err) {
      console.error("프로필 및 주문 내역 획득 실패:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 분석 진행 중인 해몽이 존재하는 경우 3초 간격으로 실시간 상태 자동 폴링
  useEffect(() => {
    const hasAnalyzing = dreamHistory.some((item) => item.status === "analyzing");
    if (!hasAnalyzing) return;

    const timer = setInterval(() => {
      fetchProfile();
    }, 3000);

    return () => clearInterval(timer);
  }, [dreamHistory, fetchProfile]);

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
    // 이미 선택된 날짜를 다시 클릭하면 필터 해제
    if (selectedDate && date.getTime() === selectedDate.getTime()) {
      setSelectedDate(undefined);
    } else {
      setSelectedDate(date);
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

  const filteredDreamHistory = selectedDate
    ? dreamHistory.filter(
        (item) =>
          item.date.getDate() === selectedDate.getDate() &&
          item.date.getMonth() === selectedDate.getMonth() &&
          item.date.getFullYear() === selectedDate.getFullYear()
      )
    : dreamHistory;

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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-dream-purple-light" />
                <h3 className="text-lg font-bold text-white">꿈 해몽 기록</h3>
              </div>
              {dreamHistory.some(d => d.status === "analyzing") && (
                <span className="flex items-center gap-1.5 text-xs bg-dream-purple/20 text-dream-pink-light border border-dream-purple/30 px-2.5 py-1 rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>AI 분석 진행 중...</span>
                </span>
              )}
            </div>

            {/* AI 분석 중 안내 배너 (분석 진행 중인 항목이 있는 경우만 노출) */}
            {dreamHistory.some(d => d.status === "analyzing") && (
              <div className="mb-4 p-3.5 bg-gradient-to-r from-dream-purple/20 to-dream-blue/20 border border-dream-purple/40 rounded-xl text-xs text-slate-200 flex items-start gap-2.5 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                <Sparkles className="w-4 h-4 text-dream-pink-light shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <p className="font-semibold text-white">현재 LLM AI가 심층 해몽 분석을 진행 중입니다!</p>
                  <p className="text-slate-300 mt-0.5">보통 1~3분 이내에 완료되며, 완료되면 아래 리스트에서 완성된 심층 분석 리포트를 확인하실 수 있습니다.</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {/* 날짜 필터링 활성화 시 헤더 표시 */}
              {selectedDate && (
                <div className="flex items-center justify-between bg-dream-purple/10 border border-dream-purple/30 rounded-xl p-3 mb-4 text-sm animate-in fade-in duration-300 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                  <div className="text-dream-purple-light font-medium flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {selectedDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}의 기록
                  </div>
                  <button 
                    onClick={() => setSelectedDate(undefined)}
                    className="text-white hover:text-dream-pink text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 backdrop-blur-md"
                  >
                    <X className="w-3 h-3" /> 전체 보기
                  </button>
                </div>
              )}

              {filteredDreamHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <Moon className="w-8 h-8 mx-auto mb-2 opacity-30 text-dream-purple" />
                  {selectedDate ? "선택하신 날짜에 저장된 해몽 기록이 없습니다." : "아직 신청하신 꿈 해몽 기록이 없습니다."}
                </div>
              ) : (
                filteredDreamHistory.slice(0, visibleDreams).map((item) => (
                  <Link
                    key={item.id}
                    href={`/dream-result/${item.orderId}`}
                    className={cn(
                      "flex items-center justify-between p-3.5 border rounded-xl transition-all group gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      item.status === "analyzing" 
                        ? "bg-dream-purple/10 border-dream-purple/40 hover:border-dream-purple/60" 
                        : "bg-white/5 border-white/5 hover:border-white/15"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* 이미지/아이콘 분기 */}
                      {item.status === "analyzing" ? (
                        <div className="w-12 h-12 rounded-lg bg-dream-purple/20 border border-dream-purple/40 flex-shrink-0 flex items-center justify-center text-dream-pink-light shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                          <Loader2 className="w-5 h-5 text-dream-purple-light animate-spin" />
                        </div>
                      ) : item.hasImage && item.imageUrl ? (
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
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-dream-purple/20 to-dream-pink/20 border border-white/10 flex-shrink-0 flex items-center justify-center text-dream-pink-light shadow-[0_0_10px_rgba(139,92,246,0.1)] group-hover:from-dream-purple/30 group-hover:to-dream-pink/30 transition-all duration-300">
                          <Sparkles className="w-5 h-5 text-dream-pink" />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0">
                        <p className={cn(
                          "text-sm font-semibold truncate transition-colors",
                          item.status === "analyzing" ? "text-dream-pink-light font-bold" : "text-white group-hover:text-dream-purple-light"
                        )}>
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.date.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full font-medium",
                        item.status === "analyzing" 
                          ? "bg-gradient-to-r from-dream-purple to-dream-pink text-white font-bold animate-pulse shadow-sm" 
                          : "bg-dream-purple/20 text-dream-purple-light"
                      )}>
                        {item.status === "analyzing" 
                          ? "분석 중..." 
                          : item.expert === "jung" ? "칼 융" : item.expert === "neuroscience" ? "신경과학" : item.expert === "freud" ? "프로이트" : "게슈탈트"}
                      </span>
                    </div>
                  </Link>
                ))
              )}

              {/* 더보기 / 접기 버튼 (꿈 해몽 기록) */}
              {filteredDreamHistory.length > 3 && (
                <div className="flex justify-center pt-3">
                  {visibleDreams < filteredDreamHistory.length ? (
                    <button
                      onClick={() => setVisibleDreams((prev) => prev + 3)}
                      className="text-xs text-dream-purple-light hover:text-white font-semibold transition-all py-2.5 px-5 rounded-xl border border-dream-purple/30 bg-dream-purple/10 hover:bg-dream-purple/20 hover:border-dream-purple/50 active:scale-[0.98] flex items-center gap-1.5 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                    >
                      <span>이전 꿈 해몽 더보기</span>
                      <span className="text-[10px] opacity-75 font-mono">({filteredDreamHistory.length - visibleDreams}개 더보기)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setVisibleDreams(3)}
                      className="text-xs text-slate-400 hover:text-white font-medium transition-all py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.98]"
                    >
                      꿈 해몽 기록 접기
                    </button>
                  )}
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
              {purchaseHistory.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  구매 및 충전 내역이 없습니다.
                </div>
              ) : (
                purchaseHistory.slice(0, visiblePurchases).map((item) => (
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
                ))
              )}
            </div>

            {/* 더보기 / 접기 버튼 (구매 및 충전 내역) */}
            {purchaseHistory.length > 3 && (
              <div className="flex justify-center pt-4">
                {visiblePurchases < purchaseHistory.length ? (
                  <button
                    onClick={() => setVisiblePurchases((prev) => prev + 3)}
                    className="text-xs text-dream-blue-light hover:text-white font-semibold transition-all py-2.5 px-5 rounded-xl border border-dream-blue/30 bg-dream-blue/10 hover:bg-dream-blue/20 hover:border-dream-blue/50 active:scale-[0.98] flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                  >
                    <span>구매 내역 더보기</span>
                    <span className="text-[10px] opacity-75 font-mono">({purchaseHistory.length - visiblePurchases}개 더보기)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setVisiblePurchases(3)}
                    className="text-xs text-slate-400 hover:text-white font-medium transition-all py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.98]"
                  >
                    구매 내역 접기
                  </button>
                )}
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
                      sessionStorage.clear();
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
