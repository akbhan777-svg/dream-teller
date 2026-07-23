import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
    }

    // 서버 사이드에서 CORS 제약 없이 원본 이미지 고화질 바이너리를 획득
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: imageResponse.status });
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 고화질 정식 JPEG 파일로 다운로드 헤더 설정
    const headers = new Headers();
    headers.set("Content-Type", "image/jpeg");
    headers.set("Content-Length", buffer.length.toString());
    headers.set("Content-Disposition", `attachment; filename="dream_art_${Date.now()}.jpg"`);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Proxy image error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
