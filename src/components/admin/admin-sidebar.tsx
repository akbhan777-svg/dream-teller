"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, Users } from "lucide-react";

/**
 * 어드민 사이드바 네비게이션 항목
 */
const navItems = [
  { href: "/admin", label: "매출 조회", icon: LayoutDashboard },
  { href: "/admin/order-list", label: "주문 내역 리스트", icon: ListOrdered },
  { href: "/admin/user-list", label: "유저 리스트", icon: Users },
];

/**
 * 관리자용 좌측 네비게이션 패널 (데스크톱)
 */
export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border/40 bg-muted/10 md:flex h-full">
      <div className="flex h-16 items-center px-6 border-b border-border/40 shrink-0">
        <Link href="/admin" className="text-lg font-bold text-dream-purple">
          Dream Teller Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* TODO: 로그아웃 버튼이나 설정 버튼 등을 하단에 배치할 수 있습니다. */}
    </aside>
  );
};
