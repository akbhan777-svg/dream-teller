"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Footer 링크 아이템 타입
 */
interface FooterLink {
  href: string;
  label: string;
}

/**
 * 글로벌 Footer 컴포넌트 (Server Component)
 * PRD 5.1 요구사항:
 * - 사업자 정보(상호명, 대표자, 사업자번호, 주소 등)
 * - 이용약관, 개인정보처리방침, 문의하기 링크
 * - 모든 페이지 하단에 고정 노출
 */
const Footer = () => {
  const pathname = usePathname();

  // 어드민 페이지에서는 글로벌 푸터를 숨깁니다.
  if (pathname?.startsWith("/admin")) return null;

  /** 하단 링크 목록 */
  // TODO: 실제 약관/정책 페이지 구현 후 href 연결
  const footerLinks: FooterLink[] = [
    { href: "/terms", label: "이용약관" },
    { href: "/privacy", label: "개인정보처리방침" },
    { href: "/contact", label: "문의하기" },
  ];

  /** 더미 사업자 정보 */
  // TODO: 실제 사업자 정보로 교체
  const businessInfo = {
    companyName: "Dream Teller",
    representative: "홍길동",
    businessNumber: "000-00-00000",
    address: "서울특별시 강남구 테헤란로 000, 00층",
    email: "contact@dreamteller.kr",
  };

  return (
    <footer className="w-full border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* 상단: 로고 및 링크 */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* 로고 & 설명 */}
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="text-lg font-bold text-dream-purple"
            >
              Dream Teller
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              AI가 분석하는 당신만의 꿈 해석 리포트
            </p>
          </div>

          {/* 링크 그룹 */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 구분선 */}
        <div className="my-6 h-px bg-border/40" />

        {/* 하단: 사업자 정보 & 저작권 */}
        <div className="flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1">
            <p>
              {businessInfo.companyName} | 대표: {businessInfo.representative}
            </p>
            <p>
              사업자등록번호: {businessInfo.businessNumber} | {businessInfo.address}
            </p>
            <p>이메일: {businessInfo.email}</p>
          </div>

          <p className="shrink-0">
            © {new Date().getFullYear()} {businessInfo.companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
