"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleDreamPublicAction(resultId: string, isPublic: boolean) {
  try {
    const supabase = await createClient();
    
    // dream_results 조회 및 orders 조인
    const { data: result } = await supabase
      .from("dream_results")
      .select("*, orders(user_id)")
      .eq("id", resultId)
      .single();
      
    if (!result) {
      return { success: false, error: "해당 리포트를 찾을 수 없습니다." };
    }

    // 소유자 검증 (비회원 주문인 경우도 있을 수 있으므로 auth 검증 추가)
    const { data: { user } } = await supabase.auth.getUser();
    
    // 회원이 로그인한 상태에서 본인의 주문이 아닐 경우 거절
    if (result.orders.user_id && (!user || user.id !== result.orders.user_id)) {
      return { success: false, error: "권한이 없습니다." };
    }

    // 공개 상태 업데이트
    const { error } = await supabase
      .from("dream_results")
      .update({ is_public: isPublic })
      .eq("id", resultId);

    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}
