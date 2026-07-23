"use client";

import { useState } from "react";
import { Search, Users, Filter, CreditCard, ShieldCheck } from "lucide-react";
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
 * 더미 유저 데이터 인터페이스
 * TODO: src/types/database.types.ts 또는 백엔드 API (GET /api/admin/users) 연동
 */
interface UserItem {
  id: string;
  nickname: string;
  emailOrPhone: string;
  userType: "member" | "guest";
  provider: "Google" | "Kakao" | "Guest";
  hasPaymentHistory: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

/**
 * 더미 유저 목록 데이터
 */
const DUMMY_USERS: UserItem[] = [
  {
    id: "usr-001",
    nickname: "꿈꾸는호랑이",
    emailOrPhone: "dreamer_tiger@gmail.com",
    userType: "member",
    provider: "Google",
    hasPaymentHistory: true,
    totalOrders: 5,
    totalSpent: 12000,
    createdAt: "2026-07-01 10:20",
  },
  {
    id: "usr-002",
    nickname: "달빛탐험가",
    emailOrPhone: "010-9876-5432",
    userType: "guest",
    provider: "Guest",
    hasPaymentHistory: true,
    totalOrders: 1,
    totalSpent: 1500,
    createdAt: "2026-07-23 15:25",
  },
  {
    id: "usr-003",
    nickname: "새벽별",
    emailOrPhone: "dawn_star@kakao.com",
    userType: "member",
    provider: "Kakao",
    hasPaymentHistory: true,
    totalOrders: 12,
    totalSpent: 35000,
    createdAt: "2026-06-15 14:00",
  },
  {
    id: "usr-004",
    nickname: "구름위산책",
    emailOrPhone: "010-5555-1234",
    userType: "guest",
    provider: "Guest",
    hasPaymentHistory: false,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: "2026-07-23 12:00",
  },
  {
    id: "usr-005",
    nickname: "무의식여행자",
    emailOrPhone: "unconscious@naver.com",
    userType: "member",
    provider: "Google",
    hasPaymentHistory: true,
    totalOrders: 3,
    totalSpent: 13500,
    createdAt: "2026-07-10 09:45",
  },
  {
    id: "usr-006",
    nickname: "오로라팬더",
    emailOrPhone: "010-3333-8888",
    userType: "guest",
    provider: "Guest",
    hasPaymentHistory: true,
    totalOrders: 2,
    totalSpent: 3500,
    createdAt: "2026-07-22 19:00",
  },
];

/**
 * 관리자 유저 리스트 페이지 (`/admin/user-list`)
 * PRD 5.3 - 4. 유저 리스트
 */
const AdminUserListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "member" | "guest">("all");

  // TODO: 백엔드 Server Action `getAdminUsers` 또는 API (`GET /api/admin/users`) 연동

  // 실시간 닉네임, 이메일/전화번호 검색 및 회원/비회원 구분 필터링
  const filteredUsers = DUMMY_USERS.filter((user) => {
    const matchesQuery =
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.emailOrPhone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      userTypeFilter === "all" ? true : user.userType === userTypeFilter;

    return matchesQuery && matchesType;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          유저 리스트
        </h2>
        <p className="text-muted-foreground mt-1">
          회원 가입 유저와 비회원 주문 유저를 통합 관리합니다.
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
                  <TableHead className="text-center">결제 여부</TableHead>
                  <TableHead className="text-center">누적 주문</TableHead>
                  <TableHead className="text-right">총 결제액</TableHead>
                  <TableHead className="text-right">최초 접속/가입일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      검색 결과와 일치하는 유저가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-sm">
                        {user.nickname}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {user.emailOrPhone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.provider === "Google"
                              ? "border-blue-500/50 text-blue-500"
                              : user.provider === "Kakao"
                              ? "border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                              : "border-muted text-muted-foreground"
                          }
                        >
                          {user.provider}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.hasPaymentHistory ? (
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
                        {user.totalSpent.toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {user.createdAt}
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

export default AdminUserListPage;
