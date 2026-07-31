"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { loadTossPayments, TossPaymentsPaymentWidget } from "@tosspayments/payment-widget-sdk";
import { Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PaymentsClient() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "2000";
  const planParam = searchParams.get("plan") || "single";
  const expertParam = searchParams.get("expert") || "freud";
  const isLoggedInParam = searchParams.get("isLoggedIn") === "true";
  const includesImageParam = searchParams.get("includesImage") === "true";

  const [paymentWidget, setPaymentWidget] = useState<TossPaymentsPaymentWidget | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [customerKey, setCustomerKey] = useState<string>("ANONYMOUS");
  const [orderErrorMsg, setOrderErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [confirmedAmount, setConfirmedAmount] = useState<number>(Number(amount));
  
  const paymentMethodsWidgetRef = useRef<any>(null);
  const isFetchedRef = useRef(false);

  const PRICING = {
    single: { price: 2000, name: "1회 해석권 (단건 결제)", includesImage: false },
    pass5: { price: 5950, name: "5회 해석권 (다회권)", includesImage: true }, 
    pass10: { price: 8330, name: "10회 해석권 (다회권)", includesImage: true }, 
    singleImage: { price: 2500, name: "1회 해석권 (이미지 포함)", includesImage: true },
    use_pass: { price: 0, name: "잔여 횟수 사용", includesImage: true },
  };

  const DISCOUNT_PRICING = {
    singleImage: {
      price: 1190, 
    }
  };

  let expectedAmount = 0;
  let orderName = "";

  if (planParam === "pass5") {
    expectedAmount = PRICING.pass5.price;
    orderName = PRICING.pass5.name;
  } else if (planParam === "pass10") {
    expectedAmount = PRICING.pass10.price;
    orderName = PRICING.pass10.name;
  } else if (planParam === "use_pass") {
    expectedAmount = 0;
    orderName = PRICING.use_pass.name;
  } else {
    if (!isLoggedInParam) {
      expectedAmount = DISCOUNT_PRICING.singleImage.price;
      orderName = "1회 해석권 (비회원 할인/이미지포함)";
    } else {
      if (includesImageParam) {
        expectedAmount = PRICING.singleImage.price;
        orderName = PRICING.singleImage.name;
      } else {
        expectedAmount = PRICING.single.price;
        orderName = PRICING.single.name;
      }
    }
  }

  useEffect(() => {
    let isMounted = true;
    
    if (isFetchedRef.current) return;
    isFetchedRef.current = true;

    if (planParam === "use_pass") {
      setIsLoading(false);
      return;
    }

    const dreamContent = sessionStorage.getItem("dreamContent") || "";
    const guestPhone = sessionStorage.getItem("guestPhone") || "";
    const guestPassword = sessionStorage.getItem("guestPassword") || "";
    
    const createPendingOrder = async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(amount),
            plan: planParam || "single",
            expertField: expertParam || "freud",
            includesImage: includesImageParam,
            dreamContent,
            guestPhone,
            guestPassword
          })
        });
        
        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          throw new Error(`API 응답 파싱 실패 (상태 코드: ${res.status}) - Vercel 서버 에러일 수 있습니다.`);
        }

        if (isMounted) {
          if (data.success && data.orderId) {
            setOrderId(data.orderId);
            if (data.amount !== undefined) {
              setConfirmedAmount(Number(data.amount));
            }
            if (typeof window !== "undefined") {
              sessionStorage.setItem("activeOrderId", data.orderId);
            }
            const keyToUse = (!data.customerKey || data.customerKey === "00000000-0000-0000-0000-000000000000") ? "ANONYMOUS" : data.customerKey;
            setCustomerKey(keyToUse); 
          } else {
            console.error("Order creation failed:", data.error);
            setOrderErrorMsg(data.error || "주문서 생성에 실패했습니다.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Fetch order error:", err);
          setOrderErrorMsg(err.message || "알 수 없는 네트워크 오류가 발생했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    createPendingOrder();

    return () => {
      isMounted = false;
    };
  }, [amount, planParam, expertParam]);

  const handleUsePass = async () => {
    setIsLoading(true);
    const dreamContent = sessionStorage.getItem("dreamContent") || "";
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 0,
          plan: "use_pass",
          expertField: expertParam || "freud",
          dreamContent
        })
      });
      const data = await res.json();
      if (data.success && (data.uuid || data.orderId)) {
        sessionStorage.removeItem("dreamContent");
        // 즉시 차감 및 결제 승인되었으므로 해몽 대기 페이지로 이동
        window.location.href = `/dream-result/${data.uuid || data.orderId}`;
      } else {
        alert("잔여 횟수 사용에 실패했습니다: " + data.error);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Use pass error:", err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dream-purple"></div>
      </div>
    );
  }

  // 보유 횟수 차감 처리인 경우 별도의 UI 제공 (결제 모듈 미사용)
  if (planParam === "use_pass") {
    return (
      <div className="w-full max-w-md mx-auto relative mt-10">
        <div className="relative bg-glass backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.15)] text-center">
          <Receipt className="w-12 h-12 text-dream-purple mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">잔여 횟수 사용</h2>
          <p className="text-slate-300 mb-8">
            보유하신 해몽 횟수 1회를 차감하여 분석을 시작합니다.
          </p>
          <div className="p-4 bg-black/40 rounded-xl border border-white/10 mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">분석 옵션</span>
              <span className="text-white font-medium">{orderName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">차감 횟수</span>
              <span className="text-dream-pink font-bold">1회</span>
            </div>
          </div>
          <button 
            onClick={handleUsePass}
            className="w-full bg-gradient-to-r from-dream-purple to-dream-blue text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            차감하고 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="w-full max-w-md mx-auto relative mt-10 text-center">
        <div className="bg-[#1c1c21]/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-5">
          <Receipt className="w-12 h-12 text-slate-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">주문서 생성 중 일시적 연결 지연</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            네트워크 연결이 일시적으로 지연되었거나 주문서 생성이 완료되지 않았습니다.<br/>
            아래 버튼을 눌러 주문서를 재생성해 주세요.
          </p>
          {orderErrorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mt-2 text-left break-all">
              에러 원인: {orderErrorMsg}
            </div>
          )}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => {
                isFetchedRef.current = false;
                window.location.reload();
              }}
              className="w-full bg-gradient-to-r from-dream-purple to-dream-blue text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-xs cursor-pointer"
            >
              🔄 주문서 다시 생성하기
            </button>
            <a
              href="/"
              className="w-full bg-white/5 border border-white/10 text-slate-300 font-medium py-3 rounded-xl hover:bg-white/10 transition-colors text-xs inline-block"
            >
              🏠 메인으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto relative">
      {/* Glow Effect behind receipt */}
      <div className="absolute -inset-1 bg-gradient-to-b from-dream-purple via-dream-blue to-dream-pink rounded-3xl blur-xl opacity-30 pointer-events-none" />
      
      {/* Receipt Container */}
      <div className="relative bg-[#1c1c21] border border-white/10 rounded-2xl shadow-2xl">
        
        {/* Top Zig-zag pattern simulation */}
        <div className="w-full h-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDAgMTAsMTAgMjAsMCAyMCwxMCAwLDEwIiBmaWxsPSJyZ2JhKDE1LDE1LDE5LDAuNSkiLz48L3N2Zz4=')] opacity-50 rounded-t-2xl" />
        
        <div className="px-5 sm:px-8 py-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Receipt className="w-6 h-6 text-dream-purple-light" />
            <h2 className="text-xl font-bold tracking-widest text-white uppercase">Receipt</h2>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 text-sm">주문 상품</span>
              <span className="text-white font-medium text-right max-w-[200px] break-keep">{orderName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">주문 번호</span>
              <span className="text-slate-300 font-mono text-xs">{orderId}</span>
            </div>
          </div>

          {/* Dashed divider */}
          <div className="border-t-2 border-dashed border-white/10 my-8 w-full" />

          {/* Toss Payment UI Mount Point */}
          <div id="payment-widget" className="bg-white/5 rounded-xl p-2 min-h-[300px]" />
          <div id="agreement" className="bg-white/5 rounded-xl p-2 mt-4" />

          <button
            onClick={async () => {
              if (!paymentWidget) {
                console.error("Payment widget not initialized");
                return;
              }
              const baseUrl = window.location.origin;
              try {
                await paymentWidget.requestPayment({
                  orderId,
                  orderName,
                  successUrl: `${baseUrl}/payments/success`,
                  failUrl: `${baseUrl}/payments/fail`,
                  customerEmail: "customer@example.com",
                  customerName: "회원",
                });
              } catch (err) {
                console.error("결제 요청 실패:", err);
              }
            }}
            className="w-full bg-gradient-to-r from-dream-purple via-dream-blue to-dream-pink text-white font-bold py-5 rounded-xl mt-8 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:opacity-90 hover:scale-[1.02] transition-all text-lg"
          >
            {confirmedAmount.toLocaleString()}원 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}