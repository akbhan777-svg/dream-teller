"use client";

import React, { useState, useEffect } from "react";
import { Search, Users, Filter, CreditCard, Loader2 } from "lucide-react";
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
import { getAdminUsers, updateUserRole } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface AdminUserListClientProps {
  initialUsers: any[];
}

export default function AdminUserListClient({ initialUsers }: AdminUserListClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "member" | "guest">("all");
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers(1, 100);
      if (res.error === "Unauthorized" || res.error === "Not authenticated") {
        window.location.href = "/";
        return;
      } else if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("fetchUsers error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRoleToggle = async (targetUser: any) => {
    const isCurrentlyAdmin = targetUser.role === "admin";
    const nextRole = isCurrentlyAdmin ? "member" : "admin";
    const confirmMsg = isCurrentlyAdmin
      ? `'${targetUser.nickname || targetUser.email}' 님의 관리자 권한을 해제(일반 회원 전환)하시겠습니까?`
      : `'${targetUser.nickname || targetUser.email}' 님을 시스템 관리자(ADMIN)로 승격하시겠습니까?`;

    if (!confirm(confirmMsg)) return;

    setUpdatingId(targetUser.id);
    try {
      const res = await updateUserRole(targetUser.id, nextRole);
      if (res.error) {
        alert(`권한 변경 실패: ${res.error}`);
      } else {
        alert("성공적으로 관리자 권한이 변경되었습니다.");
        fetchUsers();
      }
    } catch (err) {
      alert("권한 변경 처리 중 에러가 발생했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  // 실시간 닉네임, 이메일/전화번호 검색 및 회원/비회원 구분 필터링
  const filteredUsers = users.filter((user) => {
    const emailOrPhone = user.email || user.phone_number || "";
    const matchesQuery =
      (user.nickname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      emailOrPhone.toLowerCase().includes(searchQuery.toLowerCase());

    const isMember = user.provider !== "guest" && user.role !== "guest";
    let matchesType = true;
    if (userTypeFilter === "member") matchesType = isMember;
    if (userTypeFilter === "guest") matchesType = !isMember;

    return matchesQuery && matchesType;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          유저 리스트
        </h2>
        <p className="text-muted-foreground mt-1">
          회원 가입 유저와 비회원 주문 유저를 통합 관리하며, 관리자 권한(Role)을 제어합니다.
        </p>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-dream-purple" />
              전체 유저 목록 ({filteredUsers.length}명)
            </span>
          </CardTitle>
          <CardDescription>
            닉네임, 이메일, 전화번호로 검색하거나 회원/비회원별 필터를 적용할 수 있습니다.
          </CardDescription>

          {/* 검색 및 필터 바 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="닉네임, 이메일 또는 전화번호 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
                <button
                  onClick={() => setUserTypeFilter("all")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    userTypeFilter === "all"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setUserTypeFilter("member")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    userTypeFilter === "member"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  소셜 회원
                </button>
                <button
                  onClick={() => setUserTypeFilter("guest")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    userTypeFilter === "guest"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  비회원
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
                  <TableHead>닉네임</TableHead>
                  <TableHead>이메일 / 전화번호</TableHead>
                  <TableHead>가입 경로</TableHead>
                  <TableHead className="text-center">현재 권한</TableHead>
                  <TableHead className="text-center">결제 여부</TableHead>
                  <TableHead className="text-center">누적 주문</TableHead>
                  <TableHead className="text-right">총 결제액</TableHead>
                  <TableHead className="text-center">권한 관리</TableHead>
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
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                       검색 결과와 일치하는 유저가 없습니다.
                     </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const hasPaymentHistory = user.totalOrders > 0;
                    const isAdminUser = user.role === "admin";
                    const isGuest = user.provider === "guest" || user.role === "guest";

                    return (
                      <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-semibold text-sm">
                          {user.nickname || "비회원"}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground flex flex-col gap-1">
                          {user.email && <span>{user.email}</span>}
                          {user.phone_number && <span className="text-dream-pink/80">{user.phone_number}</span>}
                          {!user.email && !user.phone_number && <span>-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.provider === "kakao"
                                ? "border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                                : user.provider === "google"
                                ? "border-blue-500/50 text-blue-500"
                                : "border-muted text-muted-foreground"
                            }
                          >
                            {user.provider === "kakao" ? "Kakao" : user.provider === "google" ? "Google" : "Guest"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {isAdminUser ? (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-300 dark:text-purple-400">
                              <ShieldCheck className="h-3 w-3 mr-1" /> 관리자
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {isGuest ? "비회원" : "일반 회원"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasPaymentHistory ? (
                            <Badge variant="success" className="gap-1">
                              <CreditCard className="h-3 w-3" /> 결제이력 있음
                            </Badge>
                          ) : (
                            <Badge variant="secondary">미결제</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">
                          {user.totalOrders}건
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {user.totalAmount.toLocaleString()}원
                        </TableCell>
                        <TableCell className="text-center">
                          {!isGuest ? (
                            <button
                              onClick={() => handleRoleToggle(user)}
                              disabled={updatingId === user.id}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                                isAdminUser
                                  ? "border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  : "border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                              }`}
                            >
                              {updatingId === user.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                              ) : isAdminUser ? (
                                "권한 해제"
                              ) : (
                                "관리자로 승격"
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
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
