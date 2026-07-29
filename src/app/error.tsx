"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught an error:", error);
    
    // ChunkLoadError (청크 해시 변경/캐시 미스) 발생 시 자동으로 최신 청크 로드를 위해 1회 자동 새로고침
    if (
      error?.name === "ChunkLoadError" || 
      error?.message?.includes("Failed to load chunk") ||
      error?.message?.includes("Loading chunk")
    ) {
      const chunkReloadKey = "chunk_reload_timestamp";
      const lastReload = sessionStorage.getItem(chunkReloadKey);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(chunkReloadKey, now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-[#1c1c21]/80 backdrop-blur-2xl border border-red-500/20 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          앗, 일시적인 오류가 발생했어요!
        </h2>
        
        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
          예기치 않은 문제가 발생해 페이지를 불러오지 못했습니다.<br />
          잠시 후 다시 시도해 주시거나 홈으로 이동해 주세요.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-black/30 p-4 rounded-lg text-left overflow-x-auto mb-6 border border-red-500/30">
            <p className="text-red-400 font-mono text-xs whitespace-pre-wrap break-all">
              {error.message || "알 수 없는 에러"}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="gap-2 bg-dream-purple hover:bg-dream-purple-light text-white rounded-xl py-6 flex-1 font-bold"
          >
            <RefreshCcw className="w-4 h-4" /> 다시 시도
          </Button>
          
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full gap-2 bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl py-6 font-bold cursor-pointer"
            >
              <Home className="w-4 h-4" /> 홈으로 이동
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
