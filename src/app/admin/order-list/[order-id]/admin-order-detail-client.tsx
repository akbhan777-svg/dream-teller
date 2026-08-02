"use client";

import React, { useState } from "react";
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
  ImageIcon,
  PlusCircle
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
import { regenerateDreamResult, getAdminOrderDetail, addManualCompensationPass } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

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
    role: string;
    provider: string;
  };
  payment: {
    status: string;
    totalAmount: number;
    method: string;
  };
  content: {
    dreamText: string;
    expertField: string;
    includesImage: boolean;
  };
  result: {
    analysisStatus: string;
    analysisText: string;
    imageUrl?: string;
  };
}

interface AdminOrderDetailClientProps {
  orderId: string;
  initialOrder: OrderDetail | null;
}

export default function AdminOrderDetailClient({ orderId, initialOrder }: AdminOrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(initialOrder);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenSuccessMsg, setRegenSuccessMsg] = useState("");
  const [isAddingPass, setIsAddingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState("");

  const fetchOrder = async () => {
    try {
      const res = await getAdminOrderDetail(orderId);
      if (res.error === "Unauthorized" || res.error === "Not authenticated") {
        window.location.href = "/";
        return;
      }
      if (res.success && res.data) {
        const data = res.data;
        const user = data.users || {};
        const payment = Array.isArray(data.payments) ? (data.payments[0] || {}) : (data.payments || {});
        const dreamResult = Array.isArray(data.dream_results) ? (data.dream_results[0] || {}) : (data.dream_results || {});

        setOrder({
          id: data.id,
          orderNumber: data.order_number,
          tossPaymentKey: payment.payment_key || "-",
          createdAt: new Date(data.created_at).toLocaleString(),
          approvedAt: payment.approved_at ? new Date(payment.approved_at).toLocaleString() : "-",
          user: {
            nickname: user.nickname || "비회원",
            email: user.email || "-",
            phone: user.phone_number || data.guest_phone || "-",
            role: user.role || "게스트",
            provider: user.provider || "-",
          },
          payment: {
            status: data.payment_status,
            totalAmount: data.total_amount,
            method: payment.method || "-",
          },
          content: {
            dreamText: data.dream_content || "-",
            expertField: data.expert_field || "-",
            includesImage: data.includes_image || false,
          },
          result: {
            analysisStatus: dreamResult.analysis_status || "pending",
            analysisText: dreamResult.analysis_text || "분석 결과가 없습니다.",
            imageUrl: dreamResult.image_url || "",
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("해당 주문의 AI 해몽 리포트 및 이미지를 재생성하시겠습니까?")) {
      return;
    }

    setIsRegenerating(true);
    setRegenSuccessMsg("");

    try {
      const result = await regenerateDreamResult(orderId);
      if (result.success) {
        setRegenSuccessMsg("LLM 해몽 재생성이 성공적으로 요청되었습니다. 백그라운드에서 진행됩니다.");
        await fetchOrder(); // 새로고침
      } else {
         alert(`해몽 재생성 요청 실패: ${result.error}`);
      }
    } catch (err) {
      console.error("해몽 재생성 오류:", err);
      alert("해몽 재생성 중 오류가 발생했습니다.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAddPass = async () => {
    if (!order) return;
    if (!confirm("소비자 보상/오류 대응용으로 1회 해몽 이용권을 수동 충전하시겠습니까?")) return;
    
    setIsAddingPass(true);
    setPassSuccessMsg("");
    setRegenSuccessMsg("");

    try {
      const result = await addManualCompensationPass(orderId);
      if (result.success) {
        setPassSuccessMsg(`성공적으로 이용권 1회가 충전되었습니다. (현재 잔여: ${result.newRemaining}회)`);
        await fetchOrder();
      } else {
        alert(`충전 실패: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("이용권 충전 중 오류가 발생했습니다.");
    } finally {
      setIsAddingPass(false);
    }
  };

  if (!order) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        주문 내역을 찾을 수 없습니다.
      </div>
    );
  }

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

        {/* 버튼 그룹 */}
        <div className="flex items-center gap-3">
          {/* 에러 보상 이용권 수동 충전 버튼 */}
          <Button
            onClick={handleAddPass}
            disabled={isAddingPass}
            variant="outline"
            className="gap-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <PlusCircle className={`h-4 w-4 ${isAddingPass ? "animate-pulse" : ""}`} />
            {isAddingPass ? "충전 중..." : "이용권 수동 충전 (+1회)"}
          </Button>

          {/* 재생성 버튼 */}
          <Button
            onClick={handleRegenerate}
            disabled={isRegenerating || (order.payment.status !== "paid" && order.payment.status !== "completed")}
            className="gap-2 bg-dream-purple hover:bg-dream-purple/90 text-white shadow-md"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "LLM 해몽 재생성 중..." : "LLM 해몽 재생성"}
          </Button>
        </div>
      </div>

      {(regenSuccessMsg || passSuccessMsg) && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex flex-col gap-1">
          {regenSuccessMsg && <span>{regenSuccessMsg}</span>}
          {passSuccessMsg && <span>{passSuccessMsg}</span>}
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
              {(order.payment.status === "paid" || order.payment.status === "completed") ? (
                <Badge variant="success">결제 완료</Badge>
              ) : order.payment.status === "pending" ? (
                <Badge variant="outline" className="border-amber-500/50 text-amber-500">결제 대기</Badge>
              ) : order.payment.status === "refunded" ? (
                <Badge variant="secondary">환불 완료</Badge>
              ) : (
                <Badge variant="destructive">결제 실패</Badge>
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
            Gemini 모델이 생성한 최종 해몽 분석 결과입니다. (상태: {order.result.analysisStatus})
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
          {(order.content.includesImage || order.result.imageUrl) && (
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
}
