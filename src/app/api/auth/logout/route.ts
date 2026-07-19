import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const supabase = await createClient();
    
    // Sign out user session
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("로그아웃 API 오류:", error);
    return NextResponse.json(
      { error: "로그아웃 요청 처리 중 에러가 발생했습니다." },
      { status: 500 }
    );
  }
};
