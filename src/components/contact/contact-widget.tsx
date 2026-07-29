"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "일반 문의",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim() || !formData.name.trim() || !formData.email.trim()) return;

    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setFormData({ name: "", email: "", category: "일반 문의", message: "" });
        }, 3000);
      } else {
        alert("문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen 
            ? "bg-slate-800 text-white rotate-90" 
            : "bg-gradient-to-r from-dream-purple to-dream-pink text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        )}
        aria-label="문의하기"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Contact Form Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] bg-[#1a1a20]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-dream-purple/20 to-dream-pink/20 p-5 border-b border-white/10">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-dream-pink-light" />
              1:1 문의하기
            </h3>
            <p className="text-xs text-slate-300 mt-1">궁금한 점이나 불편한 점을 남겨주시면<br/>최대한 빠르게 확인 후 답변드리겠습니다.</p>
          </div>

          {/* Body */}
          <div className="p-5">
            {isSuccess ? (
              <div className="py-10 text-center animate-in zoom-in duration-300">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <p className="font-bold text-white mb-2">문의가 성공적으로 접수되었습니다!</p>
                <p className="text-xs text-slate-400">답변은 기재해주신 이메일로 발송됩니다.<br/>잠시 후 창이 자동으로 닫힙니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">연락처 (또는 회원 닉네임) <span className="text-red-400">*</span></label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="010-0000-0000 (비회원은 연락처 입력)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-dream-purple focus:bg-white/10 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">회신받을 이메일 주소 <span className="text-red-400">*</span></label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-dream-purple focus:bg-white/10 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">문의 유형</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dream-purple focus:bg-white/10 transition-colors appearance-none pr-10 cursor-pointer"
                    >
                      <option value="일반 문의" className="bg-slate-800">일반 문의</option>
                      <option value="결제/환불" className="bg-slate-800">결제/환불</option>
                      <option value="오류 제보" className="bg-slate-800">오류 제보</option>
                      <option value="기타" className="bg-slate-800">기타</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">문의 내용 <span className="text-red-400">*</span></label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="문의하실 내용을 자세히 적어주세요."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-dream-purple focus:bg-white/10 transition-colors min-h-[100px] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.message.trim() || !formData.name.trim() || !formData.email.trim()}
                  className="w-full bg-dream-purple hover:bg-dream-purple-light text-white font-bold py-5 rounded-xl transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "문의 접수하기"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
