import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  BrainCircuit, 
  TrendingUp 
} from "lucide-react";

/**
 * 관리자 메인 페이지 (Dashboard)
 * PRD 5.3 관리자 UX 페이지 구성 - 1. 관리자 메인 페이지
 */
const AdminPage = () => {
  // TODO: 백엔드 API 연동 후 더미 데이터 교체 (GET /api/admin/metrics 등)
  const summaryData = {
    totalRevenue: 24500000,
    revenueChange: "+12.5%",
    totalOrders: 3240,
    orderChange: "+8.2%",
    newUsers: 1450,
    userChange: "+15.3%",
    aiInterpretations: 8520,
    aiChange: "+24.1%",
  };

  const monthlyRevenue = [
    { month: "12월", amount: 15000000 },
    { month: "1월", amount: 18000000 },
    { month: "2월", amount: 16500000 },
    { month: "3월", amount: 21000000 },
    { month: "4월", amount: 19500000 },
    { month: "5월", amount: 23000000 },
    { month: "6월", amount: 24500000 },
    { month: "7월", amount: 28000000 },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.amount));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          매출 조회 대시보드
        </h2>
        <p className="text-muted-foreground mt-2">
          기간별 매출 및 주요 지표를 확인합니다. (더미 데이터 적용 중)
        </p>
      </div>

      {/* 핵심 지표 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출액</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.totalRevenue.toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              전월 대비 <span className="text-emerald-500 font-medium">{summaryData.revenueChange}</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 주문 수</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.totalOrders.toLocaleString()}건
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              전월 대비 <span className="text-emerald-500 font-medium">{summaryData.orderChange}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">신규 유저 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.newUsers.toLocaleString()}명
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              전월 대비 <span className="text-emerald-500 font-medium">{summaryData.userChange}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">누적 AI 해석 건수</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.aiInterpretations.toLocaleString()}건
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              전월 대비 <span className="text-emerald-500 font-medium">{summaryData.aiChange}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 매출 추이 차트 */}
      <Card className="col-span-4 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-dream-purple" />
            최근 8개월 매출 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tailwind CSS 기반 커스텀 막대 차트 */}
          <div className="h-[300px] w-full flex items-end justify-between gap-2 pt-6 px-2">
            {monthlyRevenue.map((data, idx) => {
              const heightPercent = (data.amount / maxRevenue) * 100;
              return (
                <div key={idx} className="flex flex-col items-center justify-end w-full group h-full">
                  {/* 툴팁 */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs rounded px-2 py-1 mb-2 whitespace-nowrap z-10 relative shadow-md">
                    {data.amount.toLocaleString()}원
                  </div>
                  {/* 막대 */}
                  <div 
                    className="w-full max-w-[64px] bg-primary/20 group-hover:bg-dream-purple/90 rounded-t-md transition-all duration-300 relative border-x border-t border-primary/10 overflow-hidden"
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* 오로라/네온 스타일 오버레이 (Dream Teller 테마 반영) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  {/* 라벨 */}
                  <div className="mt-4 text-sm text-muted-foreground font-medium shrink-0">
                    {data.month}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
