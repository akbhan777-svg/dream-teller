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
        const { data: existingUser } = await (supabase.from("users") as any)
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
          const { error: syncError } = await (supabase.from("users") as any)
            .insert(newUserData);

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

  // 모바일 인앱 브라우저(WKWebView 등)에서 30x 리다이렉트 시 Set-Cookie를 무시하는 버그를 방지하기 위해 200 HTML 응답으로 클라이언트 사이드 리다이렉트를 수행합니다.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  let redirectUrl = `${requestUrl.origin}${next}`;
  if (!isLocalEnv) {
    if (forwardedHost) {
      redirectUrl = `https://${forwardedHost}${next}`;
    } else {
      redirectUrl = requestUrl.origin.replace(/^http:/, 'https:') + next;
    }
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
        <title>로그인 완료 중...</title>
        <script>
          window.location.replace("${redirectUrl}");
        </script>
      </head>
      <body style="background-color: #0d0d12; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif;">
        <p>로그인 처리가 완료되었습니다. 이동 중입니다...</p>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};
