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

    const { nickname, phone_number } = await request.json();
    
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (nickname !== undefined) {
      if (typeof nickname !== "string" || nickname.trim() === "") {
        return NextResponse.json(
          { error: "올바르지 않은 닉네임 형식입니다." },
          { status: 400 }
        );
      }
      updates.nickname = nickname.trim();
    }
    
    if (phone_number !== undefined) {
      if (typeof phone_number !== "string" || phone_number.trim() === "") {
        return NextResponse.json(
          { error: "올바르지 않은 전화번호 형식입니다." },
          { status: 400 }
        );
      }
      // 기본적인 연락처 정규식 검사 (010-XXXX-XXXX 형식)
      const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
      if (!phoneRegex.test(phone_number.trim())) {
        return NextResponse.json(
          { error: "올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)" },
          { status: 400 }
        );
      }
      updates.phone_number = phone_number.trim();
    }
    
    if (Object.keys(updates).length === 1) {
       // Only updated_at is present
       return NextResponse.json(
         { error: "변경할 정보가 제공되지 않았습니다." },
         { status: 400 }
       );
    }

    // Update in public.users table
    const { error: updateError } = await (supabase.from("users") as any)
      .update(updates)
      .eq("id", user.id);

    if (updateError) {
      console.error("사용자 정보 DB 업데이트 실패:", updateError);
      throw updateError;
    }

    return NextResponse.json({ success: true, ...updates });
  } catch (error: any) {
    console.error("사용자 정보 변경 API 에러:", error);
    return NextResponse.json(
      { error: "사용자 정보 변경 중 에러가 발생했습니다." },
      { status: 500 }
    );
  }
};
