"use client";

import React, { useState } from "react";
import { Loader2, Phone } from "lucide-react";

interface PhoneRegistrationModalProps {
  onSuccess: (phoneNumber: string) => void;
}

export default function PhoneRegistrationModal({ onSuccess }: PhoneRegistrationModalProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");
    
    // 010-XXXX-XXXX 형식으로 포맷팅
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 정규식: 010-XXXX-XXXX
    const phoneRegex = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/;
    if (!phoneRegex.test(phone)) {
      setError("올바른 휴대폰 번호 형식을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "연락처 등록에 실패했습니다.");
      }

      // 등록 성공 시 상위 컴포넌트로 전달하여 모달을 닫음
      onSuccess(phone);
    } catch (err: any) {
      setError(err.message || "서버 통신 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1a24] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-dream-purple/20 border border-dream-purple/30 flex items-center justify-center">
              <Phone className="w-6 h-6 text-dream-pink" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-white mb-2">
            최초 1회 연락처 등록
          </h2>
          <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">
            원활한 서비스 제공, 결제 내역 안내 및 고객(CS) 상담을 위해<br/>
            최초 1회에 한해 연락처 등록이 필요합니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                maxLength={13}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-purple focus:ring-1 focus:ring-dream-purple transition-all text-center text-lg tracking-wider"
                required
              />
              {error && (
                <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 12}
              className="w-full bg-gradient-to-r from-dream-purple to-dream-pink text-white font-bold rounded-xl py-3.5 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "등록 완료"
              )}
            </button>
          </form>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <div className="w-1 h-1 rounded-full bg-slate-500" />
            <span>등록된 연락처는 안전하게 암호화되어 보관됩니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
