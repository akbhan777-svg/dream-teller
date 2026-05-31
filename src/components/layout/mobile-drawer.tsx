"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

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

  /** 네비게이션 링크 아이템 목록 */
  // TODO: Auth 연동 후 회원/비회원 상태에 따라 메뉴 항목 분기 처리
  const navItems = [
    { href: "/auth/login", label: "로그인" },
    { href: "/guest-check", label: "비회원 주문 조회" },
    { href: "/my-page", label: "마이페이지" },
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
              className="text-lg font-bold text-dream-purple"
            >
              Dream Teller
            </Link>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="메뉴 닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 네비게이션 링크 목록 */}
          <nav className="flex flex-col gap-1 px-4 pb-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-dream-purple/10 hover:text-dream-purple"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
