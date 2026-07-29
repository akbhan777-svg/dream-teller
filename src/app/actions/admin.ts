"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { sendTelegramMessage } from "@/lib/telegram";
import fs from "fs";
import path from "path";

// 관리자 권한 확인 (서버 유틸)
export async function checkAdminRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isAdmin: false, error: "Not authenticated" };

  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !userData || (userData as any).role !== "admin") {
    return { isAdmin: false, error: "Not authorized" };
  }

  return { isAdmin: true, user };
}

// 1. 관리자 메트릭스 조회 (대시보드용)
export async function getAdminMetrics() {
  const adminCheck = await checkAdminRole();
  if (!adminCheck.isAdmin) return { error: "Unauthorized" };

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 총 매출액
    const { data: paidOrders, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid");

    const totalRevenue = paidOrders?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
    const totalOrders = paidOrders?.length || 0;

    // 신규 유저 수 (총 유저수)
    const { count: newUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    // 누적 AI 해석 건수
    const { count: aiInterpretations } = await supabaseAdmin
      .from("dream_results")
      .select("*", { count: "exact", head: true })
      .eq("analysis_status", "completed");

    // 월별 매출 (간이 구현: 모든 결제완료 주문 가져와서 월별 집계)
    const { data: allPaidOrders } = await supabaseAdmin
      .from("orders")
      .select("total_amount, created_at")
      .eq("payment_status", "paid")
      .order("created_at", { ascending: true });

    // 최근 8개월 세팅
    const monthlyRevenue: { month: string; amount: number; yearMonth: string }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getMonth() + 1}월`;
      monthlyRevenue.push({ month: monthStr, amount: 0, yearMonth: `${d.getFullYear()}-${d.getMonth() + 1}` });
    }

    if (allPaidOrders) {
      allPaidOrders.forEach((order) => {
        const orderDate = new Date(order.created_at);
        const orderYearMonth = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
        const targetMonth = monthlyRevenue.find(m => m.yearMonth === orderYearMonth);
        if (targetMonth) {
          targetMonth.amount += order.total_amount || 0;
        }
      });
    }

    return JSON.parse(JSON.stringify({
      success: true,
      data: {
        totalRevenue,
        revenueChange: "+0.0%", // 임시
        totalOrders,
        orderChange: "+0.0%",
        newUsers: newUsers || 0,
        userChange: "+0.0%",
        aiInterpretations: aiInterpretations || 0,
        aiChange: "+0.0%",
        monthlyRevenue
      }
    }));
  } catch (error: any) {
    return { error: error.message || "Failed to fetch metrics" };
  }
}

// 2. 관리자 주문 리스트 조회
export async function getAdminOrders(page = 1, limit = 20, status = "all") {
  const adminCheck = await checkAdminRole();
  if (!adminCheck.isAdmin) return { error: "Unauthorized" };

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let query = supabaseAdmin
      .from("orders")
      .select(`
        *,
        users ( nickname, remaining_interprets ),
        dream_results ( analysis_status )
      `, { count: "exact" });

    if (status !== "all") {
      query = query.eq("payment_status", status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const ordersList = data || [];
    const userIds = Array.from(new Set(ordersList.map((o: any) => o.user_id).filter((id: string) => id && id !== "00000000-0000-0000-0000-000000000000")));

    const snapshotMap: Record<string, number> = {};

    if (userIds.length > 0) {
      const { data: transactions } = await supabaseAdmin
        .from("pass_transactions")
        .select("user_id, order_id, amount, created_at, id")
        .in("user_id", userIds)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });

      if (transactions) {
        const userBalances: Record<string, number> = {};
        transactions.forEach((pt: any) => {
          const uid = pt.user_id;
          userBalances[uid] = (userBalances[uid] || 0) + (pt.amount || 0);
          if (pt.order_id) {
            snapshotMap[pt.order_id] = userBalances[uid];
          }
        });
      }
    }

    const ordersWithSnapshot = ordersList.map((o: any) => ({
      ...o,
      snapshot_remaining: snapshotMap[o.id] !== undefined ? snapshotMap[o.id] : o.users?.remaining_interprets
    }));

    return JSON.parse(JSON.stringify({
      success: true,
      data: ordersWithSnapshot,
      count
    }));
  } catch (error: any) {
    return { error: error.message || "Failed to fetch orders" };
  }
}

// 3. 관리자 상세 주문 내역 조회
export async function getAdminOrderDetail(orderId: string) {
  const adminCheck = await checkAdminRole();
  if (!adminCheck.isAdmin) return { error: "Unauthorized" };

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        users ( * ),
        dream_results ( * ),
        payments ( * )
      `)
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;

    return JSON.parse(JSON.stringify({
      success: true,
      data: order
    }));
  } catch (error: any) {
    return { error: error.message || "Failed to fetch order detail" };
  }
}

// 4. 유저 리스트 조회
export async function getAdminUsers(page = 1, limit = 20, search = "") {
  const adminCheck = await checkAdminRole();
  if (!adminCheck.isAdmin) return { error: "Unauthorized" };

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let query = supabaseAdmin
      .from("users")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`nickname.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: users, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const usersList = users || [];
    // 유저별 통계 (간단한 구현 - 실제 서비스에선 join이나 RPC 권장)
    const usersWithStats = await Promise.all(
      usersList.map(async (u) => {
        const { data: orders } = await supabaseAdmin
          .from("orders")
          .select("total_amount")
          .eq("user_id", u.id)
          .eq("payment_status", "paid");

        const totalOrders = orders?.length || 0;
        const totalAmount = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

        return { ...u, totalOrders, totalAmount };
      })
    );

    return JSON.parse(JSON.stringify({
      success: true,
      data: usersWithStats,
      count
    }));
  } catch (error: any) {
    return { error: error.message || "Failed to fetch users" };
  }
}

// 5. AI 재생성 트리거
export async function regenerateDreamResult(orderId: string) {
  const adminCheck = await checkAdminRole();
  if (!adminCheck.isAdmin) return { error: "Unauthorized" };

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. dream_results 상태를 processing으로 변경
    const { error: updateError } = await supabaseAdmin
      .from("dream_results")
      .update({ analysis_status: "processing" })
      .eq("order_id", orderId);

    // 없는 경우 insert
    if (updateError) {
       await supabaseAdmin.from("dream_results").insert({
          order_id: orderId,
          analysis_status: "processing"
       });
    }

    // 2. 백그라운드로 AI 생성 호출 (비동기)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    fetch(`${siteUrl}/api/ai/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    }).catch(console.error);

    revalidatePath("/admin/order-list");
    revalidatePath(`/admin/order-list/${orderId}`);

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to trigger regeneration" };
  }
}

// 6. 비밀 보안키 기반 관리자 본인 인증 및 권한 등록
export async function verifyAndRegisterAdmin(secretKey: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "로그인이 필요한 서비스입니다." };
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Rate Limiting (Brute Force 방어) 5회 실패 시 3분 잠금 - DB(admin_verify_attempts) 연동
    const { data: attemptRecord } = await (supabaseAdmin.from("admin_verify_attempts") as any)
      .select("*")
      .eq("user_id", user.id)
      .single();

    const now = new Date();
    if (attemptRecord && attemptRecord.locked_until && new Date(attemptRecord.locked_until) > now) {
      const remainingSec = Math.ceil((new Date(attemptRecord.locked_until).getTime() - now.getTime()) / 1000);
      return { error: `연속된 인증 실패로 접근이 차단되었습니다. ${remainingSec}초 후에 다시 시도해주세요.` };
    }

    let rawExpectedKey = process.env.ADMIN_SECRET_KEY || "dt-admin-2026-secret!";
    let expectedSecretKey = rawExpectedKey.trim();

    const inputKey = (secretKey || "").trim();

    if (inputKey !== expectedSecretKey) {
      try {
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf-8");
          const match = envContent.match(/^ADMIN_SECRET_KEY\s*=\s*(.*)$/m);
          if (match && match[1]) {
            const diskKey = match[1].trim().replace(/^["']|["']$/g, '');
            if (diskKey) expectedSecretKey = diskKey;
          }
        }
      } catch (e) {
        console.error("Failed to read .env.local from disk:", e);
      }
    }

    if (!inputKey || inputKey !== expectedSecretKey) {
      // 실패 처리 DB 기록
      const currentCount = attemptRecord ? attemptRecord.attempts + 1 : 1;
      let lockedUntil = null;
      if (currentCount >= 5) {
        lockedUntil = new Date(now.getTime() + 3 * 60 * 1000).toISOString(); // 3분 락다운
      }

      await (supabaseAdmin.from("admin_verify_attempts") as any).upsert({
        user_id: user.id,
        attempts: currentCount,
        locked_until: lockedUntil,
        updated_at: now.toISOString()
      });

      return { error: `관리자 본인 인증 보안 키가 올바르지 않습니다. (실패 ${currentCount}/5회)` };
    }

    // 인증 성공 시 시도 기록 리셋 (DB에서 삭제)
    if (attemptRecord) {
      await (supabaseAdmin.from("admin_verify_attempts") as any)
        .delete()
        .eq("user_id", user.id);
    }

    // 유저 role을 'admin'으로 안전하게 갱신
    const { error: updateError } = await (supabaseAdmin.from("users") as any)
      .update({ role: "admin" })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    // 텔레그램 알림 발송
    await sendTelegramMessage(
      `🔑 <b>[관리자 본인인증 성공]</b>\n\n` +
      `<b>이메일:</b> <code>${user.email || "미제공"}</code>\n` +
      `<b>유저 ID:</b> <code>${user.id}</code>\n` +
      `<b>상태:</b> 관리자(admin) 권한 승인 완료!`
    );

    revalidatePath("/admin");
    revalidatePath("/my-page");

    return { success: true };
  } catch (error: any) {
    console.error("verifyAndRegisterAdmin Error:", error);
    return { error: error.message || "관리자 등록 처리 중 에러가 발생했습니다." };
  }
}

// 7. 유저 리스트에서 관리자가 다른 유저의 권한 변경 (승격 / 해제)
export async function updateUserRole(targetUserId: string, newRole: "admin" | "member" | "user") {
  const adminCheck = await checkAdminRole();
  if (!adminCheck.isAdmin) return { error: "Unauthorized" };

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // DB users_role_check 제약조건에 맞춰 기본 일반회원 값은 'member'
  const roleToSet = (newRole === "user" || newRole === "member") ? "member" : "admin";

  try {
    let { error: updateError } = await (supabaseAdmin.from("users") as any)
      .update({ role: roleToSet })
      .eq("id", targetUserId);

    // DB 스키마 제약조건이 'member'가 아닌 'user'인 경우 자동 폴백 재시도
    if (updateError && updateError.message?.includes("users_role_check")) {
      const fallbackRole = roleToSet === "member" ? "user" : "member";
      const { error: fallbackError } = await (supabaseAdmin.from("users") as any)
        .update({ role: fallbackRole })
        .eq("id", targetUserId);
      if (fallbackError) throw fallbackError;
    } else if (updateError) {
      throw updateError;
    }

    await sendTelegramMessage(
      `🛡️ <b>[관리자 권한 변경]</b>\n\n` +
      `<b>타겟 유저 ID:</b> <code>${targetUserId}</code>\n` +
      `<b>변경된 권한:</b> <code>${roleToSet}</code>\n` +
      `<b>처리자:</b> ${adminCheck.user.email}`
    );

    revalidatePath("/admin/user-list");
    return { success: true };
  } catch (error: any) {
    console.error("updateUserRole Error:", error);
    return { error: error.message || "Failed to update user role" };
  }
}

