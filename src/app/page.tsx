import type { Metadata } from "next";

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
// TODO: Hero 섹션 구현
// TODO: Feature 소개 섹션 (Bento Grid UI) 구현
// TODO: Pricing 섹션 구현
// TODO: 리뷰 & 신뢰 구축 섹션 구현
// TODO: FAQ 섹션 구현
// TODO: 최종 CTA 섹션 구현
const HomePage = () => {
  return (
    <div className="flex flex-col">
      {/* 랜딩 페이지 콘텐츠가 여기에 구현될 예정 */}
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">랜딩 페이지</p>
      </section>
    </div>
  );
};

export default HomePage;
