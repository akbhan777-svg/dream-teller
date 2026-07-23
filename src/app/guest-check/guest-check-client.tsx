"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, CheckCircle2, ChevronRight, Phone, Calendar, 
  CreditCard, LogOut, ArrowLeft, Moon, Eye, Brain, HelpCircle, Loader2,
  Gift, ArrowRight, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuestOrder {
  id: string;
  itemName: string;
  price: number;
  date: string;
  status: string;
  expert: string;
  dreamTitle: string;
  images?: { url: string } | { url: string }[]; // Supabase DB 1:1 관계 스키마 변동성 반영
}

const EXPERT_MAP: Record<string, { label: string; icon: any; color: string }> = {
  freud: { label: "프로이트", icon: Eye, color: "text-dream-pink-light" },
  jung: { label: "칼 융", icon: Moon, color: "text-dream-purple-light" },
  neuroscience: { label: "신경과학", icon: Brain, color: "text-dream-blue-light" },
  gestalt: { label: "게슈탈트", icon: Sparkles, color: "text-yellow-400" },
};

export default function GuestCheckClient() {
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [visibleOrders, setVisibleOrders] = useState(3);

  // 비회원 주문 목록 조회 함수
  const fetchGuestOrders = useCallback(async () => {
    if (typeof window === "undefined") return;

    let storedPhone = sessionStorage.getItem("guestLoginPhone");
    let storedPassword = sessionStorage.getItem("guestLoginPassword");

    // 비회원 결제 직후 세션 자동 동기화 처리
    if (!storedPhone || !storedPassword) {
      const gp = sessionStorage.getItem("guestPhone");
      const gpw = sessionStorage.getItem("guestPassword");
      if (gp && gpw) {
        storedPhone = gp;
        storedPassword = gpw;
        sessionStorage.setItem("guestLoginPhone", gp);
        sessionStorage.setItem("guestLoginPassword", gpw);
      }
    }

    // 비회원 로그인 세션이 없으면 로그인 페이지로 강제 리다이렉트
    if (!storedPhone || !storedPassword) {
      router.replace("/guest-login");
      return;
    }

    setPhone(storedPhone);

    try {
      const res = await fetch("/api/guest-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: storedPhone,
          password: storedPassword
        })
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const mappedOrders: GuestOrder[] = data.orders.map((ord: any) => {
          const resultObj = Array.isArray(ord.dream_results) ? ord.dream_results[0] : ord.dream_results;
          const isDone = resultObj && resultObj.analysis_status === "completed";
          const imgUrl = resultObj?.image_url;

          return {
            id: ord.order_number || ord.id,
            itemName: ord.order_type === "single_interpretation" 
              ? (ord.includes_image ? "1회 해석권 (단판 + AI 이미지)" : "1회 해석권 (단판)")
              : "다회권 이용 분석",
            price: ord.total_amount || 0,
            date: ord.created_at ? ord.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            status: isDone ? "분석 완료" : "분석 진행 중",
            expert: ord.expert_field || "jung",
            dreamTitle: ord.dream_content 
              ? (ord.dream_content.slice(0, 30) + (ord.dream_content.length > 30 ? "..." : ""))
              : "작성된 꿈 내용이 없습니다.",
            images: imgUrl ? { url: imgUrl } : undefined
          };
        });

        setOrders(mappedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch guest orders failed:", err);
      setOrders([]);
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  // 최초 로드
  useEffect(() => {
    fetchGuestOrders();
  }, [fetchGuestOrders]);

  // 분석 진행 중인 주문이 존재하는 경우 3초마다 자동으로 실시간 상태 폴링
  useEffect(() => {
    const hasAnalyzing = orders.some((ord) => ord.status === "분석 진행 중");
    if (!hasAnalyzing) return;

    const timer = setInterval(() => {
      fetchGuestOrders();
    }, 3000);

    return () => clearInterval(timer);
  }, [orders, fetchGuestOrders]);

  // RLS 우회 및 객체/배열 양방향 스키마 썸네일 누락 원천 방어 헬퍼
  const getThumbnailUrl = (order: GuestOrder): string | null => {
    if (!order.images) return null;
    
    // 1. 배열 형식으로 반환된 경우 안전하게 0번째 아이템의 url 추출
    if (Array.isArray(order.images)) {
      return order.images[0]?.url || null;
    }
    
    // 2. 단일 객체 형식으로 반환된 경우 바로 url 추출
    return order.images.url || null;
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("guestLoginPhone");
      sessionStorage.removeItem("guestLoginPassword");
      sessionStorage.removeItem("guestPhone");
      sessionStorage.removeItem("guestPassword");
      sessionStorage.removeItem("activeOrderId");
    }
    router.replace("/guest-login");
  };

  const totalPrice = orders.reduce((sum, ord) => sum + (ord.price || 0), 0);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-dream-purple-light mb-4" />
        <p className="text-sm">비회원 주문 내역을 조회하는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      
      {/* Header Profile Section */}
      <div className="rounded-2xl border border-white/10 bg-[#1f1f2e] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-dream-purple to-dream-blue flex items-center justify-center shadow-lg">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">비회원 주문자</span>
              <h2 className="text-lg font-bold text-white">{phone}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              임시 세션 정보로 주문 내역이 조회되었습니다.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-white/10 bg-black/20 text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer self-start md:self-auto"
        >
          <LogOut className="w-4 h-4 mr-2" />
          조회 종료
        </Button>
      </div>

      {/* Main Order List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-dream-purple-light" />
            비회원 구매 및 해석 내역 (총 {orders.length}건)
          </h3>
          {orders.length > 0 && (
            <span className="text-xs font-semibold text-dream-pink-light bg-dream-pink/10 px-3 py-1 rounded-full border border-dream-pink/20">
              총 결제 금액: {totalPrice.toLocaleString()}원
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#161622]/85 p-12 text-center text-slate-400">
            <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium">해당 연락처로 접수된 해몽 주문 내역이 없습니다.</p>
            <p className="text-xs text-slate-500 mt-1">번호를 다시 확인하시거나 새 해몽을 신청해 보세요.</p>
            <Link href="/dream-teller" className="inline-block mt-6">
              <Button 
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const storedPhone = sessionStorage.getItem("guestLoginPhone") || sessionStorage.getItem("guestPhone");
                    const storedPassword = sessionStorage.getItem("guestLoginPassword") || sessionStorage.getItem("guestPassword");
                    if (storedPhone && storedPassword) {
                      sessionStorage.setItem("guestPhone", storedPhone);
                      sessionStorage.setItem("guestPassword", storedPassword);
                    }
                  }
                }}
                className="bg-gradient-to-r from-dream-purple to-dream-blue text-white font-bold px-6 py-2 rounded-xl text-sm cursor-pointer"
              >
                새 해몽 신청하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, visibleOrders).map((order) => {
              const ExpIcon = order.expert && EXPERT_MAP[order.expert] ? EXPERT_MAP[order.expert].icon : HelpCircle;
              const expLabel = order.expert && EXPERT_MAP[order.expert] ? EXPERT_MAP[order.expert].label : "미정";
              const expColor = order.expert && EXPERT_MAP[order.expert] ? EXPERT_MAP[order.expert].color : "text-slate-400";
              const thumbnail = getThumbnailUrl(order);

              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/dream-result/${order.id}`)}
                  className="rounded-xl border border-white/10 bg-[#161622]/85 hover:border-dream-purple/40 hover:bg-[#1c1c2b] transition-all p-5 flex items-center justify-between gap-4 cursor-pointer group shadow-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Thumbnail Image Display */}
                    {thumbnail ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                        <Image
                          src={thumbnail}
                          alt="해몽 썸네일"
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-[#1a1a24] border border-white/10 flex-shrink-0 flex items-center justify-center">
                        <Moon className="w-6 h-6 text-dream-purple-light animate-pulse" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">{order.id}</span>
                        <span className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {order.date}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-white truncate max-w-sm group-hover:text-dream-purple-light transition-colors">
                        {order.dreamTitle}
                      </h4>
                      
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-semibold flex items-center gap-1", expColor)}>
                          <ExpIcon className="w-3.5 h-3.5" />
                          {expLabel} 분석
                        </span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-xs text-slate-400">{order.itemName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-dream-blue/20 text-dream-blue-light border border-dream-blue/30">
                        {order.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {order.price > 0 ? `${order.price.toLocaleString()}원` : "충전 차감"}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}

            {/* 더보기 / 접기 버튼 (비회원 구매 및 해석 내역) */}
            {orders.length > 3 && (
              <div className="flex justify-center pt-3">
                {visibleOrders < orders.length ? (
                  <button
                    onClick={() => setVisibleOrders((prev) => prev + 3)}
                    className="text-xs text-dream-purple-light hover:text-white font-semibold transition-all py-2.5 px-5 rounded-xl border border-dream-purple/30 bg-dream-purple/10 hover:bg-dream-purple/20 hover:border-dream-purple/50 active:scale-[0.98] flex items-center gap-1.5 shadow-[0_0_12px_rgba(139,92,246,0.15)] cursor-pointer"
                  >
                    <span>이전 비회원 주문 내역 더보기</span>
                    <span className="text-[10px] opacity-75 font-mono">({orders.length - visibleOrders}개 더보기)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setVisibleOrders(3)}
                    className="text-xs text-slate-400 hover:text-white font-semibold transition-all py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.98] flex items-center gap-1 cursor-pointer"
                  >
                    <span>접기</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 회원 전용 혜택 홍보 섹션 (요구사항 반영)                    */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl border border-dream-purple/30 bg-gradient-to-b from-[#1f1b2e]/90 via-[#161622]/90 to-[#12111a]/95 p-6 md:p-8 shadow-[0_0_40px_rgba(139,92,246,0.15)] space-y-6">
        {/* Glowing Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-dream-pink/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-dream-purple/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dream-purple/20 border border-dream-purple/40 text-dream-pink-light text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>회원 전용 특별 혜택</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight pt-1">
              회원이 되시면 더 많은 혜택이 있어요!
            </h3>
            <p className="text-xs md:text-sm text-slate-300">
              간단한 회원가입 하나로 나만의 무의식 캘린더와 프리미엄 AI 혜택을 누려보세요.
            </p>
          </div>
        </div>

        {/* 혜택 카드 그리드 */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 혜택 1: 다회권 할인 및 이미지 생성 무료 */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-dream-purple to-dream-pink flex items-center justify-center text-white shadow-md">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                다회권 할인 & AI 이미지 무료 제공
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                1회 해몽 대비 최대 40% 단가 할인 혜택과 함께, 무의식의 억압된 상징을 아트로 시각화하는 프리미엄 AI 이미지 생성 기능을 무료로 제공받으실 수 있습니다.
              </p>
            </div>
          </div>

          {/* 혜택 2: 모든 해몽 내용 캘린더로 관리 */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-dream-blue to-dream-purple flex items-center justify-center text-white shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                모든 해몽 내용 캘린더로 통합 관리
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                신청하신 모든 꿈 해몽 기록이 날짜별 나만의 무의식 캘린더에 자동으로 정리됩니다. 월별 심리 흐름과 반복되는 상징의 변화를 한눈에 모아보세요.
              </p>
            </div>
          </div>
        </div>

        {/* CTA 가입 유도 하단 바 */}
        <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/30 p-4 rounded-xl border border-white/10">
          <div className="text-xs text-slate-300">
            <span className="font-bold text-white">소셜 계정으로 3초만에 회원가입</span>하고 모든 해몽 내역을 안전하게 보관하세요.
          </div>
          <Link href="/auth" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-dream-purple via-dream-blue to-dream-pink text-white font-bold px-6 py-5 rounded-xl text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:opacity-90 transition-opacity">
              <span>3초만에 회원가입하고 혜택 받기</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Back to Home Button */}
      <div className="text-center pt-2">
        <Link href="/">
          <Button variant="ghost" className="text-slate-400 hover:text-white gap-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>

    </div>
  );
}

