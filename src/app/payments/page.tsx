import { Suspense } from "react";
import PaymentsClient from "./payments-client";

export const metadata = {
  title: "결제하기 | Dream Teller",
  description: "선택하신 꿈 해몽 옵션의 결제를 진행합니다.",
};

export default function PaymentsPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden pt-24 pb-20">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-dream-purple/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dream-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[20%] bg-dream-pink/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto flex justify-center">
        <Suspense fallback={<div className="text-white text-center py-20">결제 정보를 불러오는 중...</div>}>
          <PaymentsClient />
        </Suspense>
      </div>
    </main>
  );
}
