"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, CheckCircle2, ChevronRight, Phone, Calendar, 
  CreditCard, LogOut, ArrowLeft, Moon, Eye, Brain, HelpCircle, Loader2
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPhone = sessionStorage.getItem("guestLoginPhone");
      const storedPassword = sessionStorage.getItem("guestLoginPassword");

      // 비회원 로그인 세션이 없으면 로그인 페이지로 강제 리다이렉트
      if (!storedPhone || !storedPassword) {
        router.replace("/guest-login");
        return;
      }

      setPhone(storedPhone);

      // 더미 리스트 선언
      const dummyOrders: GuestOrder[] = [
        {
          id: "ORDER_g1b2c3d4",
          itemName: "1회 해석권 (단판) + 이미지 추가",
          price: 2000,
          date: "2026-07-14",
          status: "분석 완료",
          expert: "jung",
          dreamTitle: "거대한 은빛 용을 만나 구름 속을 비행하는 꿈",
          images: { url: "https://picsum.photos/seed/dragon/120/120" } // 단일 객체 (Object) 형태
        },
        {
          id: "ORDER_x5y6z7w8",
          itemName: "1회 해석권 (단판)",
          price: 1500,
          date: "2026-07-10",
          status: "분석 완료",
          expert: "freud",
          dreamTitle: "끝없는 미로를 헤매다가 밝은 출구를 찾는 꿈",
          images: [{ url: "https://picsum.photos/seed/maze/120/120" }] // 배열 (Array) 형태
        },
        {
          id: "ORDER_a1b2c3e4",
          itemName: "1회 해석권 (단판)",
          price: 1500,
          date: "2026-07-05",
          status: "분석 완료",
          expert: "neuroscience",
          dreamTitle: "벼랑 끝에서 아래를 내려다보며 느끼는 긴장감",
          images: undefined // 이미지 미포함
        }
      ];

      // 최근에 결제한 세션이 있다면 조회중인 번호와 대조하여 추가 주입
      const sessionContent = sessionStorage.getItem("dreamContent");
      const sessionPhone = sessionStorage.getItem("guestPhone");
      const sessionExpert = sessionStorage.getItem("expert") || "jung";
      const sessionPlan = sessionStorage.getItem("plan") || "single";

      if (sessionContent && sessionPhone === storedPhone) {
        const hasImg = sessionPlan !== "single" || sessionStorage.getItem("includeImage") === "true";
        const newOrder: GuestOrder = {
          id: "ORDER_session_active",
          itemName: sessionPlan === "single" ? (hasImg ? "1회 해석권 (단판) + 이미지 추가" : "1회 해석권 (단판)") : "다회권 이용 분석",
          price: sessionPlan === "single" ? (hasImg ? 2000 : 1500) : 0,
          date: new Date().toISOString().split('T')[0],
          status: "분석 완료",
          expert: sessionExpert,
          dreamTitle: sessionContent.slice(0, 30) + (sessionContent.length > 30 ? "..." : ""),
          images: hasImg ? { url: "https://picsum.photos/seed/session/120/120" } : undefined
        };
        dummyOrders.unshift(newOrder);
      }

      setOrders(dummyOrders);
      setIsChecking(false);
    }
  }, [router]);

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
    }
    router.replace("/guest-login");
  };

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-dream-purple-light mb-4" />
        <p className="text-sm">비회원 주문 내역을 조회하는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      
      {/* Header Profile Section */}
      <div className="rounded-2xl border border-white/10 bg-[#1f1f2e] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-dream-purple to-dream-blue flex items-center justify-center shadow-lg">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">비회원</span>
              <h2 className="text-lg font-bold text-white">{phone}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">임시 로그인 세션으로 보호되는 중입니다.</p>
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
            비회원 구매 및 해석 내역 ({orders.length}건)
          </h3>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#161622]/85 p-12 text-center text-slate-400">
            <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium">해당 연락처로 접수된 해몽 주문 내역이 없습니다.</p>
            <p className="text-xs text-slate-500 mt-1">번호를 다시 확인하시거나 새 해몽을 신청해 보세요.</p>
            <Link href="/dream-teller" className="inline-block mt-6">
              <Button className="bg-gradient-to-r from-dream-purple to-dream-blue text-white font-bold px-6 py-2 rounded-xl text-sm">
                새 해몽 신청하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
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
                    {/* Thumbnail Image Display with Array/Object Fail-safe */}
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
          </div>
        )}
      </div>

      {/* Back to Home Button */}
      <div className="text-center pt-4">
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
