import { Metadata } from "next";
import GuestLoginClient from "./guest-login-client";

export const metadata: Metadata = {
  title: "비회원 주문조회 로그인 | Dream Teller",
  description: "비회원 결제 시 입력했던 연락처와 비밀번호를 통해 해몽 리포트 내역을 조회해 보세요.",
};

export default function GuestLoginPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center pt-24 pb-20">
      {/* Background Aurora / Glow Effects */}
      <div className="absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] bg-dream-purple/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] bg-dream-blue/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[10000ms]" />

      <div className="container relative z-10 px-4 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <GuestLoginClient />
      </div>
    </main>
  );
}
