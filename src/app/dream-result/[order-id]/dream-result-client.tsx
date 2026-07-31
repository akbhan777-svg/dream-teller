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
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import { toggleDreamPublicAction } from "@/app/actions/dream-action";

interface DreamResultClientProps {
  orderId: string;
  initialOrderData: any;
  initialResultData: any;
}

export default function DreamResultClient({ orderId, initialOrderData, initialResultData }: DreamResultClientProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [orderData, setOrderData] = useState<any>(initialOrderData);
  const [resultData, setResultData] = useState<any>(initialResultData);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(initialResultData?.is_public || false);
  const [isTriggeringAi, setIsTriggeringAi] = useState(false);
  
  // 에러 또는 권한 없음 상태 관리
  const [isForbidden, setIsForbidden] = useState(false);

  // 로딩 애니메이션 텍스트 상태
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const analyzingMessages = [
    "꿈의 파편들을 수집하고 있습니다...",
    "무의식의 심연을 탐색하는 중입니다...",
    "핵심 상징과 감정을 추출하고 있습니다...",
    "전문 심리학적 관점으로 해독하는 중...",
    "거의 다 되었습니다. 결과를 정리하고 있습니다..."
  ];

  // AI 생성 API를 수동으로 호출하는 함수 (최초 진입 시 자동 호출, 또는 오류 발생 시 재시도)
  const triggerAiGeneration = async () => {
    setIsTriggeringAi(true);
    try {
      await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      // 호출 성공 시 별도 처리는 하지 않음. 아래 polling(fetchOrderAndResult)가 상태를 갱신해줌.
    } catch (err) {
      console.error("AI Trigger Request Failed:", err);
    } finally {
      setIsTriggeringAi(false);
    }
  };

  useEffect(() => {
    // 자동 AI 트리거: 결제 직후 진입 시 (resultData가 없거나, 아직 생성되지 않았을 경우)
    if (!resultData || (resultData.analysis_status !== "completed" && resultData.analysis_status !== "failed")) {
      triggerAiGeneration();
    }
  }, []); // orderId 변경은 발생하지 않으므로 빈 배열

  useEffect(() => {
    // 애니메이션 텍스트 변경 타이머
    const messageInterval = setInterval(() => {
      setAnalyzingStep((prev) => (prev + 1) % analyzingMessages.length);
    }, 4000);

    return () => clearInterval(messageInterval);
  }, []);

  const fetchOrderAndResult = async () => {
    try {
      // API Route를 통해 어드민 권한으로 조회 (RLS 우회)
      const res = await fetch(`/api/orders?order_number=${orderId}`);
      if (!res.ok) {
        if (res.status === 403) {
          setIsForbidden(true);
        }
        return;
      }
      const data = await res.json();
      
      if (data.order) {
        setOrderData(data.order);
        if (data.order.dream_results) {
          const resObj = Array.isArray(data.order.dream_results) 
            ? data.order.dream_results[0] 
            : data.order.dream_results;
          setResultData(resObj);
          if (resObj?.is_public !== undefined) {
            setIsPublic(resObj.is_public);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch order updates:", err);
    }
  };

  useEffect(() => {
    if (isForbidden) return;

    let intervalId: NodeJS.Timeout;

    if (resultData && resultData.analysis_status === "completed") {
      // 완료 시 폴링 중단
      return;
    }

    // 분석 진행 중이면 5초마다 폴링으로 상태 감지 및 Visibility API 연동
    intervalId = setInterval(() => {
      fetchOrderAndResult();
    }, 5000);

    // 브라우저 탭 활성화 시 즉시 체크
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
  }, [orderId, resultData?.analysis_status, isForbidden]);

  // Kakao Share
  const handleShare = () => {
    if (!resultData || resultData.analysis_status !== "completed") return;

    const shareUrl = `${window.location.origin}/dream-result/${orderId}`;
    
    // 카카오톡 공유 기능 연동 (카카오 SDK가 로드되어 있다고 가정)
    if (typeof window !== "undefined" && (window as any).Kakao) {
      const kakao = (window as any).Kakao;
      if (!kakao.isInitialized()) {
        kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
      }
      
      kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '내 무의식이 보내는 메시지 🌙',
          description: resultData.analysis_text?.substring(0, 50) + '...',
          imageUrl: resultData.image_url || 'https://dream-teller.com/og-image.jpg',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '해몽 결과 보기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } else {
      // Web Share API fallback
      if (navigator.share) {
        navigator.share({
          title: 'Dream Teller 해몽 결과',
          text: '나의 꿈 해몽 결과를 확인해보세요!',
          url: shareUrl,
        }).catch(console.error);
      } else {
        // 클립보드 복사 fallback
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('결과 링크가 클립보드에 복사되었습니다!');
        });
      }
    }
  };

  const handleDownloadImage = async () => {
    if (!resultData?.image_url) return;
    
    try {
      const response = await fetch(resultData.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dream_teller_${orderId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
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

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={triggerAiGeneration}
                    disabled={isTriggeringAi}
                    variant="outline"
                    className="w-full border-white/10 text-slate-300 hover:text-white"
                  >
                    {isTriggeringAi ? (
                      <>
                        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                        재요청 중...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        진행이 멈춘 것 같다면 (수동 생성)
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => router.push("/my-page")}
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    마이페이지에서 나중에 확인하기
                  </Button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* 해몽 결과 카드 */}
            <Card className="bg-[#18181b]/80 backdrop-blur-xl border-white/10 overflow-hidden shadow-2xl">
              
              {/* 이미지 영역 (포함된 주문일 경우에만 렌더링) */}
              {resultData?.image_url && (
                <div className="relative aspect-square md:aspect-[21/9] w-full overflow-hidden group">
                  <Image
                    src={resultData.image_url}
                    alt="꿈 해몽 이미지"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-80" />
                  
                  {/* 이미지 다운로드 버튼 */}
                  <Button
                    onClick={handleDownloadImage}
                    variant="secondary"
                    size="sm"
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white border-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    저장
                  </Button>

                  <div className="absolute bottom-6 left-6 right-6">
                    <Badge className="bg-dream-purple/80 text-white border-0 backdrop-blur-md mb-3 px-3 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {expertName} 관점 분석 완료
                    </Badge>
                  </div>
                </div>
              )}

              {/* 본문 영역 */}
              <div className="p-6 md:p-10 space-y-8">
                
                {/* 제목 (이미지가 없는 주문일 경우를 위해) */}
                {!resultData?.image_url && (
                  <div className="flex flex-col items-start gap-4 pb-4 border-b border-white/10">
                    <Badge className="bg-dream-purple/20 text-dream-pink-light border border-dream-purple/40 px-3 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {expertName} 관점 분석 완료
                    </Badge>
                  </div>
                )}

                {/* 내 꿈 내용 인용구 */}
                <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 italic text-slate-300">
                  <Quote className="absolute top-4 left-4 w-8 h-8 text-white/10 rotate-180" />
                  <p className="relative z-10 text-sm md:text-base leading-relaxed pl-6">
                    {dreamInput}
                  </p>
                </div>

                {/* 마크다운 해몽 본문 (Shadcn UI Typography 스타일 적용) */}
                <div className="prose prose-invert prose-slate max-w-none 
                  prose-headings:text-white prose-headings:font-bold 
                  prose-h1:text-2xl prose-h1:md:text-3xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-4 prose-h1:mb-8
                  prose-h2:text-xl prose-h2:text-dream-pink-light prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:text-dream-blue-light
                  prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
                  prose-strong:text-white prose-strong:bg-dream-purple/20 prose-strong:px-1.5 prose-strong:py-0.5 prose-strong:rounded-md
                  prose-ul:text-slate-300 prose-li:marker:text-dream-purple-light
                  prose-blockquote:border-l-dream-purple-light prose-blockquote:bg-white/5 prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg"
                >
                  <ReactMarkdown>{analysisContent}</ReactMarkdown>
                </div>
                
              </div>
            </Card>

            {/* 하단 액션 버튼 그룹 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-dream-purple to-dream-pink text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-dream-purple/25 transition-all"
              >
                다른 꿈 해몽하기
              </Button>
              
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full border-white/20 text-slate-200 py-6 text-lg hover:bg-white/10 rounded-xl"
              >
                <Share2 className="w-5 h-5 mr-2" />
                결과 공유하기
              </Button>
            </div>

            {/* 공개/비공개 토글 컨트롤 */}
            <Card className="bg-[#18181b]/50 border-white/5 p-6 rounded-xl mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4 text-left">
                  <div className={`p-2 rounded-lg shrink-0 transition-colors ${isPublic ? 'bg-green-500/10' : 'bg-slate-500/10'}`}>
                    {isPublic ? (
                      <Eye className="w-6 h-6 text-green-400" />
                    ) : (
                      <EyeOff className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-lg mb-1">
                      {isPublic ? "이 해몽은 피드에 공개되어 있습니다" : "이 해몽은 나만 볼 수 있습니다"}
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {isPublic 
                        ? "다른 사람들이 이 멋진 해몽과 이미지를 볼 수 있습니다." 
                        : "해석 결과를 피드에 공개하여 다른 사람들과 영감을 나눠보세요."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-white/5 shrink-0">
                  <Label htmlFor="public-toggle" className="text-sm font-medium text-slate-300 cursor-pointer">
                    {isPublic ? "공개 상태" : "비공개 상태"}
                  </Label>
                  <Switch
                    id="public-toggle"
                    checked={isPublic}
                    onCheckedChange={handleTogglePublic}
                    disabled={isTogglingPublic}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
            </Card>

          </div>
        )}
      </div>
    </main>
  );
}
