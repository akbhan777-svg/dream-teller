"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, ListOrdered, Users } from "lucide-react";

/**
 * 어드민 사이드바 네비게이션 항목
 */
const navItems = [
  { href: "/admin", label: "매출 조회", icon: LayoutDashboard },
  { href: "/admin/order-list", label: "주문 내역 리스트", icon: ListOrdered },
  { href: "/admin/user-list", label: "유저 리스트", icon: Users },
];

/**
 * 관리자용 모바일 헤더 및 Drawer 메뉴 (모바일)
 */
export const AdminMobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden shrink-0">
      <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background px-4">
        <Link href="/admin" className="text-lg font-bold text-dream-purple">
          Dream Teller Admin
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="어드민 메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-0 top-0 z-50 flex flex-col bg-background p-6 shadow-lg border-b border-border/40">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold text-dream-purple">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="어드민 메뉴 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {/* TODO: 모바일 메뉴 하단에 로그아웃 버튼이나 설정 버튼을 추가할 수 있습니다. */}
          </div>
        </div>
      )}
    </div>
  );
};
