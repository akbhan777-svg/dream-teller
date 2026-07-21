import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const PATCH = async (request: Request) => {
  try {
    const supabase = await createClient();
    
    // Get the current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const { nickname } = await request.json();
    if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
      return NextResponse.json(
        { error: "올바르지 않은 닉네임 형식입니다." },
        { status: 400 }
      );
    }

    // Update nickname in public.users table
    const { error: updateError } = await supabase
      .from("users")
      .update({ nickname: nickname.trim(), updated_at: new Date().toISOString() } as any)
      .eq("id", user.id);

    if (updateError) {
      console.error("닉네임 DB 업데이트 실패:", updateError);
      throw updateError;
    }

    return NextResponse.json({ success: true, nickname: nickname.trim() });
  } catch (error: any) {
    console.error("닉네임 변경 API 에러:", error);
    return NextResponse.json(
      { error: "닉네임 변경 중 에러가 발생했습니다." },
      { status: 500 }
    );
  }
};
