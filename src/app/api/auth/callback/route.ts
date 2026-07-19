import { createClient } from "@/lib/supabase/server";
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
        // Sync user session to public.users database table
        const { error: syncError } = await supabase
          .from("users")
          .upsert({
            id: user.id,
            role: "member",
            provider: user.app_metadata.provider || "google",
            email: user.email,
            nickname: user.user_metadata.full_name || user.email?.split("@")[0] || "사용자",
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });

        if (syncError) {
          console.error("public.users 테이블 사용자 동기화 에러:", syncError);
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
