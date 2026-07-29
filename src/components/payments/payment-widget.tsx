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

  const effectiveKey = (!customerKey || customerKey === "00000000-0000-0000-0000-000000000000") ? ANONYMOUS : customerKey;

  useEffect(() => {
    let isMounted = true;

    const initializeWidget = async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        
        if (!isMounted) return;

        const initializedWidgets = tossPayments.widgets({
          customerKey: effectiveKey,
        });

        setWidgets(initializedWidgets);
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

        const pmEl = document.getElementById("payment-method");
        const agEl = document.getElementById("agreement");

        if (pmEl && pmEl.getElementsByTagName("iframe").length > 0) {
          setIsReady(true);
          return;
        }

        // 결제수단 위젯 렌더링
        await widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        });

        // 약관 위젯 렌더링
        await widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        });

        if (isMounted) setIsReady(true);
      } catch (error: any) {
        console.error("위젯 렌더링 에러:", error);
        if (isMounted) {
          setWidgetError(
            `위젯 렌더링 실패: ${error?.message || "알 수 없는 에러"}\n` +
            `(토스 관리자 콘솔에서 결제 위젯의 variantKey가 'DEFAULT' 및 'AGREEMENT'로 설정되어 있는지 확인하세요.)`
          );
          setIsReady(true); // 에러가 나도 버튼은 활성화하여 사용자가 다시 시도하거나 에러를 볼 수 있게 함
        }
      }
    };

    renderWidgets();

    return () => {
      isMounted = false;
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
