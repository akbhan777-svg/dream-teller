import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-dream-purple/20 border-t-dream-pink animate-spin w-16 h-16" />
          <Loader2 className="w-8 h-8 text-dream-purple animate-pulse" />
        </div>
        <p className="text-sm text-slate-400 font-medium tracking-wide">
          로딩 중입니다...
        </p>
      </div>
    </div>
  );
}
