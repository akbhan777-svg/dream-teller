"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import MobileDrawer from "@/components/layout/mobile-drawer";
import { createClient } from "@/lib/supabase/client";

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
  const pathname = usePathname();

  // 어드민 페이지에서는 글로벌 헤더를 숨깁니다.
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const isLoggedIn = !!user;

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* 홈 로고 */}
          <Link
            href="/"
            className="text-xl font-black tracking-tight welcome-light-logo drop-shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-transform hover:scale-105 cursor-pointer"
          >
            DREAM TELLER
          </Link>

          {/* 데스크톱 네비게이션 (md 이상) */}
          <nav className="hidden items-center gap-6 md:flex">
            {loading ? (
              <div className="h-5 w-16 animate-pulse rounded bg-muted/40" />
            ) : isLoggedIn ? (
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
                  href="/auth"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  로그인 / 회원가입
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
