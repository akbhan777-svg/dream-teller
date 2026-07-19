"use client";

import { useEffect, useRef, useState } from "react";
import { loadTossPayments, TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";

interface PaymentWidgetProps {
  amount: number;
  orderId: string;
  orderName: string;
  customerKey: string;
  onSuccess?: () => void;
  onFail?: () => void;
}

// TODO: [토스페이먼츠 심사 완료 후] API 개별 연동 키(test_ck_...) 대신 토스 상점 관리자 콘솔에서 발급받은 '결제위젯 전용 클라이언트 키(test_gck_...)'를 .env.local의 NEXT_PUBLIC_TOSS_CLIENT_KEY에 설정해야 합니다.
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function PaymentWidget({ amount, orderId, orderName, customerKey, onSuccess, onFail }: PaymentWidgetProps) {
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [isReady, setIsReady] = useState(false);
  const widgetsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let widgetInstance: TossPaymentsWidgets | null = null;

    const initializeWidget = async () => {
      try {
        // TODO: Toss SDK 연동 시 API 개별 연동 키를 사용할 경우 위젯 SDK 미지원 에러가 발생함.
        const tossPayments = await loadTossPayments(clientKey);
        
        // Return early if unmounted
        if (!isMounted) return;

        // 고객 키로 초기화 (비회원은 고정키 ANONYMOUS)
        const initializedWidgets = tossPayments.widgets({
          customerKey,
        });

        widgetInstance = initializedWidgets;
        setWidgets(initializedWidgets);
      } catch (error) {
        console.error("토스페이먼츠 위젯 초기화 실패:", error);
      }
    };

    // React 18 Strict Mode의 이중 렌더링에 대비해 이벤트 루프의 다음 틱에서 실행
    const timeoutId = setTimeout(() => {
      initializeWidget();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      // 언마운트 시 인스턴스 파기가 가능하면 파기 (V2 SDK 구조에 맞춤)
      // 현재 공식 문서상 widgets 인스턴스의 파기 메소드가 제공되지 않지만,
      // DOM 엘리먼트 내부를 비워주는 것으로 충분합니다.
    };
  }, [customerKey]);

  useEffect(() => {
    if (!widgets) return;

    // 결제수단 위젯 렌더링
    widgets.setAmount({
      currency: "KRW",
      value: amount,
    });

    const renderWidgets = async () => {
      try {
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);
        setIsReady(true);
      } catch (error) {
        console.error("위젯 렌더링 에러:", error);
      }
    };

    renderWidgets();
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
    } catch (error) {
      console.error("결제 요청 실패:", error);
      if (onFail) onFail();
    }
  };

  return (
    <div className="w-full flex flex-col" ref={widgetsContainerRef}>
      {/* 위젯 영역 */}
      <div id="payment-method" className="w-full" />
      <div id="agreement" className="w-full mt-4" />

      {/* 결제하기 버튼 */}
      <div className="mt-8">
        <Button 
          onClick={requestPayment}
          disabled={!isReady}
          className="w-full bg-dream-blue hover:bg-dream-blue-light text-white font-bold py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
        >
          {isReady ? `${amount.toLocaleString()}원 결제하기` : "위젯 로딩 중..."}
        </Button>
      </div>
    </div>
  );
}
