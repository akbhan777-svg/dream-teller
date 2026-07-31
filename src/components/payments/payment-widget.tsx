"use client";

import { useEffect, useRef, useState } from "react";
import { loadTossPayments, TossPaymentsWidgets, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";

interface PaymentWidgetProps {
  amount: number;
  orderId: string;
  orderName: string;
  customerKey: string;
  onSuccess?: () => void;
  onFail?: () => void;
}

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function PaymentWidget({ amount, orderId, orderName, customerKey, onSuccess, onFail }: PaymentWidgetProps) {
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [widgetError, setWidgetError] = useState<string>("");
  const widgetsContainerRef = useRef<HTMLDivElement>(null);
  const isRenderedRef = useRef(false);
  // 렌더링된 세부 UI 위젯 객체 (cleanup 시 destroy 용도)
  const renderedUIRef = useRef<{ paymentMethod: any, agreement: any } | null>(null);

  const effectiveKey = (!customerKey || customerKey === "00000000-0000-0000-0000-000000000000") ? ANONYMOUS : customerKey;

  // 1. 토스 위젯 인스턴스 생성
  useEffect(() => {
    let isMounted = true;
    isRenderedRef.current = false;

    const initializeWidget = async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        
        if (!isMounted) return;

        const initializedWidgets = tossPayments.widgets({
          customerKey: effectiveKey,
        });

        if (isMounted) setWidgets(initializedWidgets);
      } catch (error: any) {
        console.error("토스페이먼츠 위젯 초기화 실패:", error);
        if (isMounted) {
          setWidgetError(
            `위젯 초기화 실패: ${error?.message || "알 수 없는 에러"}\n` +
            `(Vercel 환경변수 NEXT_PUBLIC_TOSS_CLIENT_KEY가 정상적인 '클라이언트 키'인지 확인하세요.)`
          );
        }
      }
    };

    initializeWidget();

    return () => {
      isMounted = false;
    };
  }, [effectiveKey]);

  // 2. 토스 위젯 렌더링 (인스턴스당 단 1회 렌더링 보장 및 메모리 누수 방지)
  useEffect(() => {
    if (!widgets) return;

    let isMounted = true;

    const renderWidgets = async () => {
      try {
        await widgets.setAmount({
          currency: "KRW",
          value: amount,
        });

        if (!isMounted) return;

        // 이미 renderPaymentMethods가 호출된 인스턴스인 경우 중복 호출 방지
        if (isRenderedRef.current) {
          setIsReady(true);
          return;
        }

        const pmEl = document.getElementById("payment-method");
        const agEl = document.getElementById("agreement");

        if (pmEl) pmEl.innerHTML = "";
        if (agEl) agEl.innerHTML = "";

        isRenderedRef.current = true;

        // 결제수단 위젯 및 약관 위젯 동시 병렬 렌더링 (토스페이먼츠 SDK v2 규격)
        const [paymentMethodUI, agreementUI] = await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          })
        ]);

        renderedUIRef.current = { paymentMethod: paymentMethodUI, agreement: agreementUI };

        if (isMounted) {
          setIsReady(true);
        }
      } catch (error: any) {
        console.error("위젯 렌더링 에러:", error);
        // 하나의 결제수단 위젯 중복 렌더링 에러 시 안전하게 준비 완료로 간주
        if (error?.message?.includes("하나의 결제수단") || error?.message?.includes("이미")) {
          if (isMounted) setIsReady(true);
          return;
        }
        if (isMounted) {
          setWidgetError(
            `위젯 렌더링 실패: ${error?.message || "알 수 없는 에러"}`
          );
          setIsReady(true);
        }
      }
    };

    renderWidgets();

    return () => {
      isMounted = false;
      // 컴포넌트 언마운트 시 SDK 이벤트 리스너 해제를 위한 destroy 처리 (모바일 먹통 버그 방지)
      if (renderedUIRef.current) {
        try {
          renderedUIRef.current.paymentMethod?.destroy().catch(console.error);
          renderedUIRef.current.agreement?.destroy().catch(console.error);
        } catch (e) {
          console.error("위젯 초기화 해제 중 에러 무시:", e);
        }
        renderedUIRef.current = null;
      }
      isRenderedRef.current = false;
    };
  }, [widgets, amount]);

  const requestPayment = async () => {
    if (!widgets) return;

    try {
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: window.location.origin + "/payments/success",
        failUrl: window.location.origin + "/payments/fail",
        customerEmail: "customer123@gmail.com",
        customerName: "김토스",
        customerMobilePhone: "01012341234",
      });
    } catch (error: any) {
      console.error("결제 요청 실패:", error);
      if (error?.code === "USER_CANCEL" || error?.message?.includes("취소")) {
        return;
      }
      
      const errorMsg = error?.message || "알 수 없는 에러가 발생했습니다.";
      if (errorMsg.includes("카드 결제 정보") || errorMsg.includes("선택")) {
        alert("💡 신용/체크카드 결제를 위해 위젯 화면에서 원하시는 카드사를 선택해 주세요.");
      } else if (errorMsg.includes("테스트 환경") || error?.code === "INVALID_TEST_PAYMENT_METHOD") {
        alert("💡 페이코(PAYCO) 등 일부 결제 수단은 토스페이먼츠 테스트 환경에서 지원되지 않습니다.");
      } else {
        alert(`결제 안내: ${errorMsg}`);
      }

      if (onFail) onFail();
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[420px]" ref={widgetsContainerRef}>
      {widgetError && (
        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 text-xs whitespace-pre-wrap leading-relaxed">
          🚨 {widgetError}
        </div>
      )}
      
      {/* 위젯 영역 */}
      <div id="payment-method" className="w-full min-h-[280px]" />
      <div id="agreement" className="w-full mt-4 min-h-[120px]" />

      {/* 결제하기 버튼 */}
      <div className="mt-8">
        <Button 
          onClick={requestPayment}
          disabled={!isReady && !widgetError}
          className="w-full bg-dream-blue hover:bg-dream-blue-light text-white font-bold py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] cursor-pointer"
        >
          {isReady || widgetError ? `${amount.toLocaleString()}원 결제하기` : "위젯 로딩 중..."}
        </Button>
      </div>
    </div>
  );
}
