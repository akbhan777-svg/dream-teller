"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Quote, Sparkles, Share2, Download, Calendar as CalendarIcon, Link as LinkIcon, CheckCircle2, ShieldAlert, Loader2, Brain, Moon, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { fetchOrderAndResultBypass, toggleDreamPublicAction } from "@/app/actions/order-action";

// Kakao SDK 타입 선언
declare global {
  interface Window {
    Kakao: any;
  }
}

interface DreamResultClientProps {
  orderId: string;
  initialOrderData: any;
  initialResultData: any;
  initialIsForbidden: boolean;
  unauthorizedQuery: boolean;
}

export default function DreamResultClient({
  orderId,
  initialOrderData,
  initialResultData,
  initialIsForbidden,
  unauthorizedQuery,
}: DreamResultClientProps) {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [orderData, setOrderData] = useState<any>(initialOrderData);
  const [resultData, setResultData] = useState<any>(initialResultData);
  const [isForbidden, setIsForbidden] = useState(initialIsForbidden || unauthorizedQuery);
  
  const [isPublic, setIsPublic] = useState(Boolean(initialResultData?.is_public));
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [isTriggeringAi, setIsTriggeringAi] = useState(false);
  const aiTriggeredRef = useRef(false);

  // 로딩 멘트 순환 목록
  const analyzingMessages = [
    "어젯밤 당신이 꾸었던 꿈의 심리 기제를 파악하는 중입니다...",
    "선택하신 전문 관점으로 무의식의 억압된 상징을 정밀 해독 중입니다...",
    "AI 시각화 이미지 및 무의식 심층 해몽 리포트를 생성 중입니다...",
    "거의 다 완성되었습니다! 영혼의 문맥을 가다듬는 중입니다..."
  ];

  // AI 분석 트리거 함수 (클라이언트 단독 보완용)
  const triggerAiGeneration = async () => {
    setIsTriggeringAi(true);
    try {
      await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
    } catch (e) {
      console.error("Client AI trigger error:", e);
    } finally {
      setIsTriggeringAi(false);
    }
  };

  // 1. DB 실시간 데이터 조회 및 5초 폴링 (분석 진행 중일 때)
  useEffect(() => {
    // 이미 완료되었거나 권한이 없으면 폴링 불필요
    if (isForbidden || (resultData && resultData.analysis_status === "completed")) {
      return;
    }

    // 클라이언트 보완책: 브라우저에 접속 시 해몽이 아직 완료되지 않았으면 즉시 AI 파이프라인 트리거 (Vercel 서벌리스 프로세스 종료 대비)
    if (!aiTriggeredRef.current) {
      aiTriggeredRef.current = true;
      triggerAiGeneration();
    }

    let intervalId: NodeJS.Timeout;

    const fetchOrderAndResult = async () => {
      try {
        // orderId가 존재하므로 userId 폴백 없이 조회 가능 (불필요한 getUser 네트워크 요청 제거하여 언마운트 시 fetch 에러 방지)
        const { order: serverOrder } = await fetchOrderAndResultBypass(orderId, undefined);

        if (!serverOrder) {
          setIsForbidden(true);
          return;
        }

        if (unauthorizedQuery) {
          setIsForbidden(true);
          return;
        }

        setIsForbidden(false);
        setOrderData(serverOrder);
        const resultObj = Array.isArray(serverOrder.dream_results) ? serverOrder.dream_results[0] : serverOrder.dream_results;
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
      }
    };

    // 분석 진행 중이면 5초마다 폴링으로 상태 감지 및 Visibility API 연동
    intervalId = setInterval(() => {
      fetchOrderAndResult();
    }, 5000);

    // 사용자가 다른 탭으로 갔다가 다시 돌아왔을 때 즉각적인 상태 갱신(Resume)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchOrderAndResult();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [orderId, supabase, unauthorizedQuery, resultData?.analysis_status, isForbidden]);

  // 로딩 멘트 순환 롤링 타이머
  useEffect(() => {
    if (resultData?.analysis_status === "completed") return;

    const timer = setInterval(() => {
      setAnalyzingStep((prev) => (prev + 1) % analyzingMessages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [resultData?.analysis_status]);

  // 카카오 SDK 초기화
  useEffect(() => {
    if (typeof window !== "undefined" && window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || "dummy_kakao_key";
      try {
        window.Kakao.init(kakaoKey);
      } catch (e) {
        console.warn("Kakao SDK Init Warn:", e);
      }
    }
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleShareKakao = () => {
    if (typeof window !== "undefined") {
      if (window.Kakao && window.Kakao.isInitialized()) {
        try {
          window.Kakao.Share.sendDefault({
            objectType: "feed",
            content: {
              title: orderData?.expert_field ? `${orderData.expert_field} 관점 꿈 해몽 결과` : "AI 꿈 해몽 분석 결과",
              description: orderData?.dream_content ? orderData.dream_content.slice(0, 50) + "..." : "내 꿈의 숨겨진 무의식 상징을 확인해 보세요.",
              imageUrl: resultData?.image_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
              link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href,
              },
            },
            buttons: [
              {
                title: "해몽 리포트 보기",
                link: {
                  mobileWebUrl: window.location.href,
                  webUrl: window.location.href,
                },
              },
            ],
          });
        } catch (e) {
          console.error("Kakao Share Error:", e);
          alert("카카오톡 공유 호출 중 오류가 발생했습니다. 링크 복사 기능을 이용해 주세요.");
        }
      } else {
        alert("링크 복사 기능을 이용해 주세요.");
      }
    }
  };

  const handleDownloadImage = async () => {
    if (!resultData?.image_url) return;
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(resultData.image_url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error("Proxy download failed");

      const blob = await response.blob();
      
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleFactor = 2;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((pngBlob) => {
            if (!pngBlob) return;
            const downloadUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `dream_art_${orderId.slice(-6)}_hd.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
            URL.revokeObjectURL(objectUrl);
          }, "image/png", 1.0);
        }
      };
      img.src = objectUrl;
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
                  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
                  const user = authData?.user || null;
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
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-dream-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-dream-blue/10 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-3xl">
        {!isCompleted ? (
          <div className="relative animate-in fade-in duration-700">
            <div className="absolute -inset-1 bg-gradient-to-r from-dream-purple via-dream-blue to-dream-pink rounded-[2.5rem] blur-xl opacity-40 animate-pulse" />
            
            <div className="relative bg-[#18181b]/95 backdrop-blur-2xl border border-dream-purple/30 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl space-y-8">
              
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-dream-purple/20 border-t-dream-pink animate-spin" />
                <div className="w-20 h-20 bg-gradient-to-tr from-dream-purple to-dream-pink rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                  <Brain className="w-10 h-10 text-white animate-pulse" />
                </div>
              </div>

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

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>분석 대상 꿈 내용</span>
                  <span className="text-dream-purple-light font-medium">{expertName} 선택됨</span>
                </div>
                <p className="text-sm text-slate-200 line-clamp-2 italic">"{dreamInput}"</p>
              </div>

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
                    onClick={triggerAiGeneration}
                    disabled={isTriggeringAi}
                    variant="outline"
                    className="w-full sm:w-1/2 border-dream-purple/40 text-dream-purple-light hover:bg-dream-purple/20 font-bold py-6 rounded-xl flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={cn("w-4 h-4", isTriggeringAi && "animate-spin")} />
                    <span>{isTriggeringAi ? "해몽 생성 중..." : "🔄 AI 해몽 생성 시작하기"}</span>
                  </Button>

                  <Button
                    onClick={async () => {
                      const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
                      const user = authData?.user || null;
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
                    className="w-full sm:w-1/2 bg-gradient-to-r from-dream-purple to-dream-pink text-white font-bold py-6 rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <span>마이페이지에서 대기하기</span> <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* 1. 이미지 및 헤더 카드 */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#161622]/90 shadow-2xl">
              {resultData?.image_url && (
                <div className="relative aspect-square sm:aspect-[16/10] w-full overflow-hidden group">
                  <Image
                    src={resultData.image_url}
                    alt="AI 생성 꿈 비주얼 아트"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161622] via-[#161622]/40 to-transparent" />
                  
                  {/* 이미지 다운로드 전용 플로팅 버튼 */}
                  <button
                    onClick={handleDownloadImage}
                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer shadow-lg"
                  >
                    <Download className="w-4 h-4 text-dream-pink-light" />
                    <span>HD 이미지 저장</span>
                  </button>
                </div>
              )}

              <div className="p-6 md:p-10 space-y-6 relative z-10">
                {/* 상단 태그 */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-dream-purple/20 border border-dream-purple/40 text-dream-pink-light text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {expertName} 심층 분석 보고서
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
                      분석 완료
                    </span>
                  </div>

                  {/* 피드 공개 여부 스위치 토글 */}
                  <div className="flex items-center gap-2.5 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10">
                    <span className="text-xs text-slate-300 font-medium">공개 피드 자랑하기</span>
                    <Switch
                      checked={isPublic}
                      onCheckedChange={handleTogglePublic}
                      disabled={isTogglingPublic}
                      className="data-[state=checked]:bg-dream-purple"
                    />
                  </div>
                </div>

                {/* 내 꿈 내용 인용구 Box */}
                <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
                  <Quote className="w-8 h-8 text-dream-purple/40 absolute top-4 right-4 pointer-events-none" />
                  <span className="text-xs font-semibold text-dream-purple-light block">내가 작성한 꿈</span>
                  <p className="text-sm md:text-base text-slate-200 leading-relaxed italic">
                    "{dreamInput}"
                  </p>
                </div>
              </div>
            </div>

            {/* 2. 해몽 상세 텍스트 본문 */}
            <div className="rounded-[2.5rem] border border-white/10 bg-[#161622]/90 p-6 md:p-10 shadow-2xl space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2 border-b border-white/10 pb-4">
                <Brain className="w-6 h-6 text-dream-pink-light" />
                <span>심층 무의식 리포트</span>
              </h2>

              <div className="prose prose-invert max-w-none text-slate-200 text-base leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
                {analysisContent}
              </div>

              {/* 하단 공유 & 액션 바 */}
              <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1 sm:flex-none border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white rounded-xl py-5"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
                        복사완료!
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        결과 링크 복사
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleShareKakao}
                    className="flex-1 sm:flex-none bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] font-bold rounded-xl py-5 shadow-lg"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    카카오톡 공유
                  </Button>
                </div>

                <Button
                  onClick={() => router.push("/dream-teller")}
                  className="w-full sm:w-auto bg-gradient-to-r from-dream-purple to-dream-blue text-white font-bold rounded-xl py-5 px-8 shadow-lg hover:opacity-90 transition-opacity"
                >
                  다른 꿈 해몽하기
                </Button>
              </div>
            </div>

            {/* 의료 면책 조항 배너 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
              💡 본 서비스의 해몽 리포트는 엔터테인먼트 목적의 AI 상징 분석이며, 의학적/정신과적 전문 진단을 대체할 수 없습니다.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
