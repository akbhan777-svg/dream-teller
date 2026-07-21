import { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "고객 지원 & 문의하기 | Dream Teller",
  description: "Dream Teller 서비스 이용 중 발생한 문의사항이나 결제 오류 등을 해결하실 수 있는 고객센터입니다.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden pt-28 pb-20 px-4">
      {/* Background Aurora / Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-dream-purple/10 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[7000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-dream-blue/10 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[9000ms]" />

      <div className="container relative z-10 mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <ContactClient />
      </div>
    </main>
  );
}
