import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { provider } = await request.json();
    
    // Check if provider is valid (google or kakao)
    if (!provider || (provider !== "google" && provider !== "kakao")) {
      return NextResponse.json(
        { error: "지원하지 않거나 누락된 로그인 공급자입니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const origin = new URL(request.url).origin;

    // Trigger OAuth flow using Supabase Auth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    });

    if (error) throw error;

    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    console.error("소셜 로그인 API 오류:", error);
    return NextResponse.json(
      { error: "로그인 요청 처리 중 에러가 발생했습니다." },
      { status: 500 }
    );
  }
};
