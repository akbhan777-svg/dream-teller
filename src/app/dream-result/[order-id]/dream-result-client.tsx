"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Download, 
  Share2, 
  CheckCircle2, 
  RefreshCcw,
  Clock,
  Brain,
  Quote,
  Eye,
  EyeOff,
  ShieldAlert,
  Link as LinkIcon,
  ArrowRight,
  RefreshCw,
  Loader2,
  Calendar as CalendarIcon,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
// @ts-ignore
import ReactMarkdown from "react-markdown";
import { fetchOrderAndResultBypass, toggleDreamPublicAction } from "@/app/actions/order-action";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Kakao: any;
  }
}

interface DreamResultClientProps {
  orderId: string;
}

export default function DreamResultClient({ orderId }: DreamResultClientProps) {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [isTriggeringAi, setIsTriggeringAi] = useState(false);
  const supabase = createClient();
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const aiTriggeredRef = useRef(false);

  const [analyzingStep, setAnalyzingStep] = useState(0);
  const analyzingMessages = [
    "무의식의 조각들을 하나로 모으고 있습니다...",
    "선택하신 심리학적 관점으로 꿈을 해독 중입니다...",
    "상징적 의미와 현실의 연결고리를 찾는 중입니다...",
    "거의 다 되었습니다. 보고서를 마무리하고 있습니다..."
  ];

  const triggerAiGeneration = async () => {
    if (isTriggeringAi) return;
    try {
      setIsTriggeringAi(true);
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        console.log("AI Generation Triggered Successfully (Background)");
      } else {
        console.warn("AI Generation Trigger warning");
      }
    } catch (e) {
      console.error("Client AI trigger error:", e);
    } finally {
      setIsTriggeringAi(false);
    }
  };

  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    if (!resultData || resultData.analysis_status !== "completed") {
      stepInterval = setInterval(() => {
        setAnalyzingStep((prev) => (prev + 1) % analyzingMessages.length);
      }, 5000);
    }
    return () => clearInterval(stepInterval);
  }, [resultData]);

  const fetchData = async () => {
    try {
      const { order, error } = await fetchOrderAndResultBypass(orderId, undefined);
      
      if (error) {
        console.error("데이터 로드 에러:", error);
      }

      if (order) {
        setOrderData(order);
        const result = order.dream_results?.[0];
        if (result) {
          setResultData(result);
          setIsPublic((result as any).is_public || false);
        }

        // 소유권 확인 로직
        let owner = false;
        
        // 1. 회원 검증
        const { data: { user } } = await supabase.auth.getUser();
        if (user && order.user_id === user.id) {
          owner = true;
        }

        // 2. 비회원 검증
        if (!owner && !order.user_id) {
          const activeOrderId = sessionStorage.getItem("activeOrderId");
          const guestPhone = sessionStorage.getItem("guestLoginPhone") || sessionStorage.getItem("guestPhone");
          const guestPassword = sessionStorage.getItem("guestLoginPassword") || sessionStorage.getItem("guestPassword");
          
          if (activeOrderId === order.id || activeOrderId === order.order_number) {
            owner = true;
          } else if (
            order.guest_phone && 
            order.guest_password &&
            guestPhone === order.guest_phone &&
            guestPassword === order.guest_password
          ) {
            owner = true;
          }
        }
        
        setIsOwner(owner);
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orderId]);

  useEffect(() => {
    if (!resultData || (resultData.analysis_status !== "completed" && resultData.analysis_status !== "failed")) {
      if (!aiTriggeredRef.current) {
        aiTriggeredRef.current = true;
        triggerAiGeneration();
      }
    }
  }, []);

  useEffect(() => {
    if (resultData?.analysis_status === "completed" || resultData?.analysis_status === "failed") {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      return;
    }

    if (!pollingInterval.current && !loading) {
      pollingInterval.current = setInterval(() => {
        fetchData();
      }, 5000);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [resultData?.analysis_status, loading]);

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
          text: "AI가 분석한 내 꿈의 심층 의미를 확인해보세요!",
          url: window.location.href,
        }).catch(console.error);
      } else {
        alert("카카오톡 공유를 지원하지 않는 환경입니다.");
      }
    }
  };

  const handleDownloadImage = async () => {
    if (!resultData?.image_url) return;
    try {
      // 1. 이미지를 서버로부터 Blob 형태로 다운로드
      const response = await fetch(resultData.image_url);
      const blob = await response.blob();
      
      // 2. 고화질 보장(1000KB 이상)을 위해 무손실 PNG 포맷으로 강제 컨버팅 (Canvas 활용)
      const objectUrl = window.URL.createObjectURL(blob);
      const img = document.createElement('img');
      img.crossOrigin = "anonymous";
      img.src = objectUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // 3. 압축이 전혀 없는 원본 무손실 PNG (image/png) 포맷으로 파일 생성
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) throw new Error("Canvas toBlob failed");
          const pngUrl = window.URL.createObjectURL(pngBlob);
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `dream-teller-${orderData?.order_number || "image"}-hq.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(pngUrl);
          window.URL.revokeObjectURL(objectUrl);
        }, "image/png", 1.0);
      } else {
        throw new Error("Canvas context is null");
      }
    } catch (err) {
      console.error(err);
      alert("이미지 다운로드에 실패했습니다. 이미지를 길게 눌러 저장해주세요.");
    }
  };

  const handleTogglePublic = async (newVal: boolean) => {
    if (!resultData?.id) return;
    setIsTogglingPublic(true);
    try {
      const res = await toggleDreamPublicAction(resultData.id, newVal);
      if (res.success) {
        setIsPublic(newVal);
      } else {
        alert(res.error || "상태 변경에 실패했습니다.");
      }
    } catch (err: any) {
      alert("오류가 발생했습니다.");
    } finally {
      setIsTogglingPublic(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-dream-purple/10 rounded-full blur-[100px] animate-pulse" />
        <div className="text-center relative z-10 space-y-6">
          <div className="w-16 h-16 border-4 border-dream-purple/30 border-t-dream-pink rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium animate-pulse">데이터를 불러오는 중입니다...</p>
        </div>
      </main>
    );
  }

  if (!orderData) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
            <ShieldAlert className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">결과를 찾을 수 없습니다</h1>
            <p className="text-slate-400">주문 정보가 없거나 삭제되었습니다.</p>
          </div>
          <Button onClick={() => router.push("/")} variant="outline" className="mt-4 border-white/10 text-white hover:bg-white/5">
            홈으로 돌아가기
          </Button>
        </div>
      </main>
    );
  }

  if (orderData.payment_status !== "paid" && orderData.payment_status !== "completed") {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="relative max-w-md w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-lg" />
          <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">결제가 완료되지 않은 주문입니다.</h1>
            <p className="text-slate-400 text-sm mb-8">
              정상적으로 결제된 주문 건만 해몽 결과를 확인할 수 있습니다.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/")} className="bg-white/10 hover:bg-white/20 text-white border-none py-6 rounded-xl">
                홈으로
              </Button>
              <Button 
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
  const isFailed = resultData && resultData.analysis_status === "failed";
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
        {isFailed ? (
          <div className="relative animate-in fade-in duration-700">
            <div className="relative bg-[#18181b]/95 backdrop-blur-2xl border border-red-500/30 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl space-y-8">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                <ShieldAlert className="w-10 h-10 text-red-400" />
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  해몽 분석 중 오류가 발생했습니다
                </h1>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  일시적인 서버 문제이거나 네트워크 지연일 수 있습니다.<br />
                  이용권이 차감되었다면 자동으로 복구되니 안심하고 다시 시도해 주세요.
                </p>
              </div>
              <Button
                onClick={triggerAiGeneration}
                disabled={isTriggeringAi}
                className="bg-gradient-to-r from-dream-purple to-dream-pink text-white font-semibold py-6 px-8 rounded-xl shadow-lg"
              >
                {isTriggeringAi ? (
                  <>
                    <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
                    재요청 중...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-5 h-5 mr-2" />
                    해몽 다시 생성하기
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : !isCompleted ? (
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

                <div className="flex justify-center pt-2">
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
                    className="w-full sm:w-2/3 bg-gradient-to-r from-dream-purple to-dream-pink text-white font-bold py-6 rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <span>마이페이지에서 대기하기</span> <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="relative animate-in fade-in duration-700">
            <div className="absolute -inset-1 bg-gradient-to-br from-orange-100/20 via-dream-purple/30 to-dream-pink/20 rounded-[2.5rem] blur-xl opacity-70" />
            
            <div className="relative bg-[#18181b]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              
              <div className="p-8 md:p-10 text-center border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-dream-pink/20 blur-[80px] rounded-full" />
                <Sparkles className="w-8 h-8 text-dream-pink mx-auto mb-4 relative z-10" />
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 relative z-10">당신의 꿈 해석이 완료되었습니다</h1>
                <p className="text-slate-400 text-sm font-mono relative z-10">Order ID: {orderData?.order_number || orderId}</p>
              </div>

              <div className="p-6 md:p-10 space-y-12">
                
                <section className="relative">
                  <Quote className="absolute -top-4 -left-4 w-12 h-12 text-white/5 rotate-180" />
                  <div className="relative z-10 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="text-xs font-semibold text-dream-purple-light uppercase tracking-wider mb-3">어젯밤 당신의 꿈</h3>
                    <p className="text-lg md:text-xl font-medium text-slate-200 leading-relaxed italic">
                      "{dreamInput}"
                    </p>
                  </div>
                </section>

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

                <section>
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-2 h-8 bg-gradient-to-b from-dream-purple to-dream-pink rounded-full" />
                    <h2 className="text-xl md:text-2xl font-bold text-white">{analysisTitle}</h2>
                  </div>
                  <div className="prose prose-invert max-w-none space-y-6">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}: any) => <h2 className="text-2xl md:text-3xl font-black text-white mt-12 md:mt-14 mb-6 md:mb-8 border-b border-white/10 pb-4 leading-tight break-keep" {...props} />,
                        h2: ({node, ...props}: any) => <h3 className="text-xl md:text-2xl font-bold text-dream-purple-light mt-10 md:mt-12 mb-5 md:mb-6 flex items-center gap-2.5 leading-snug break-keep"><span className="w-1.5 h-5 md:h-6 bg-dream-purple rounded-full inline-block shrink-0"></span><span {...props} /></h3>,
                        h3: ({node, ...props}: any) => <h4 className="text-lg md:text-xl font-bold text-dream-pink-light mt-8 md:mt-10 mb-4 md:mb-5 flex items-center gap-2.5 leading-snug break-keep"><span className="w-1.5 h-4 md:h-5 bg-dream-pink rounded-full inline-block shrink-0"></span><span {...props} /></h4>,
                        h4: ({node, ...props}: any) => <h5 className="text-base md:text-lg font-bold text-white mt-6 md:mt-8 mb-3 md:mb-4 flex items-center gap-2 leading-snug break-keep"><span className="w-1.5 h-4 bg-white/50 rounded-full inline-block shrink-0"></span><span {...props} /></h5>,
                        p: ({node, ...props}: any) => <p className="text-slate-300 leading-[1.8] md:leading-loose text-[15px] md:text-lg break-words" {...props} />,
                        ul: ({node, ...props}: any) => <ul className="space-y-3 md:space-y-4 my-5 md:my-6 ml-4 md:ml-6 list-disc marker:text-dream-purple-light" {...props} />,
                        ol: ({node, ...props}: any) => <ol className="space-y-3 md:space-y-4 my-5 md:my-6 ml-4 md:ml-6 list-decimal marker:text-dream-purple-light font-bold" {...props} />,
                        li: ({node, ...props}: any) => <li className="text-slate-300 text-[15px] md:text-lg leading-[1.8] md:leading-loose break-words pl-1" {...props} />,
                        strong: ({node, ...props}: any) => <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded text-dream-blue-light mx-0.5" {...props} />
                      }}
                    >
                      {analysisContent}
                    </ReactMarkdown>
                  </div>
                </section>

              </div>

              <div className="bg-black/40 border-t border-white/5 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {isOwner && (
                    <div className="flex items-center gap-4 bg-white/5 px-4 py-3 rounded-xl border border-white/10 w-full sm:w-auto">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">내 해몽 자랑하기</p>
                        <p className="text-xs text-slate-400">피드에 내 꿈과 해석을 공개합니다</p>
                      </div>
                      <Switch checked={isPublic} onCheckedChange={handleTogglePublic} disabled={isTogglingPublic} />
                    </div>
                  )}

                  <div className={cn("flex w-full sm:w-auto gap-3", !isOwner && "ml-auto")}>
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

                {/* 의료법 및 표시광고법 법적 면책 조항 (Medical Disclaimer) */}
                <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 text-center text-xs text-slate-400 leading-relaxed">
                  <p>
                    ℹ️ <strong>법적 안내:</strong> 본 서비스는 엔터테인먼트 목적의 AI 꿈 상징 분석 리포트이며, 전문적인 의학적·정신과적 진단이나 심리 치료를 대체하지 않습니다.
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        )}

      </div>
    </main>
  );
}