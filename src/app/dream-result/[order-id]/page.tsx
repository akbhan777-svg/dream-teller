"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Quote, Sparkles, Share2, Download, Calendar as CalendarIcon, Link as LinkIcon, CheckCircle2, ShieldAlert, Loader2, Brain, Moon, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { fetchOrderAndResultBypass, toggleDreamPublicAction } from "@/app/actions/order-action"; // Force Turbopack to recompile this Server Action import

// Kakao SDK 타입 선언
declare global {
  interface Window {
    Kakao: any;
  }
}

export default function DreamResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const orderId = params["order-id"] as string;

  // DB 실시간 데이터 State
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // UI 상태
  const [isPublic, setIsPublic] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [imageRetryCount, setImageRetryCount] = useState(0);

  // 로딩 멘트 순환 목록
  const analyzingMessages = [
    "어젯밤 당신이 꾸었던 꿈의 심리 기제를 파악하는 중입니다...",
    "선택하신 전문 관점으로 무의식의 억압된 상징을 정밀 해독 중입니다...",
    "AI 시각화 이미지 및 무의식 심층 해몽 리포트를 생성 중입니다...",
    "거의 다 완성되었습니다! 영혼의 문맥을 가다듬는 중입니다..."
  ];

  // 1. DB 실시간 데이터 조회 및 5초 폴링 (분석 진행 중일 때)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchOrderAndResult = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1-1. 서버 액션을 호출하여 RLS를 우회하고 데이터를 강제로 가져오기 (세션 충돌 방지)
        const { order: serverOrder, error } = await fetchOrderAndResultBypass(orderId, user?.id);

        let order = serverOrder;

        if (!order) {
          setIsForbidden(true);
          setLoading(false);
          return;
        }

        // 명시적 타인 강제 접근 테스트일 경우에만 403 처리
        if (searchParams.get("unauthorized") === "true") {
          setIsForbidden(true);
          setLoading(false);
          return;
        }

        setIsForbidden(false);

        setOrderData(order);
        const resultObj = Array.isArray(order.dream_results) ? order.dream_results[0] : order.dream_results;
        setResultData(resultObj);

        if (resultObj) {
          setIsPublic(Boolean(resultObj.is_public));
        }

        // 분석이 완료되었으면 폴링 중단
        if (resultObj && resultObj.analysis_status === "completed") {
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err) {
        console.error("해몽 데이터 조회 에러:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndResult();

    // 분석 진행 중이면 5초마다 폴링으로 상태 감지
    intervalId = setInterval(() => {
      fetchOrderAndResult();
    }, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId, supabase, searchParams]);

  // 로딩 멘트 순환 롤링 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setAnalyzingStep((prev) => (prev + 1) % analyzingMessages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [analyzingMessages.length]);

  // 카카오 SDK 초기화
  useEffect(() => {
    const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "YOUR_DUMMY_KAKAO_KEY";
    if (typeof window !== "undefined" && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        try {
          window.Kakao.init(KAKAO_KEY);
        } catch (e) {
          console.error("Kakao SDK 초기화 실패:", e);
        }
      }
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleKakaoShare = () => {
    if (typeof window !== "undefined" && window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "Dream Teller - 나의 꿈 해몽 결과",
          description: orderData?.dream_content || "나의 꿈 해몽 리포트",
          imageUrl: resultData?.image_url || "https://picsum.photos/seed/whale/800/600",
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: "해몽 결과 보기",
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } else {
      if (navigator.share) {
        navigator.share({
          title: "Dream Teller - 나의 꿈 해몽 결과",
          url: window.location.href,
        }).catch(console.error);
      } else {
        alert("링크 복사 기능을 이용해 주세요.");
      }
    }
  };

  const handleDownloadImage = async () => {
    if (!resultData?.image_url) return;
    try {
      // 서버 프록시 API를 호출하여 브라우저 CORS 제약 없이 100% 완벽한 원본 고화질 JPG 바이너리 받기
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(resultData.image_url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error("Proxy download failed");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `dream_art_${orderId.slice(-6)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      window.open(resultData.image_url, "_blank");
    }
  };

  const handleTogglePublic = async (newVal: boolean) => {
    if (!resultData?.id || isTogglingPublic) return;
    setIsTogglingPublic(true);
    try {
      const res = await toggleDreamPublicAction(resultData.id, newVal);
      if (res.success) {
        setIsPublic(newVal);
        alert(newVal ? "해몽 결과가 피드에 공개되었습니다! 🎉" : "해몽 결과가 비공개로 전환되었습니다.");
      } else {
        alert("상태 변경에 실패했습니다: " + (res.error || "권한 오류"));
        setIsPublic(!newVal); // Rollback
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
      setIsPublic(!newVal);
    } finally {
      setIsTogglingPublic(false);
    }
  };

  // 소유권 권한 에러 403 UI
  if (isForbidden) {
    return (
      <main className="min-h-screen bg-background relative pt-24 pb-20 overflow-hidden flex items-center justify-center">
        <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-md text-center">
          <div className="bg-[#18181b]/90 backdrop-blur-2xl border border-red-500/20 rounded-[2rem] p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">접근 권한이 없습니다</h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                해당 꿈 해석 리포트의 열람 권한이 없거나 존재하지 않는 주문입니다.<br />본인의 계정으로 로그인 또는 조회를 진행해 주세요.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <Button 
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-dream-purple to-dream-pink text-white font-semibold py-6 rounded-xl"
              >
                메인 페이지로 이동
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    router.push("/my-page");
                  } else {
                    router.push("/guest-login");
                  }
                }}
                className="w-full border-white/20 text-slate-300 py-6 rounded-xl"
              >
                내역/마이페이지로 이동하기
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 초기 쿼리 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-dream-purple-light mb-4" />
        <p className="text-sm">해몽 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 데이터 가공
  const isCompleted = resultData && resultData.analysis_status === "completed";
  const dreamInput = orderData?.dream_content || "작성된 꿈 내용이 없습니다.";
  const expertNameMap: Record<string, string> = {
    freud: "프로이트",
    jung: "칼 융",
    neuroscience: "신경과학",
    gestalt: "게슈탈트"
  };
  const expertName = expertNameMap[orderData?.expert_field] || "전문가";

  const analysisTitle = resultData?.analysis_title || `${expertName} 관점 무의식 심층 해몽`;
  const analysisContent = resultData?.analysis_text || 
    `현재 LLM 인공지능이 ${expertName} 관점으로 당신의 꿈을 심층 해독하고 있습니다.\n\n해몽 리포트 생성이 완료되면 이 페이지가 자동으로 업데이트됩니다.`;

  return (
    <main className="min-h-screen bg-background relative pt-24 pb-20 overflow-hidden">
      {/* Background Aurora / Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-dream-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-dream-blue/10 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-3xl">

        {/* ============================================================ */}
        {/* CASE A: AI 해몽 분석 진행 중 (Pending / Analyzing State)     */}
        {/* ============================================================ */}
        {!isCompleted ? (
          <div className="relative animate-in fade-in duration-700">
            <div className="absolute -inset-1 bg-gradient-to-r from-dream-purple via-dream-blue to-dream-pink rounded-[2.5rem] blur-xl opacity-40 animate-pulse" />
            
            <div className="relative bg-[#18181b]/95 backdrop-blur-2xl border border-dream-purple/30 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl space-y-8">
              
              {/* 회전 로딩 링 & 보라/핑크 빛 신비로운 중앙 아이콘 */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-dream-purple/20 border-t-dream-pink animate-spin" />
                <div className="w-20 h-20 bg-gradient-to-tr from-dream-purple to-dream-pink rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                  <Brain className="w-10 h-10 text-white animate-pulse" />
                </div>
              </div>

              {/* 메인 대기 타이틀 */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-dream-purple/20 text-dream-pink-light border border-dream-purple/40 px-4 py-1.5 rounded-full text-xs font-bold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 무의식 심층 해몽 분석 중</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {expertName} 관점으로 꿈을 분석하고 있습니다
                </h1>
                <p className="text-slate-300 text-sm max-w-md mx-auto h-12 flex items-center justify-center transition-all duration-500">
                  {analyzingMessages[analyzingStep]}
                </p>
              </div>

              {/* 제출된 꿈 내용 미리보기 카두 */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>분석 대상 꿈 내용</span>
                  <span className="text-dream-purple-light font-medium">{expertName} 선택됨</span>
                </div>
                <p className="text-sm text-slate-200 line-clamp-2 italic">"{dreamInput}"</p>
              </div>

              {/* 안내 카드 및 마이페이지 이동 편의 버튼 */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-left space-y-4">
                <div className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                  <Clock className="w-5 h-5 text-dream-blue-light shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white mb-1">💡 편안하게 대기해 주세요 (약 1~3분 소요)</p>
                    <p className="text-slate-400">
                      이 창을 열어두시면 분석이 완료되는 즉시 완성된 리포트로 자동 전환됩니다. 기다리지 않고 마이페이지로 이동하셔도 백그라운드에서 안전하게 해몽이 생성되며, 마이페이지에서 언제든지 결과를 확인하실 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        router.push("/my-page");
                      } else {
                        const gp = sessionStorage.getItem("guestPhone");
                        const gpw = sessionStorage.getItem("guestPassword");
                        if (gp && gpw) {
                          sessionStorage.setItem("guestLoginPhone", gp);
                          sessionStorage.setItem("guestLoginPassword", gpw);
                          router.push("/guest-check");
                        } else {
                          router.push("/guest-login");
                        }
                      }
                    }}
                    className="w-full bg-gradient-to-r from-dream-purple to-dream-pink text-white font-bold py-6 rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <span>마이페이지에서 대기하기</span> <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* CASE B: AI 해몽 분석 완료 (Completed Report State)           */
          /* ============================================================ */
          <div className="relative animate-in fade-in duration-700">
            {/* 발광 효과 배경 */}
            <div className="absolute -inset-1 bg-gradient-to-br from-orange-100/20 via-dream-purple/30 to-dream-pink/20 rounded-[2.5rem] blur-xl opacity-70" />
            
            <div className="relative bg-[#18181b]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              
              {/* Header Area */}
              <div className="p-8 md:p-10 text-center border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-dream-pink/20 blur-[80px] rounded-full" />
                <Sparkles className="w-8 h-8 text-dream-pink mx-auto mb-4 relative z-10" />
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 relative z-10">당신의 꿈 해석이 완료되었습니다</h1>
                <p className="text-slate-400 text-sm font-mono relative z-10">Order ID: {orderData?.order_number || orderId}</p>
              </div>

              {/* Content Area */}
              <div className="p-6 md:p-10 space-y-12">
                
                {/* 1. 유저 꿈 입력 내용 */}
                <section className="relative">
                  <Quote className="absolute -top-4 -left-4 w-12 h-12 text-white/5 rotate-180" />
                  <div className="relative z-10 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="text-xs font-semibold text-dream-purple-light uppercase tracking-wider mb-3">어젯밤 당신의 꿈</h3>
                    <p className="text-lg md:text-xl font-medium text-slate-200 leading-relaxed italic">
                      "{dreamInput}"
                    </p>
                  </div>
                </section>

                {/* 2. AI 시각화 이미지 섹션 (이미지 존재 시) */}
                {resultData?.image_url && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-dream-blue-light uppercase tracking-wider px-1">AI 시각화 이미지</h3>
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                      <Image 
                        key={imageRetryCount}
                        src={resultData.image_url} 
                        alt="AI가 생성한 꿈 이미지" 
                        fill 
                        unoptimized={true}
                        onError={() => {
                          if (imageRetryCount < 3) {
                            setTimeout(() => setImageRetryCount(prev => prev + 1), 1500);
                          }
                        }}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button
                        onClick={handleDownloadImage}
                        className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs py-2.5 px-4 rounded-xl border border-white/15 flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-dream-pink-light" />
                        <span>AI 아트워크 이미지 저장</span>
                      </Button>
                    </div>
                  </section>
                )}

                {/* 3. 전문가 해석 내용 */}
                <section>
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-2 h-8 bg-gradient-to-b from-dream-purple to-dream-pink rounded-full" />
                    <h2 className="text-xl md:text-2xl font-bold text-white">{analysisTitle}</h2>
                  </div>
                  <div className="prose prose-invert max-w-none space-y-6">
                    {analysisContent.split('\n').map((line, idx) => {
                      if (!line.trim()) return null;
                      
                      // 헤딩 처리 (# ~ ####)
                      const headerMatch = line.match(/^(#{1,4})\s+(.+)/);
                      if (headerMatch) {
                        const level = headerMatch[1].length;
                        const text = headerMatch[2].replace(/\*/g, ''); // 제목 안의 불필요한 별표 제거
                        
                        if (level === 1) {
                          return <h2 key={idx} className="text-2xl md:text-3xl font-black text-white mt-12 mb-6 border-b border-white/10 pb-4">{text}</h2>;
                        }
                        if (level === 2) {
                          return <h3 key={idx} className="text-xl md:text-2xl font-bold text-dream-purple-light mt-10 mb-5 flex items-center gap-2"><span className="w-1.5 h-6 bg-dream-purple rounded-full inline-block"></span>{text}</h3>;
                        }
                        return <h4 key={idx} className="text-lg md:text-xl font-bold text-dream-pink-light mt-8 mb-4 flex items-center gap-2"><span className="w-1.5 h-5 bg-dream-pink rounded-full inline-block"></span>{text}</h4>;
                      }

                      // 리스트(Bullet points) 처리 (- 또는 * 로 시작)
                      const listMatch = line.match(/^[-*]\s+(.+)/);
                      if (listMatch) {
                        const text = listMatch[1];
                        return (
                          <div key={idx} className="flex items-start gap-3 text-slate-300 text-base md:text-lg leading-loose pl-2">
                            <span className="text-dream-purple-light mt-2">•</span>
                            <span>{text}</span>
                          </div>
                        );
                      }

                      // 굵은 텍스트(**text**) 처리 및 일반 텍스트 렌더링
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={idx} className="text-slate-300 leading-loose text-base md:text-lg break-keep">
                          {parts.map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={i} className="text-white font-bold bg-white/5 px-1.5 py-0.5 rounded text-dream-blue-light">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </div>
                </section>

              </div>

              {/* Footer / Actions Area */}
              <div className="bg-black/40 border-t border-white/5 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* 공개 여부 토글 */}
                  <div className="flex items-center gap-4 bg-white/5 px-4 py-3 rounded-xl border border-white/10 w-full sm:w-auto">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">내 해몽 자랑하기</p>
                      <p className="text-xs text-slate-400">피드에 내 꿈과 해석을 공개합니다</p>
                    </div>
                    <Switch checked={isPublic} onCheckedChange={handleTogglePublic} disabled={isTogglingPublic} />
                  </div>

                  {/* 공유 버튼들 */}
                  <div className="flex w-full sm:w-auto gap-3">
                    <Button 
                      variant="outline"
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-none border-white/20 bg-black/50 hover:bg-white/10 text-white rounded-xl py-6 px-4"
                    >
                      {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                      {isCopied ? "복사완료" : "링크 복사"}
                    </Button>
                    
                    <Button 
                      onClick={handleKakaoShare}
                      className="flex-1 sm:flex-none bg-[#FEE500] hover:bg-[#FEE500]/90 text-black font-semibold rounded-xl py-6 px-6 shadow-[0_0_20px_rgba(254,229,0,0.2)]"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      카카오톡 공유
                    </Button>
                  </div>
                </div>

                {/* 다른 관점으로 다시 해몽하기 (1단계 스킵 & 2단계 직행 버튼) */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <Button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("isReinterpreting", "true");
                        if (orderData?.dream_content) {
                          sessionStorage.setItem("dreamContent", orderData.dream_content);
                        }
                        if (orderData?.guest_phone) {
                          sessionStorage.setItem("guestPhone", orderData.guest_phone);
                        }
                        if (orderData?.guest_password) {
                          sessionStorage.setItem("guestPassword", orderData.guest_password);
                        }
                      }
                      router.push("/dream-teller");
                    }}
                    className="w-full bg-gradient-to-r from-dream-purple via-dream-blue to-dream-pink hover:opacity-90 text-white font-bold py-6 rounded-xl shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
                  >
                    <Brain className="w-5 h-5" />
                    <span>다른 관점으로 다시 해몽하기</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
