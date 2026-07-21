"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function FailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code") || "UNKNOWN_ERROR";
  const message = searchParams.get("message") || "결제 중 알 수 없는 오류가 발생했습니다.";
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // 백엔드에 실패 기록 전송
    if (orderId) {
      fetch("/api/payments/fail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, code, message }),
      }).catch((err) => console.error("Failed to log payment failure", err));
    }
  }, [orderId, code, message]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-[#1c1c21]/80 backdrop-blur-2xl border border-red-500/20 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">결제에 실패했습니다</h2>
        
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
          <p className="text-red-400 font-medium">{message}</p>
          <p className="text-red-500/60 text-sm mt-2">Error Code: {code}</p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => router.back()}
            className="w-full bg-dream-purple hover:bg-dream-purple-light text-white font-bold py-6 rounded-xl"
          >
            이전 화면으로 돌아가기
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 py-6 rounded-xl"
          >
            홈으로 가기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>}>
      <FailClient />
    </Suspense>
  );
}
