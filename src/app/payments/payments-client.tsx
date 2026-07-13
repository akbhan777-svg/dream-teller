"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PaymentWidget from "@/components/payments/payment-widget";
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PaymentsClient() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [customerKey, setCustomerKey] = useState("");

  const amountParam = searchParams.get("amount");
  const planParam = searchParams.get("plan");
  const expertParam = searchParams.get("expert");

  const amount = amountParam ? parseInt(amountParam, 10) : 1500;
  
  let planName = "1회 해석권 (단판)";
  if (planParam === "pass5") planName = "5회 해석권 (다회권)";
  else if (planParam === "pass10") planName = "10회 해석권 (다회권)";
  else if (planParam === "use_pass") planName = "보유 횟수 사용";

  // 전문가 이름 매핑
  const expertMap: Record<string, string> = {
    freud: "프로이트",
    jung: "칼 융",
    neuroscience: "신경과학",
    gestalt: "게슈탈트"
  };
  const expertName = expertParam && expertMap[expertParam] ? expertMap[expertParam] : "전문가";
  const orderName = `[Dream Teller] ${expertName} 관점 - ${planName}`;

  useEffect(() => {
    // Generate unique order ID and customer key for widget init
    setOrderId(`ORDER_${Math.random().toString(36).substring(2, 11)}`);
    // 비회원은 ANONYMOUS, 회원은 고유 식별자 사용. 여기서는 테스트용 난수 발급.
    setCustomerKey(`CUSTOMER_${Math.random().toString(36).substring(2, 11)}`);
  }, []);

  if (!orderId || !customerKey) {
    return null; // or a skeleton loader
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
            onClick={() => window.location.href = "/payments/success"}
            className="w-full bg-gradient-to-r from-dream-purple to-dream-blue text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            차감하고 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto relative animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Glow Effect behind receipt */}
      <div className="absolute -inset-1 bg-gradient-to-b from-dream-purple via-dream-blue to-dream-pink rounded-3xl blur-xl opacity-30 pointer-events-none" />
      
      {/* Receipt Container */}
      <div className="relative bg-[#1c1c21]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Top Zig-zag pattern simulation */}
        <div className="w-full h-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDAgMTAsMTAgMjAsMCAyMCwxMCAwLDEwIiBmaWxsPSJyZ2JhKDE1LDE1LDE5LDAuNSkiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="px-6 md:px-8 py-8">
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

          {/* Total Amount */}
          <div className="flex justify-between items-end mb-8">
            <span className="text-slate-400">총 결제 금액</span>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-dream-pink to-dream-purple">
              {amount.toLocaleString()}<span className="text-lg text-slate-300 ml-1 font-normal">원</span>
            </div>
          </div>

          {/* Toss Payments Widget */}
          <div className={cn("p-1 rounded-xl bg-white/5 border border-white/10", "min-h-[400px]")}>
            <PaymentWidget 
              amount={amount} 
              orderId={orderId} 
              orderName={orderName} 
              customerKey={customerKey} 
            />
          </div>
        </div>
        
        {/* Bottom Zig-zag pattern simulation */}
        <div className="w-full h-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDEwLDAgMjAsMTAgMjAsMCAwLDAiIGZpbGw9InJnYmEoMTUsMTUsMTksMC41KSIvPjwvc3ZnPg==')] opacity-50 rotate-180" />
      </div>
    </div>
  );
}
