import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * SEO 메타데이터
 * PRD 5.1 - Head & Meta: SEO, Open Graph 설정
 */
// TODO: GA4 스크립트 추가 (Analytics 설정)
// TODO: 실제 도메인 및 OG 이미지 URL로 교체
export const metadata: Metadata = {
  title: {
    default: "Dream Teller - AI 꿈 해석 서비스",
    template: "%s | Dream Teller",
  },
  description:
    "프로이트부터 신경과학까지, 4가지 전문 관점으로 AI가 당신의 꿈을 분석합니다.",
  openGraph: {
    title: "Dream Teller - AI 꿈 해석 서비스",
    description:
      "프로이트부터 신경과학까지, 4가지 전문 관점으로 AI가 당신의 꿈을 분석합니다.",
    type: "website",
    locale: "ko_KR",
  },
};

/**
 * 루트 레이아웃
 * PRD 5.1 전체 레이아웃 구현:
 * - Header (상단 네비게이션)
 * - Main (각 페이지 컨텐츠, flex-1)
 * - Footer (하단 사업자 정보)
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: Readonly<RootLayoutProps>) => {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" strategy="lazyOnload" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
