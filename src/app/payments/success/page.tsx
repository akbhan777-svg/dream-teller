"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMessage("결제 승인에 필요한 정보가 누락되었습니다.");
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          // 승인 완료 후 즉시 해몽 대기(결과) 페이지로 이동
          setTimeout(() => {
            router.push(`/dream-result/${orderId}`);
          }, 1500);
        } else {
          setStatus("error");
          setErrorMessage(data.error || "결제 승인 중 오류가 발생했습니다.");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("서버와 통신하는 중 문제가 발생했습니다.");
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-[#1c1c21]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dream-purple mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-white mb-2">결제 승인 중입니다...</h2>
            <p className="text-slate-400">창을 닫거나 새로고침하지 마세요.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">결제가 성공적으로 완료되었습니다!</h2>
            <p className="text-slate-400">잠시 후 해몽 결과 화면으로 이동합니다...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-4">결제 승인 실패</h2>
            <p className="text-red-400 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              홈으로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dream-purple"></div></div>}>
      <SuccessClient />
    </Suspense>
  );
}
