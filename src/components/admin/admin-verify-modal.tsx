"use client";

import React, { useState } from "react";
import { ShieldCheck, KeyRound, Loader2, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyAndRegisterAdmin } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

interface AdminVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminVerifyModal({ isOpen, onClose }: AdminVerifyModalProps) {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      setErrorMsg("관리자 보안 키를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const result = await verifyAndRegisterAdmin(secretKey.trim());
      if (result.error) {
        setErrorMsg(result.error);
      } else if (result.success) {
        alert("🎉 관리자 본인 인증에 성공했습니다! 관리자 대시보드로 이동합니다.");
        onClose();
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "인증 처리 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1c1c21] border border-dream-purple/40 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* 헤더 & 닫기 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-dream-purple/20 border border-dream-purple/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-dream-purple-light" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">관리자 본인 인증</h3>
              <p className="text-xs text-slate-400">보안 키 입력 후 관리자 권한 등록</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 안내문 */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-dream-pink-light shrink-0 mt-0.5" />
          <span>
            인가되지 않은 사용자의 무단 등록을 방지하기 위해 발급받으신 **관리자 보안 암호(Admin Secret Key)**를 입력해야만 관리자로 승인됩니다.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-dream-purple-light" />
              <span>관리자 보안 키 (Admin Secret Key)</span>
            </label>
            <Input
              type="password"
              placeholder="보안 암호를 입력하세요"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="bg-black/40 border-white/15 text-white placeholder:text-slate-500 rounded-xl py-3 focus:border-dream-purple-light"
              autoFocus
            />
            {errorMsg && (
              <p className="text-xs font-semibold text-red-400 pt-1">{errorMsg}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/15 text-slate-300 hover:bg-white/10 rounded-xl text-xs py-2.5 px-4"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-dream-purple to-dream-pink hover:opacity-90 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>인증 중...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>본인 인증 및 관리자 등록</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
