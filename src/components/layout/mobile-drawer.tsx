"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * MobileDrawer 컴포넌트의 Props 타입
 * - isOpen: Drawer 열림/닫힘 상태
 * - onClose: 닫기 콜백
 */
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 모바일 환경(md 미만)에서 위에서 아래로 내려오는 풀 너비(Full-width) Drawer.
 * PRD 5.1 - Header 반응형 요구사항 구현.
 */
const MobileDrawer = ({ isOpen, onClose }: MobileDrawerProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("세션 획득 에러:", err);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Drawer 열림 시 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isLoggedIn = !!user;

  /** 네비게이션 링크 아이템 목록 */
  const navItems = loading
    ? []
    : isLoggedIn
    ? [{ href: "/my-page", label: "마이페이지" }]
    : [
        { href: "/auth", label: "로그인 / 회원가입" },
        { href: "/guest-check", label: "비회원 주문 조회" },
      ];

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer 패널: 위에서 아래로(Top) 내려오는 풀 너비 */}
      <div
          className={`fixed inset-0 top-0 z-50 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        <div className="bg-background border-b border-border shadow-lg">
          {/* Drawer 헤더: 로고 + 닫기 버튼 */}
          <div className="flex items-center justify-between px-4 py-4">
            <Link
              href="/"
              onClick={onClose}
              className="text-lg font-black tracking-tight welcome-light-logo drop-shadow-[0_0_12px_rgba(147,51,234,0.4)]"
              tabIndex={isOpen ? 0 : -1}
            >
              DREAM TELLER
            </Link>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="메뉴 닫기"
              tabIndex={isOpen ? 0 : -1}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 네비게이션 링크 목록 */}
          <nav className="flex flex-col pb-6 px-4">
            {navItems.map((item) => {
              if (item.label === "로그인") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="group relative inline-flex w-full p-[2px] mb-2 rounded-full bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                    <div className="relative flex w-full justify-center items-center bg-background/80 backdrop-blur-md hover:bg-transparent text-base font-bold text-white py-4 rounded-full border border-white/5 transition-all duration-300 z-10">
                      {item.label}
                    </div>
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-dream-purple/10 hover:text-dream-purple rounded-lg"
                  tabIndex={isOpen ? 0 : -1}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
