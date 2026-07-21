import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-4 overflow-hidden relative">
      {/* Background decorations matching the app theme */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-dream-purple/20 blur-[120px] mix-blend-screen" />
      
      <h2 className="mb-4 text-6xl font-black tracking-tighter text-white sm:text-8xl drop-shadow-lg">
        404
      </h2>
      <h3 className="mb-6 text-2xl font-bold tracking-tight text-white/90 sm:text-3xl">
        페이지를 찾을 수 없습니다
      </h3>
      
      <p className="mb-10 max-w-md text-lg text-slate-300 font-medium">
        요청하신 페이지가 사라졌거나 잘못된 경로입니다.<br />
        입력하신 주소를 다시 확인해 주세요.
      </p>
      
      <Link href="/" passHref>
        <div className="group relative inline-flex p-[2px] rounded-full bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]">
          <span className="absolute inset-0 bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
          <Button className="relative bg-background/80 backdrop-blur-md hover:bg-transparent text-lg font-bold text-white px-8 py-6 rounded-full border border-white/5 transition-all duration-300 z-10">
            메인 페이지로 돌아가기
          </Button>
        </div>
      </Link>
    </div>
  );
}
