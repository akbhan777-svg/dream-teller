"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import MobileDrawer from "@/components/layout/mobile-drawer";

/**
 * 상단 네비게이션 바 (Header)
 * PRD 5.1 요구사항:
 * - (공통) 홈 로고
 * - (비회원) 로그인, 비회원 주문 조회
 * - (회원) 마이페이지
 * - (반응형) md 미만에서 햄버거 메뉴 → Top Drawer
 */
const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // TODO: Auth 연동 후 실제 로그인 상태 판별 로직으로 교체
  const isLoggedIn = false;

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* 홈 로고 */}
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-dream-purple transition-colors hover:text-dream-purple-light"
          >
            Dream Teller
          </Link>

          {/* 데스크톱 네비게이션 (md 이상) */}
          <nav className="hidden items-center gap-6 md:flex">
            {isLoggedIn ? (
              // 회원 메뉴
              <Link
                href="/my-page"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                마이페이지
              </Link>
            ) : (
              // 비회원 메뉴
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  로그인
                </Link>
                <Link
                  href="/guest-check"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  비회원 주문 조회
                </Link>
              </>
            )}
          </nav>

          {/* 모바일 햄버거 메뉴 (md 미만) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            aria-label="메뉴 열기"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 모바일 Full-width Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};

export default Header;
