import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dream-teller";

  if (code) {
    try {
      const supabase = await createClient();
      
      // Exchange OAuth code for Supabase Auth session tokens
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;

      const user = data.user;
      if (user) {
        // 기존에 등록된 유저인지 확인하여 커스텀 닉네임이 덮어씌워지는 현상 방지
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingUser) {
          type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
          const newUserData: UserInsert = {
            id: user.id,
            role: "member",
            provider: user.app_metadata.provider || "google",
            email: user.email ?? null,
            nickname: user.user_metadata.full_name || user.email?.split("@")[0] || "사용자",
            remaining_interprets: 0,
          };

          // 신규 유저일 때만 public.users 테이블에 초기 프로필 생성
          const { error: syncError } = await supabase
            .from("users")
            .insert(newUserData as any);

          if (syncError) {
            console.error("public.users 테이블 신규 사용자 등록 에러:", syncError);
          }
        }
      }
    } catch (err) {
      console.error("OAuth callback 인증 처리 실패:", err);
      // Redirect to landing with error state
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`);
    }
  }

  // URL to redirect to after successful sign in process
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
};
