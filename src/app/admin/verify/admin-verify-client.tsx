"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { verifyAndRegisterAdmin } from "@/app/actions/admin";

export default function AdminVerifyClient() {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!secretKey.trim()) {
      setError("보안 키를 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyAndRegisterAdmin(secretKey);
      if (res.success) {
        alert("관리자 권한 인증이 성공적으로 완료되었습니다!");
        router.push("/admin");
      } else {
        setError(res.error || "인증에 실패했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setError("서버 통신 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        <div className="relative bg-[#1c1c21]/90 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6 text-center overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dream-purple via-dream-blue to-dream-pink" />

          <div className="w-16 h-16 bg-dream-purple/20 border border-dream-purple/40 rounded-2xl flex items-center justify-center mx-auto text-dream-purple-light shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white mb-2">관리자 보안 인증</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              설정된 마스터 보안 키(ADMIN_SECRET_KEY)를 입력하시면<br />
              현재 로그인된 계정에 즉시 시스템 관리자 권한이 부여됩니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-dream-purple-light" />
                관리자 보안 키 (Secret Key)
              </label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => {
                  setSecretKey(e.target.value);
                  setError("");
                }}
                placeholder="보안 키를 입력하세요"
                disabled={isLoading}
                className="w-full bg-[#13131b] text-white p-4 rounded-xl border border-white/20 focus:border-dream-purple focus:outline-none text-sm placeholder:text-slate-500 shadow-inner"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 font-semibold px-1">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading || !secretKey.trim()}
              className="w-full bg-gradient-to-r from-dream-purple to-dream-pink hover:opacity-90 text-white font-bold py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>인증 확인 중...</span>
                </>
              ) : (
                <span>관리자 권한 승인받기</span>
              )}
            </Button>
          </form>

          <p className="text-[11px] text-slate-500 pt-2">
            * 인증 성공 시 텔레그램으로 시스템 보안 알림이 자동 발송됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
