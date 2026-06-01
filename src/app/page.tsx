import type { Metadata } from "next";
import HeroSection from "@/components/landing/hero-section";
import FeatureGrid from "@/components/landing/feature-grid";
import ExamplesFeed from "@/components/landing/examples-feed";

/**
 * 메인 랜딩페이지 SEO 메타데이터
 */
export const metadata: Metadata = {
  title: "Dream Teller - AI 꿈 해석 서비스",
  description:
    "프로이트부터 신경과학까지, 4가지 전문 관점으로 AI가 당신의 꿈을 분석합니다. 어젯밤 꿈을 적으면, 3분 안에 당신만의 꿈 해석 리포트가 완성됩니다.",
};

/**
 * 메인 랜딩페이지 (/)
 * PRD 5.2 - 메인 랜딩페이지
 */
const HomePage = () => {
  return (
    <div className="flex flex-col bg-background text-foreground overflow-hidden">
      {/* 몽환적인 분위기를 위한 전체 오로라 배경 및 레이아웃 */}
      <div className="aurora-bg min-h-screen">
        <HeroSection />
        <FeatureGrid />
        <ExamplesFeed />
      </div>
    </div>
  );
};

export default HomePage;

