import { Metadata } from "next";
import MyPageClient from "./my-page-client";

export const metadata: Metadata = {
  title: "마이페이지 | Dream Teller",
  description: "나의 잔여 해몽 횟수, 무의식 캘린더, 그리고 과거 해몽 내역을 한눈에 확인해 보세요.",
};

export default function MyPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden pt-24 pb-20">
      {/* Background Aurora / Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-dream-purple/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-dream-blue/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] bg-dream-pink/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <MyPageClient />
      </div>
    </main>
  );
}
