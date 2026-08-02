"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Filter, Loader2 } from "lucide-react";
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
import { getAdminOrders } from "@/app/actions/admin";

interface AdminOrderListClientProps {
  initialOrders: any[];
}

export default function AdminOrderListClient({ initialOrders }: AdminOrderListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "failed">("all");
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const hasFetched = React.useRef(false);

  useEffect(() => {
    hasFetched.current = false; // Reset on filter change
  }, [statusFilter]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Skip fetch on first render since we have initialOrders
    if (statusFilter === "all" && orders === initialOrders) {
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const result = await getAdminOrders(1, 100, statusFilter);
        if (result.error === "Unauthorized" || result.error === "Not authenticated") {
          window.location.href = "/";
          return;
        } else if (result.success && result.data) {
          setOrders(result.data);
        }
      } catch (err) {
        console.error("fetchData error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [statusFilter, initialOrders, orders]);

  // 실시간 검색 및 필터링 적용 (클라이언트 사이드)
  const filteredOrders = orders.filter((order) => {
    const matchesQuery =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.users?.nickname?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
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
            주문 ID나 닉네임으로 검색하거나 상태별 필터를 적용할 수 있습니다.
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
                  결제 완료
                </button>
                <button
                  onClick={() => setStatusFilter("failed")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === "failed"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  결제 실패
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
                  <TableHead className="text-center">해몽 상태</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex justify-center items-center h-full">
                         <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      검색 결과와 일치하는 주문 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const isRealMember = Boolean(
                      order.user_id &&
                      order.user_id !== "00000000-0000-0000-0000-000000000000" &&
                      order.users?.role !== "guest" &&
                      order.users?.provider !== "guest"
                    );
                    const isMember = isRealMember ? "회원" : "비회원";
                    const isCompleted = order.payment_status === "paid" || order.payment_status === "completed";
                    const displayRemainingPasses = order.snapshot_remaining !== undefined ? order.snapshot_remaining : order.users?.remaining_interprets;
                    const adminCharge = order.snapshot_admin_charge || 0;
                    const basePasses = adminCharge > 0 && displayRemainingPasses !== undefined ? displayRemainingPasses - adminCharge : displayRemainingPasses;
                    
                    let aiStatusBadge = <Badge variant="outline" className="text-muted-foreground">대기중</Badge>;
                    if (order.order_type === "pass_charge_5" || order.order_type === "pass_charge_10") {
                      aiStatusBadge = <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200">이용권 충전건</Badge>;
                    } else if (order.dream_results) {
                       const aiStatus = Array.isArray(order.dream_results) 
                         ? (order.dream_results.length > 0 ? order.dream_results[0].analysis_status : null)
                         : order.dream_results.analysis_status;
                         
                       if (aiStatus === "completed") {
                          aiStatusBadge = <Badge variant="outline" className="border-dream-purple/50 text-dream-purple">완료됨</Badge>;
                       } else if (aiStatus === "processing" || aiStatus === "pending") {
                          aiStatusBadge = <Badge variant="outline" className="border-amber-500/50 text-amber-500">분석 진행중</Badge>;
                       } else if (aiStatus === "failed") {
                          aiStatusBadge = <Badge variant="destructive" className="bg-red-500/15 text-red-600 border-red-500/30">생성 실패 (환불됨)</Badge>;
                       }
                    }

                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="font-mono text-xs font-medium">
                          <Link
                            href={`/admin/order-list/${order.id}`}
                            className="text-primary hover:underline block w-full"
                          >
                            {order.order_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium flex items-center gap-2">
                              {isRealMember ? (order.users?.nickname || "회원") : "비회원"}
                              {isRealMember && displayRemainingPasses !== undefined && (
                                <Badge variant="outline" className="text-[10px] bg-blue-50/50 text-blue-600 border-blue-200 px-1 py-0 h-4">
                                  {adminCharge > 0 ? `잔여 ${basePasses}회+충전 ${adminCharge}회` : `잔여 ${displayRemainingPasses}회`}
                                </Badge>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              isMember === "회원"
                                ? "border-dream-purple/50 text-dream-purple"
                                : "border-muted text-muted-foreground"
                            }
                          >
                            {isMember}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {order.expert_field || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {(order.total_amount || 0).toLocaleString()}원
                        </TableCell>
                        <TableCell className="text-center">
                          {aiStatusBadge}
                        </TableCell>
                        <TableCell className="text-center">
                          {isCompleted ? (
                            <Badge variant="default">결제완료</Badge>
                          ) : order.payment_status === "pending" ? (
                            <Badge variant="outline" className="border-amber-500/50 text-amber-500">결제 대기</Badge>
                          ) : order.payment_status === "refunded" ? (
                            <Badge variant="secondary">환불완료</Badge>
                          ) : (
                            <Badge variant="destructive">결제실패</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
