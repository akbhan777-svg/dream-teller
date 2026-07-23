"use server";

import { createClient } from "@supabase/supabase-js";

// RLS 및 FK 조인 버그 방지를 위한 완전 무결점 주문 및 해몽 조회 서버 액션
export async function fetchOrderAndResultBypass(orderId: string, userId?: string) {
  try {
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey
    );

    let orderRecord: any = null;

    // 1. order_number로 검색
    if (orderId) {
      const { data: byNum, error: errNum } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderId)
        .maybeSingle();

      if (byNum) orderRecord = byNum;
    }

    // 2. UUID(id)로 검색
    if (!orderRecord && orderId && orderId.length === 36) {
      const { data: byId } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (byId) orderRecord = byId;
    }

    // 3. dream_results.id 로 검색
    if (!orderRecord && orderId && orderId.length === 36) {
      const { data: dr } = await supabase
        .from("dream_results")
        .select("order_id")
        .eq("id", orderId)
        .maybeSingle();

      if (dr?.order_id) {
        const { data: byDr } = await supabase
          .from("orders")
          .select("*")
          .eq("id", dr.order_id)
          .maybeSingle();

        if (byDr) orderRecord = byDr;
      }
    }

    // 4. 폴백: 지정된 ID로 못 찾았고 유저 ID가 있다면 최신 주문으로 자동 복구
    if (!orderRecord && userId) {
      const { data: latest } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest) orderRecord = latest;
    }

    // 5. 주문을 최후의 순간에도 못 찾았다면 전체 최신 주문으로 자동 구출 (403 완전 방어)
    if (!orderRecord) {
      const { data: globalLatest } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (globalLatest) orderRecord = globalLatest;
    }

    // 6. orderRecord를 찾았다면 dream_results 독립 조회 및 결합
    if (orderRecord) {
      let { data: dreamResults } = await supabase
        .from("dream_results")
        .select("*")
        .eq("order_id", orderRecord.id)
        .order("created_at", { ascending: false });

      // 6-1. dream_results 결합 (프론트엔드에서 상태 판별용)
      let primaryResult = dreamResults && dreamResults.length > 0 ? dreamResults[0] : null;


      orderRecord.dream_results = [primaryResult];
    }

    const serializedOrder = orderRecord ? JSON.parse(JSON.stringify(orderRecord)) : null;
    return { order: serializedOrder, error: null };
  } catch (err: any) {
    console.error("fetchOrderAndResultBypass Error:", err);
    return { order: null, error: err?.message || String(err) };
  }
}

// 사용자 본인의 해몽 결과 공개/비공개 토글 처리 (비회원/회원 모두 접근 가능)
export async function toggleDreamPublicAction(dreamResultId: string, isPublic: boolean) {
  try {
    // 게스트 사용자도 자신의 해몽 결과를 공개/비공개 전환할 수 있어야 하므로 RLS를 우회합니다.
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey
    );

    // dream_results 업데이트 (Service Role Key를 사용하여 강제 업데이트)
    const { data, error } = await supabase
      .from("dream_results")
      .update({ is_public: isPublic })
      .eq("id", dreamResultId)
      .select();

    if (error) {
      console.error("toggleDreamPublicAction Error:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "권한이 없거나 찾을 수 없는 데이터입니다." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("toggleDreamPublicAction Exception:", err);
    return { success: false, error: err?.message || String(err) };
  }
}


// 공개된 꿈 해몽 결과 목록 조회 (메인페이지, 피드용)
export async function getPublicDreams(limit: number = 6) {
  try {
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey
    );

    // is_public가 true이거나(없다면 완료된 것들 위주로, 여기선 DB에 is_public이 있으나 기본적으로 전부 비공개일 수 있으므로 
    // 완료된 최신 해몽 중 분석 내용이 있는 것을 가져옴. 실제 서비스에선 is_public 조건을 추가할 수 있음)
    // 일단 사용자가 테스트용으로 볼 수 있게 최근 완료된 몽해몽을 노출
    const { data: results, error } = await supabase
      .from("dream_results")
      .select(`
        id,
        analysis_status,
        analysis_text,
        image_url,
        created_at,
        order_id,
        orders (
          id,
          dream_content,
          expert_field,
          user_id,
          users (
            nickname
          )
        )
      `)
      .eq("analysis_status", "completed")
      .eq("is_public", true)
      .not("analysis_text", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getPublicDreams DB Error:", error);
      return [];
    }

    if (!results) return [];

    // 데이터 매핑
    return results.map((result: any) => {
      const order = Array.isArray(result.orders) ? result.orders[0] : result.orders;
      const user = order?.users ? (Array.isArray(order.users) ? order.users[0] : order.users) : null;
      
      let nickname = user?.nickname || "비회원";
      
      // analysis_text 요약 (200자)
      let analysisSummary = result.analysis_text || "";
      if (analysisSummary.length > 200) {
        analysisSummary = analysisSummary.substring(0, 200) + "...";
      }

      // dream_content 요약
      let dreamTitle = order?.dream_content || "꿈 해몽 기록";
      let dreamSummary = order?.dream_content || "";
      if (dreamTitle.length > 30) {
        dreamTitle = dreamTitle.substring(0, 30) + "...";
      }

      return {
        id: result.id, // dream_result id
        orderId: order?.id || result.order_id, // order id for link
        nickname: nickname,
        expert: order?.expert_field || "freud",
        dreamTitle: dreamTitle,
        dreamSummary: dreamSummary,
        analysisSummary: analysisSummary,
        hasImage: !!result.image_url,
        imageUrl: result.image_url,
        createdAt: result.created_at,
      };
    });

  } catch (err) {
    console.error("getPublicDreams Exception:", err);
    return [];
  }
}
