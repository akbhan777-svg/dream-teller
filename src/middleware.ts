import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 간단한 인메모리 Rate Limiting Store (Edge 런타임 특성상 고립되나 기본적인 Brute Force 방어에 유효)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT = 50; // 분당 최대 50회 요청 허용 (보수적 접근)
const WINDOW_MS = 60 * 1000;

export function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  
  // Rate Limiting 로직 (API 라우트만 대상)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    const requestData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    // 윈도우 초기화
    if (requestData.lastReset < windowStart) {
      requestData.count = 1;
      requestData.lastReset = now;
    } else {
      requestData.count++;
    }

    rateLimitMap.set(ip, requestData);

    if (requestData.count > RATE_LIMIT) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 보안 헤더 설정
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
