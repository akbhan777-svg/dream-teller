"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  Mail, 
  Phone, 
  ShieldCheck, 
  FileText,
  ImageIcon
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * 더미 주문 상세 데이터 인터페이스
 * TODO: src/types/database.types.ts 또는 백엔드 API (GET /api/admin/orders/[id]) 타입 연동
 */
interface OrderDetail {
  id: string;
  orderNumber: string;
  tossPaymentKey: string;
  createdAt: string;
  approvedAt: string;
  user: {
    nickname: string;
    email: string;
    phone: string;
    role: "VIP 회원" | "일반 회원" | "비회원";
    provider: "google" | "kakao" | "guest";
  };
  payment: {
    status: "paid" | "failed" | "refunded";
    totalAmount: number;
    method: string;
  };
  content: {
    dreamText: string;
    expertField: string;
    includesImage: boolean;
  };
  result: {
    analysisStatus: "completed" | "processing" | "failed";
    analysisText: string;
    imageUrl?: string;
  };
}

/**
 * 더미 상세 주문 데이터
 */
const DUMMY_ORDER_DETAIL: OrderDetail = {
  id: "ord-001",
  orderNumber: "ORD-20260723-0001",
  tossPaymentKey: "toss_pk_live_20260723_abcdef123",
  createdAt: "2026-07-23 16:45:10",
  approvedAt: "2026-07-23 16:45:15",
  user: {
    nickname: "꿈꾸는호랑이",
    email: "dreamer_tiger@example.com",
    phone: "010-1234-5678",
    role: "VIP 회원",
    provider: "kakao",
  },
  payment: {
    status: "paid",
    totalAmount: 2000,
    method: "카카오페이 (신용카드)",
  },
  content: {
    dreamText:
      "어제 꿈에서 울창한 보라색 숲 속을 걷고 있었는데, 하늘에서 분홍색 빛을 내는 거대한 고래가 천천히 헤엄쳐 다녔습니다. 저는 그 고래를 보며 이상하게도 아주 깊은 평온함과 안도감을 느꼈습니다.",
    expertField: "칼 융 (분석심리학)",
    includesImage: true,
  },
  result: {
    analysisStatus: "completed",
    analysisText:
      "칼 융의 원형 분석에 따르면, 보라색 숲은 당신의 무의식 깊은 사유의 공간을 상징합니다. 하늘을 헤엄치는 빛나는 고래는 무의식의 거대한 지혜이자 '자기(Self)' 원형의 발현입니다. 당신이 고래를 보고 느낀 깊은 평온함은 최근의 정신적 스트레스가 해소되고 내면의 자아와 조화를 이루기 시작했음을 암시하는 매우 긍정적인 신호입니다.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop",
  },
};

interface PageProps {
  params: Promise<{ "order-id": string }>;
}

/**
 * 관리자 상세 주문 내역 페이지 (`/admin/order-list/[order-id]`)
 * PRD 5.3 - 3. 상세 주문 내역
 */
const AdminOrderDetailPage = ({ params }: PageProps) => {
  const { "order-id": orderId } = use(params);
  
  const [order, setOrder] = useState<OrderDetail>(DUMMY_ORDER_DETAIL);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenSuccessMsg, setRegenSuccessMsg] = useState("");

  // TODO: 백엔드 Server Action `getAdminOrderDetail` 또는 API (`GET /api/admin/orders/[id]`) 연동

  /**
   * LLM 해몽 재생성 트리거 핸들러
   * PRD 요구사항: 해몽 품질 보정을 위한 'LLM 해몽 재생성' 트리거
   * TODO: POST /api/admin/orders/[id]/regenerate API 연동
   */
  const handleRegenerate = async () => {
    if (!confirm("해당 주문의 AI 해몽 리포트 및 이미지를 재생성하시겠습니까?")) {
      return;
    }

    setIsRegenerating(true);
    setRegenSuccessMsg("");

    try {
      // 재생성 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setOrder((prev) => ({
        ...prev,
        result: {
          ...prev.result,
          analysisStatus: "completed",
          analysisText:
            "[보정된 AI 리포트] " +
            prev.result.analysisText +
            "\n\n(추가 분석: 보라색 숲과 고래의 조화는 새로운 창의적 에너지가 분출될 시기임을 말해줍니다.)",
        },
      }));
      setRegenSuccessMsg("LLM 해몽 재생성이 성공적으로 완료되었습니다.");
    } catch (err) {
      console.error("해몽 재생성 오류:", err);
      alert("해몽 재생성에 실패했습니다.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      {/* 상단 네비게이션 & 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/order-list"
            className="p-2 rounded-lg border border-border/50 bg-background hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                주문 상세 내역
              </h2>
              <Badge variant="outline" className="font-mono">
                {order.orderNumber}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              내부 ID: {orderId}
            </p>
          </div>
        </div>

        {/* 재생성 버튼 */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="gap-2 bg-dream-purple hover:bg-dream-purple/90 text-white shadow-md"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "LLM 해몽 재생성 중..." : "LLM 해몽 재생성"}
          </Button>
        </div>
      </div>

      {regenSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          {regenSuccessMsg}
        </div>
      )}

      {/* 대시보드 형태 그리드 레이아웃 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. 구매자 정보 */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-dream-purple" />
              구매자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> 닉네임
              </span>
              <span className="font-semibold">{order.user.nickname}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> 이메일
              </span>
              <span>{order.user.email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> 연락처
              </span>
              <span>{order.user.phone}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> 회원 등급
              </span>
              <Badge variant="secondary">{order.user.role}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 2. 결제 정보 */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-dream-purple" />
              결제 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-muted-foreground">결제 상태</span>
              {order.payment.status === "paid" ? (
                <Badge variant="success">결제 완료</Badge>
              ) : (
                <Badge variant="failed">결제 실패</Badge>
              )}
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-muted-foreground">총 결제 금액</span>
              <span className="font-bold text-base text-primary">
                {order.payment.totalAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-muted-foreground">토스 결제 키</span>
              <span className="font-mono text-xs text-muted-foreground">
                {order.tossPaymentKey}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> 승인 일시
              </span>
              <span className="text-xs text-muted-foreground">
                {order.approvedAt}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. 콘텐츠 정보 (유저 입력 원본 꿈 & 해석 관점) */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-dream-purple" />
            꿈 콘텐츠 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              선택된 전문 분석 관점
            </span>
            <Badge variant="outline" className="border-dream-purple text-dream-purple">
              {order.content.expertField}
            </Badge>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              유저 입력 원본 꿈 텍스트
            </span>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/40 text-sm leading-relaxed whitespace-pre-wrap">
              {order.content.dreamText}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. AI 분석 결과 (해몽 텍스트 & 이미지) */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-dream-purple" />
            AI 분석 결과 리포트
          </CardTitle>
          <CardDescription>
            Gemini 모델이 생성한 최종 해몽 분석 결과입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI 텍스트 리포트 */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-2">
              심층 해몽 리포트 텍스트
            </span>
            <div className="p-4 rounded-lg bg-dream-purple/5 border border-dream-purple/20 text-sm leading-relaxed whitespace-pre-wrap">
              {order.result.analysisText}
            </div>
          </div>

          {/* AI 생성 꿈 이미지 (옵션) */}
          {order.content.includesImage && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <ImageIcon className="h-4 w-4 text-dream-purple" />
                AI 시각화 이미지
              </span>
              {order.result.imageUrl ? (
                <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-border/40 shadow-md">
                  <Image
                    src={order.result.imageUrl}
                    alt="AI 생성 꿈 이미지"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                  이미지 생성 대기 중 또는 이미지가 생성되지 않았습니다.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrderDetailPage;
