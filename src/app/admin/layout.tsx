import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";

/**
 * 관리자 페이지 글로벌 레이아웃
 * PRD 5.3 관리자 UX 페이지 구성
 * - 좌측 네비게이션 패널 (AdminSidebar)
 * - 각 관리자 메뉴 페이지별 내용 (children)
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* 데스크톱 사이드바 */}
      <AdminSidebar />
      
      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 모바일 헤더 */}
        <AdminMobileHeader />
        
        {/* 페이지별 컨텐츠 */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  );
}
