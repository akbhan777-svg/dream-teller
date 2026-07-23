"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * 더미 주문 내역 아이템 인터페이스
 * TODO: src/types/database.types.ts 또는 백엔드 API 타입 연동
 */
interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  nickname: string;
  userType: "회원" | "비회원";
  expertField: "프로이트" | "칼 융" | "신경과학" | "게슈탈트";
  amount: number;
  status: "paid" | "failed";
}

/**
 * 더미 주문 목록 데이터
 */
const DUMMY_ORDERS: OrderItem[] = [
  {
    id: "ord-001",
    orderNumber: "ORD-20260723-0001",
    createdAt: "2026-07-23 16:45",
    nickname: "꿈꾸는호랑이",
    userType: "회원",
    expertField: "칼 융",
    amount: 2000,
    status: "paid",
  },
  {
    id: "ord-002",
    orderNumber: "ORD-20260723-0002",
    createdAt: "2026-07-23 15:30",
    nickname: "달빛탐험가",
    userType: "비회원",
    expertField: "프로이트",
    amount: 1500,
    status: "paid",
  },
  {
    id: "ord-003",
    orderNumber: "ORD-20260723-0003",
    createdAt: "2026-07-23 14:12",
    nickname: "새벽별",
    userType: "회원",
    expertField: "신경과학",
    amount: 7200,
    status: "paid",
  },
  {
    id: "ord-004",
    orderNumber: "ORD-20260723-0004",
    createdAt: "2026-07-23 12:05",
    nickname: "구름위산책",
    userType: "비회원",
    expertField: "게슈탈트",
    amount: 1500,
    status: "failed",
  },
  {
    id: "ord-005",
    orderNumber: "ORD-20260722-0089",
    createdAt: "2026-07-22 21:50",
    nickname: "무의식여행자",
    userType: "회원",
    expertField: "칼 융",
    amount: 13500,
    status: "paid",
  },
  {
    id: "ord-006",
    orderNumber: "ORD-20260722-0078",
    createdAt: "2026-07-22 19:10",
    nickname: "오로라팬더",
    userType: "비회원",
    expertField: "프로이트",
    amount: 2000,
    status: "paid",
  },
];

/**
 * 관리자 주문 내역 리스트 페이지 (`/admin/order-list`)
 * PRD 5.3 - 2. 주문 내역 리스트
 */
const AdminOrderListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "failed">("all");

  // TODO: 백엔드 Server Action `getAdminOrders` 또는 API (`GET /api/admin/orders`) 연동 구현

  // 실시간 검색 및 필터링 적용
  const filteredOrders = DUMMY_ORDERS.filter((order) => {
    const matchesQuery =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.nickname.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : order.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          주문 내역 리스트
        </h2>
        <p className="text-muted-foreground mt-1">
          시스템 전체에서 발생한 모든 결제 및 주문 내역을 확인합니다.
        </p>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-dream-purple" />
              전체 주문 내역 ({filteredOrders.length}건)
            </span>
          </CardTitle>
          <CardDescription>
            주문 ID나 닉네임으로 검색하거나 상배별 필터를 적용할 수 있습니다.
          </CardDescription>

          {/* 검색 및 필터 바 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="주문번호 또는 닉네임 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === "all"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setStatusFilter("paid")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === "paid"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  결제완료
                </button>
                <button
                  onClick={() => setStatusFilter("failed")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === "failed"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  결제실패
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[180px]">주문 ID</TableHead>
                  <TableHead>구매 일시</TableHead>
                  <TableHead>닉네임</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>전문 분야</TableHead>
                  <TableHead className="text-right">결제 금액</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      검색 결과와 일치하는 주문 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-medium">
                        <Link
                          href={`/admin/order-list/${order.id}`}
                          className="text-primary hover:underline block w-full"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {order.createdAt}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {order.nickname}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.userType === "회원"
                              ? "border-dream-purple/50 text-dream-purple"
                              : "border-muted text-muted-foreground"
                          }
                        >
                          {order.userType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {order.expertField}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {order.amount.toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-center">
                        {order.status === "paid" ? (
                          <Badge variant="success">결제완료</Badge>
                        ) : (
                          <Badge variant="failed">결제실패</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrderListPage;
