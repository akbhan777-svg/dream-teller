import { Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberOnlyModalProps {
  onLogin: () => void;
  onCancel: () => void;
}

export function MemberOnlyModal({ onLogin, onCancel }: MemberOnlyModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-[#181824] border border-dream-purple/40 rounded-3xl p-6 md:p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
        <div className="w-16 h-16 rounded-full bg-dream-purple/20 border border-dream-purple/40 flex items-center justify-center mx-auto text-dream-purple-light">
          <Sparkles className="w-8 h-8 text-dream-pink animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">회원 전용 할인 상품입니다</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            다회권(5회/10회) 할인 혜택은 **회원 전용 서비스**입니다.<br />
            3초 간편 소셜 가입 후 즉시 할인가로 이용하실 수 있습니다!
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={onLogin}
            className="w-full bg-gradient-to-r from-dream-purple to-dream-pink text-white font-bold py-6 rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>3초 회원가입 / 로그인하고 할인받기</span>
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full border-white/20 text-slate-300 hover:text-white hover:bg-white/5 py-6 rounded-xl cursor-pointer text-sm"
          >
            1회권(단판)으로 변경하여 결제
          </Button>
        </div>
      </div>
    </div>
  );
}
