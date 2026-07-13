"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Quote, Sparkles, Share2, Download, Calendar as CalendarIcon, UserCheck, UserX, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";

// Kakao SDK 타입 선언 (테스트용)
declare global {
  interface Window {
    Kakao: any;
  }
}

export default function DreamResultPage() {
  const params = useParams();
  const orderId = params["order-id"] as string;

  // 테스트용 임시 상태
  const [isMember, setIsMember] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 카카오 SDK 초기화 (더미 키 사용)
  useEffect(() => {
    // 실제 환경에서는 카카오 개발자 센터에서 발급받은 JavaScript 키를 사용합니다.
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
      setTimeout(() => setIsCopied(false), 2000); // 2초 후 초기화
    } catch (err) {
      console.error("링크 복사에 실패했습니다.", err);
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleKakaoShare = () => {
    if (typeof window !== "undefined" && window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "Dream Teller - 나의 꿈 해몽 결과",
          description: "거대한 보라색 고래를 타고 핑크빛 구름 위를 끝없이 유영했어요.",
          imageUrl: "https://picsum.photos/seed/whale/800/600",
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
      // SDK 로드 전이거나 실패했을 경우의 Fallback
      if (navigator.share) {
        navigator.share({
          title: "Dream Teller - 나의 꿈 해몽 결과",
          url: window.location.href,
        }).catch(console.error);
      } else {
        alert("카카오톡 공유 기능을 사용할 수 없습니다. (Kakao SDK 미로드)");
      }
    }
  };

  // 더미 데이터
  const dreamInput = "거대한 보라색 고래를 타고 핑크빛 구름 위를 끝없이 유영했어요. 고래가 노래를 부를 때마다 별들이 쏟아져 내렸습니다.";
  const analysisTitle = "우주적 교감과 내면의 각성";
  const analysisContent = `집단 무의식의 거대한 심연을 상징하는 보라색 고래와 우주적 교감을 나누는 이 꿈은, 당신 내면의 깊은 영적 자각과 개성화(Individuation) 과정이 시작되었음을 의미합니다. 

핑크빛 구름은 현실의 불안이나 긴장에서 벗어나 무조건적인 수용과 평화를 갈구하는 심리 상태를 반영합니다. 고래의 노래를 통해 쏟아지는 별들은 무의식 깊은 곳에서 끌어올린 창조적 영감과 긍정적인 에너지를 나타내며, 이는 곧 당신의 일상에 새로운 활력과 통찰력으로 나타날 것입니다.

칼 융의 원형 분석에 따르면, 고래를 '타는' 행위는 압도적인 무의식의 힘에 휩쓸리지 않고 그것을 능동적으로 다루기 시작했음을 보여줍니다. 현재 진행 중인 중요한 결정이나 프로젝트가 있다면, 당신의 직관을 믿고 나아가도 좋습니다.`;

  // 캘린더 하이라이트용 더미 날짜 (오늘, 3일 전, 7일 전)
  const today = new Date();
  const dummyHighlightedDates = [
    today,
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
  ];

  return (
    <main className="min-h-screen bg-background relative pt-24 pb-20 overflow-hidden">
      {/* Background Aurora / Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-dream-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-dream-blue/10 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-3xl">
        
        {/* 상단 테스트용 멤버십 토글 (개발/테스트 목적) */}
        <div className="flex justify-end mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsMember(!isMember)}
            className="border-white/20 bg-black/50 backdrop-blur-md"
          >
            {isMember ? <><UserCheck className="w-4 h-4 mr-2 text-dream-pink" /> 회원 모드</> : <><UserX className="w-4 h-4 mr-2 text-slate-400" /> 비회원 모드</>}
          </Button>
        </div>

        {/* 결과 컨테이너 (Ivory Base Glow Effect 적용) */}
        <div className="relative">
          {/* 발광 효과 배경 */}
          <div className="absolute -inset-1 bg-gradient-to-br from-orange-100/20 via-dream-purple/30 to-dream-pink/20 rounded-[2.5rem] blur-xl opacity-70" />
          
          <div className="relative bg-[#18181b]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            
            {/* Header Area */}
            <div className="p-8 md:p-10 text-center border-b border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-dream-pink/20 blur-[80px] rounded-full" />
              <Sparkles className="w-8 h-8 text-dream-pink mx-auto mb-4 relative z-10" />
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 relative z-10">당신의 꿈 해석이 완료되었습니다</h1>
              <p className="text-slate-400 text-sm font-mono relative z-10">Order ID: {orderId || "DUMMY-ORDER-123"}</p>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-10 space-y-12">
              
              {/* 1. 유저 꿈 입력 내용 (Quote Style) */}
              <section className="relative">
                <Quote className="absolute -top-4 -left-4 w-12 h-12 text-white/5 rotate-180" />
                <div className="relative z-10 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-xs font-semibold text-dream-purple-light uppercase tracking-wider mb-3">어젯밤 당신의 꿈</h3>
                  <p className="text-lg md:text-xl font-medium text-slate-200 leading-relaxed italic">
                    "{dreamInput}"
                  </p>
                </div>
              </section>

              {/* 2. AI 생성 이미지 섹션 */}
              <section>
                <h3 className="text-xs font-semibold text-dream-blue-light uppercase tracking-wider mb-3 px-1">AI 시각화 이미지</h3>
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                  <Image 
                    src="https://picsum.photos/seed/whale/800/600" 
                    alt="AI가 생성한 꿈 이미지" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Download Button Overlay */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="icon" className="bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/20 rounded-full">
                      <Download className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </section>

              {/* 3. 전문가 해석 내용 */}
              <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="w-2 h-8 bg-gradient-to-b from-dream-purple to-dream-pink rounded-full" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">{analysisTitle}</h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-loose whitespace-pre-wrap text-base md:text-lg">
                    {analysisContent}
                  </p>
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
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
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
            </div>
            
          </div>
        </div>

        {/* 4. 나의 무의식 캘린더 섹션 (회원 전용) */}
        <div className="mt-12 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          {isMember ? (
            <div className="relative">
              <div className="absolute -inset-1 bg-dream-blue/20 blur-xl rounded-[2rem] opacity-50" />
              <div className="relative bg-[#1c1c21]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-dream-blue/20 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-dream-blue-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">나의 무의식 캘린더</h3>
                    <p className="text-sm text-slate-400">당신이 기록한 꿈의 발자취입니다.</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Calendar 
                    highlightedDates={dummyHighlightedDates} 
                    onDateClick={(date) => alert(`${date.toLocaleDateString()}의 해몽 기록으로 이동합니다.`)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#1c1c21] to-[#25252b] border border-white/10 border-dashed rounded-2xl p-8 text-center">
              <CalendarIcon className="w-10 h-10 text-slate-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-white mb-2">무의식의 기록을 모아보세요</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                회원가입 후 해몽을 진행하시면 캘린더에 나만의 꿈 일기가 차곡차곡 쌓입니다.
              </p>
              <Button variant="outline" className="border-dream-purple/50 text-dream-purple-light hover:bg-dream-purple/10">
                간편 회원가입 하기
              </Button>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
