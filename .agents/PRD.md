# Product Requirements Document (PRD)

## 1. 프로젝트 개요 (Project Overview)
- **프로젝트 명**: AI Dream Teller (AI 꿈 해몽 서비스)
- **목표**: 사용자가 입력한 꿈 내용을 AI가 분석하여 심층적인 해몽과 조언을 제공하는 수익형 웹 서비스
- **핵심 가치 1**: 신비롭고 직관적인 UI 경험과 정확도 높은 AI 분석을 통해서 사용자에게 인사이트와 재미 제공.
- **핵심 가치 2**: 프로이트, 칼 융, 신경과학, 게슈탈트 등 해몽을 맡기고 싶은 전문 분야를 선택해서 해몽 요청 가능.

## 2. 타겟 유저 (Target Audience)
- 꿈의 의미를 검색해보는 습관이 있는 20-40대 남녀.
- 모바일 환경에서 간편하게 결과를 확인하고 공유하고 싶어하는 유저.

## 3. 기술 스택 (Tech Stack)
- **Web Framework**: Next.js 16.2.6(App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Shadch/UI
- **Backend & DB**: Next.js API Routes, Supabase
- **Payment**: Toss payments
- **AI**: Gemini with gemini sdk

## 4. 디자인 가이드(Design Guide)
- **Theme**: Mystical, Vibrant, Fluid
- **Color Palette**: Deep purple, Neon Blue, Soft Pink(Aurora Gradients)
- **Interactions**: 부드러운 스크롤, 호버 시 빛나는 효과, 로딩 시 몽환적인 애니메이션

## 5. 프론트엔드 요구사항(Frontend Requirements)

### 5.1 전체 레이아웃 (Global Layout)
1. **상단 네비게이션 바 (Header)**
   - (공통) 홈 로고
   - (비회원) 로그인, 비회원 주문 조회
   - (회원) 마이페이지
   - (반응형) 모바일 환경(md 미만)에서는 우측 상단 햄버거 메뉴 아이콘 제공. 클릭 시 위에서 아래로(Top) 내려오는 풀 너비(Full-width) Drawer를 좌우 여백 없이 화면 전체를 차지하도록 구현하여 메뉴를 노출합니다.
2. **Body**
   - 각 페이지 별 주요 내용 렌더링
3. **Footer**
   - 사업자 정보(상호명, 대표자, 사업자번호, 주소 등), 이용약관 링크, 개인정보처리 방침 링크, 문의하기 링크 포함
   - 모든 페이지 하단에 고정 노출되는 글로벌 레이아웃 구조 적용
4. **Head & Meta**
   - SEO, Open Graph, GA4 등 Analytics 설정

### 5.2 주요 페이지 구성 (Page Configurations)

1. **메인 랜딩페이지 (`/`)**
- **Hero 섹션**
  - 한 줄 문구(H1): **"어젯밤 꿈, 아직 기억나시나요?"**
  - 상세 소개(Sub-text): **"프로이트부터 신경과학까지, 4가지 전문 관점으로 AI가 당신의 꿈을 분석합니다. 어젯밤 꿈을 적으면, 3분 안에 당신만의 꿈 해석 리포트가 완성됩니다."**
  - CTA 버튼 문구: **"내 꿈 해석 시작하기"** → 클릭 시 프로덕트 상세 페이지(`/dream-teller`)로 이동
- **Feature 소개 섹션 (Bento Grid UI)**
  - **Card 1 (Main/Large) - 전문 관점 선택**
    - 타이틀: "프로이트, 칼 융, 그리고 신경과학까지"
    - 설명: "하나의 꿈, 네 가지 학문적 렌즈. 원하는 전문 관점을 선택해 나만의 꿈 해석을 받아보세요."
  - **Card 2 - AI 심층 분석**
    - 타이틀: "키워드 검색은 그만, AI 심층 해석"
    - 설명: "꿈 속 상징, 감정, 서사 구조를 AI가 종합적으로 분석하여 당신만의 해석 리포트를 생성합니다."
  - **Card 3 - AI 꿈 시각화**
    - 타이틀: "꿈을 다시 눈앞에"
    - 설명: "AI가 당신의 꿈 속 장면을 한 장의 이미지로 그려드립니다. 흐릿한 기억이 선명한 그림이 됩니다."
  - **Card 4 - 기록 & 공유**
    - 타이틀: "나만의 꿈 아카이브"
    - 설명: "캘린더에 기록되는 꿈 해석 히스토리. 결과를 친구와 공유하고, 나의 무의식 패턴을 발견하세요."
- 이미 풀이된 이전 유저들의 꿈 해몽 텍스트 및 AI 이미지 예시 리스트 섹션 (더보기 -> 예시 리스트 피드로 이동 / 개별 카드 클릭 -> 해당 해몽 결과 확인 페이지로 이동)

2. **프로덕트 상세 페이지 (`/dream-teller`)**
- **단계별 입력 프로세스 (Accordion UX)**: 유저가 정보 입력에 집중할 수 있도록 3단계 아코디언 인터페이스 적용.
  - Step 1: 전문 분야 선택 (프로이트, 칼 융, 신경과학, 게슈탈트 등)
  - Step 2: 꿈 내용 입력 (최소 20자 이상 권장)
  - Step 3: 결제 옵션 선택 및 최종 금액 확인
- **인터랙션 및 자동화**:
  - `다음 단계` 버튼 클릭 시 다음 섹션이 자동으로 열리며, 해당 위치로 **부드러운 스크롤(Auto-scroll)** 처리.
  - 유저 편의를 위해 '모두 펼쳐보기' 옵션 버튼 제공.
- **구매 옵션 상세**:
  - (기본) 단순 텍스트 해석: 1,500원
  - (추가 옵션) AI 생성 이미지 추가: +500원 (**기본 활성화 상태로 제공**)
- **안내 및 주의 사항**:
  - 보통 3분 이내에 생성이 완료됨을 명시.
  - AI 분석 결과는 의학적 진단을 대체할 수 없음을 경고 섹션으로 배치.
- **모바일 최적화**: 결제하기 버튼을 하단 Sticky 버튼으로 배치하여 접근성 강화.

3. **결제 페이지 (`/payments`)**
- 영수증 디자인을 참고한 디자인의 결제 페이지
- 토스페이먼츠 위젯이 들어갈 섹션
- 회원 결제와 비회원 결제 모두 지원
- 결제가 성공적으로 완료된 후 회원은 마이페이지, 비회원은 비회원 주문 조회 페이지로 이동
- 결제에 실패했을 경우 입력한 꿈 정보가 사라지지 않고 결제 페이지에 그대로 머물러 있음
- **안정성 최적화**: React 18 Strict Mode 환경에서의 토스페이먼츠 위젯 중복 렌더링 충돌을 막기 위해 Event Loop 기반 지연 초기화 및 컴포넌트 Unmount 시 위젯 인스턴스 파기(Destroy) 클린업 로직 적용.

4. **해석 확인 페이지 (`/dream-result/[order-id]`)**
- 결제한 유저가 자신의 꿈 해석 및 AI 이미지(옵션)를 확인할 수 있는 페이지
- **디자인**: Ivory base의 몽환적인 오로라 그라데이션 및 부드러운 애니메이션 적용
- **주요 섹션**:
  - 유저 입력 꿈 내용: 감성적인 인용구(Quote) 스타일로 렌더링
  - AI 생성 이미지: 꿈의 한 장면을 시각화한 고화질 이미지 섹션
  - 심층 해몽 리포트: 전문 관점(칼 융 등)에 따른 상세 분석 텍스트 제공
- **기능**:
  - 링크 복사: 현재 페이지 URL을 클립보드에 복사 (성공 시 버튼 텍스트 피드백)
  - 카카오톡 공유: 카카오 SDK를 연동하여 제목, 이미지, 요약 글이 담긴 피드 메시지 전송
  - 공개 여부 토글: 내 해몽을 피드에 자랑할 수 있도록 스위치 UI 제공 (비회원 유저 또한 쿠키 세션을 연동하여 본인의 결과라면 공개 상태를 변경할 수 있도록 지원)
- **보안 및 렌더링**: Server Component 단에서 `createServiceRoleClient`를 활용, Supabase RLS 정책 제약을 우회하여 데이터를 선행 페치하되, 현재 세션(회원/비회원)과 실제 데이터의 소유자(Ownership)를 수동 매칭하여 권한 없는 접근을 원천 차단하는 이중 보안 구조 설계.
- **회원 전용**: '나의 무의식 캘린더' 섹션이 노출되며, 해몽 기록이 있는 날짜 하이라이트 및 클릭 시 해당 기록으로 이동 가능 (비회원에게는 미노출)

5. **유저의 마이페이지 (`/my-page`)**
- 회원 가입된 유저만 자신의 마이페이지 접근 가능
- 캘린더 라이브러리를 활용해 해몽이 이뤄진 날짜에 하이라이트 표시 및 해당 일자를 누를 경우 해당 해몽 결과 페이지로 넘어감
- 구매 내역 리스트가 캘린더 하단에 배치 및 해당 리스트 아이템을 누를 경우 해당 해몽 결과 확인 페이지로 넘어감
- 닉네임(수정 가능 기능), 로그인 한 소셜 서비스(구글 or 카카오) 로고, 이메일 주소, 로그아웃 버튼

6. **비회원 로그인 (`/guest-login`)**
- 간단한 페이지 소개
- 전화번호 및 비밀번호 입력 폼
- 비회원 주문 조회 버튼

7. **비회원 주문 조회 페이지 (`/guest-check`)**
- 6번에서 로그인 한 비회원이 자신의 구매 내역을 조회하는 페이지
- 구매내역 리스트가 배치되어 있고 해당 리스트 아이템을 눌렀을 때 해당 해몽 결과 확인 페이지로 이동
- **데이터 안정성**: Supabase DB 1:1 관계 스키마의 특성상 응답 데이터가 배열(Array)과 단일 객체(Object) 형식 양쪽으로 떨어질 수 있는 케이스를 종합 헨들링(`Array.isArray` 분기)하여, 비회원 리스트 카드 썸네일 누락 현상을 원천 방어함.

8. **이전 유저들의 과거 풀이 내역 리스트 피드 페이지 (`/feeds`)**
- **UI 스타일**: 페이스북 형태의 타임라인 피드 구성을 통한 친숙한 UX
- **콘텐츠 및 인터랙션**:
  - `faker-js` 기반의 리얼한 더미 데이터(프로필, 꿈 내용, 전문가 분석 요약) 렌더링
  - 이미지가 포함된 해몽과 텍스트 전용 해몽이 혼합된 카드 디자인
  - 정보 집중을 위해 하단 인터랙션(좋아요/댓글 등) 카운트 및 액션 버튼은 제거된 심플한 형태
- **기능**: '더보기' 버튼을 통한 무한 스크롤(Pagination) 방식의 콘텐츠 로딩 지원

9. **회원 로그인 페이지 (`/auth`)**
- 구글 및 카카오 소셜 로그인만 존재
- 각 소셜 서비스로 성공적으로 로그인 후 리다이렉트는 2번 프로덕트 상세 페이지로 이동

10. **관리자 텔레그램 알림 기능 (Telegram Notifications)**
- **결제 상태 알림**: 결제가 완료되거나 실패했을 때 텔레그램 봇으로 즉시 알림 메시지 발송.
  - 성공 알림 예시: 결제 상품(텍스트/이미지), 유저 아이디, 결제 가격, 꿈 내용 앞부분
  - 실패 알림 예시: 실패 상태(잔액 부족, 취소 등) 및 에러 메시지
- **AI 해몽 완료 상태 알림**: 백그라운드에서 AI 해몽과 이미지 생성이 완료되었거나, 오류가 발생해 DB에 기록되었을 때 최종 결과를 포함하여 텔레그램으로 알림 발송 (Success or Fail).

### 5.3 관리자 UX 페이지 구성 (Admin UX Pages)

0. **관리자 페이지 기본 공통 레이아웃**

- 좌측 네비게이션 패널
  - 매출 조회
  - 주문 내역 리스트
- 네비게이션 패널을 제외하고는 각 관리자 메뉴 페이지별 내용 body

1. **관리자 메인 페이지 (`/admin`)**

- 기간별 매출 조회 대시보드(기본 화면)
  - 핵심 지표 요약 카드: 총 매출액, 총 주문 수, 신규 유저 수, 누적 AI 해석 건수 및 전월 대비 증감률 표시 (현재 `faker-js` 기반 더미 데이터 활용)
  - 매출 추이 차트: 최근 8개월간의 월별 매출 합계를 Tailwind CSS 기반 커스텀 막대 차트로 시각화
  - 디자인: `Shadcn/UI` Card 레이아웃 및 `Lucide` 아이콘 적용, 반응형 디자인 대응 (모바일 Drawer 메뉴)

2. **주문 내역 리스트 (`/admin/order-list`)**

- 결제가 완료된 주문 건 확인을 위한 리스트 표
  - 주요 항목: 주문 ID, 구매 일시, 닉네임, 회원/비회원 구분, 전문 분야, 결제 금액, 상태 배지 (결제완료/실패)
  - 검색 기능: 주문번호 및 유저 닉네임을 통한 실시간 필터링
  - 각 리스트 아이템 클릭 시 `3번 상세 주문 내역`으로 이동

3. **상세 주문 내역 (`/admin/order-list/[order-id]`)**

- 주문의 모든 정보를 종합적으로 관리하는 대시보드 형태
  - 구매자 정보: 닉네임, 이메일, 연락처, 회원 등급 표시
  - 결제 정보: 실시간 결제 상태, 총 금액, 토스 주문번호, 승인 일시
  - 콘텐츠 정보: 유저 입력 원본 꿈 텍스트 및 선택된 전문 분석 관점(expertField)
  - 분석 결과: AI(Gemini) 생성 해몽 텍스트 리포트 및 AI 생성 꿈 이미지(미구매 시 제외)
  - 관리자 기능: 해몽 품질 보정을 위한 'LLM 해몽 재생성' 트리거 버튼 제공 (POST /api/admin/orders/[id]/regenerate)

4. **유저 리스트 (`/admin/user-list`)**

- 회원 및 비회원 통합 사용자 관리 페이지
  - 필터링 기능: 전체 / 회원(소셜가입) / 비회원(전화번호 기반) 구분을 통한 선택적 조회
  - 주요 항목: 닉네임, 이메일/전화번호, 가입 경로(Google/Kakao/Guest), 결제 여부, 누적 주문 건수, 가입 일시
  - 검색 기능: 닉네임, 이메일, 전화번호 검색을 통한 실시간 유저 필터링
  - 시각화: 결제 이력(결제완료/미결제) 및 회원 등급별 배지 시스템 적용

## 6. 백엔드 요구사항 및 API 구조 (Backend Requirements & API Structure)

프론트엔드와 독립적으로 기능할 수 있도록 RESTful하고 직관적인 API 구조로 Next.js Route Handlers(API Routes)를 설계합니다.

### 6.1 인증 및 권한 (Auth)

- `POST /api/auth/login`
  - 설명: 소셜 로그인(Google, Kakao) 인증을 위해 Supabase Auth 인스턴스를 통해 각 제공업체의 권한 승인 페이지로 리다이렉트합니다.
- `GET /api/auth/callback`
  - 설명: 소셜 로그인 최종 승인 후 전달된 인증 코드를 확인하여 세션을 확정하고, 성공 시 지정된 페이지(`/dream-teller`)로 리다이렉트합니다.
- `POST /api/auth/logout`
  - 설명: 현재 활성화된 사용자의 세션을 종료하고 로그아웃 처리합니다.
- `POST /api/auth/guest`
  - 설명: 전화번호와 비밀번호를 전달받아 비회원용 세션 토큰을 발급합니다.
  - 반환값: 비회원 인증 토큰.

### 6.2 사용자 (Users)

- `GET /api/users/me`
  - 설명: 현재 로그인한 회원/비회원의 프로필 및 기본 정보를 반환합니다.
- `PATCH /api/users/me`
  - 설명: 사용자의 프로필 정보(예: 닉네임)를 수정합니다.

### 6.3 주문 및 결제 (Orders & Payments)

- `GET /api/orders`
  - 설명: 현재 로그인한 사용자의 구매 이력 리스트를 반환합니다. (마이페이지 용도)
- `POST /api/orders`
  - 설명: 꿈 입력 데이터와 선택된 옵션, 전문 분야 등을 기반으로 주문서(Pending Order)를 생성합니다.
  - **비회원 처리**: 비회원 주문 시 `phone_number`와 `guest_password`를 전달받아 `users` 테이블에 guest 레코드를 생성하거나 기존 정보를 연동합니다.
  - **금액 검증**: 클라이언트에서 전달된 `total_amount`가 서버의 옵션 가격 정책과 일치하는지 반드시 검증하여 위변조를 차단합니다.
- `GET /api/orders/[id]`
  - 설명: 개별 주문에 대한 구매 정보 및 (생성 완료된) 꿈 해몽 결과를 반환합니다.
  - **권한 검증**: 요청자의 세션(회원/비회원)이 해당 주문의 소유주인지 확인하는 로직을 포함합니다.
- `GET /api/orders/guest`
  - 설명: 발급받은 비회원 세션을 인증하여 해당 비회원의 주문 내역 리스트를 반환합니다.
- `POST /api/payments/confirm`
  - 설명: 토스페이먼츠 결제 승인 API를 호출하여 최종 결제 완료 처리를 수행합니다.
  - **후속 처리**: 결제 성공 시 주문 상태를 `paid`로 변경하고, **텔레그램 알림 발송 (상품, 유저아이디, 결제금액, 꿈내용 일부)**을 진행합니다. 직후 AI 해몽 생성 API(`api/ai/generate`)를 비동기 호출합니다.
- `POST /api/payments/fail`
  - 설명: 결제 과정에서 발생한 실패 정보를 기록하고 해당 주문서의 상태를 `failed`로 업데이트합니다.
  - **후속 처리**: 실패 내역(에러 메시지 등)을 포함하여 관리자에게 **텔레그램 실패 알림 발송**을 진행합니다.
- `POST /api/payments/cancel`
  - 설명: 결제 취소 및 환불 요청을 처리합니다. (AI 생성 전 단계 혹은 시스템 장애 시 사용)
- `POST /api/payments/webhook`
  - 설명: 토스페이먼츠로부터 결제 상태 변경 알림(가상계좌 입금 완료 등)을 수신하여 처리합니다.
- `POST /actions/dream-result (toggleDreamPublicAction)`
  - 설명: 생성된 개별 꿈 결과의 피드 공개 여부를 전환하는 Next.js Server Action
  - **보안 처리**: 비회원의 경우 JWT 토큰(`auth.getUser()`)이 없으므로, HttpOnly 쿠키의 `guest_session` 값을 추출한 뒤 Service Role 클라이언트를 활용해 DB 내부의 소유권을 매칭 및 대조하여 타인의 결과물을 변조할 수 없도록 강제 격리 검증을 수반함.

### 6.4 피드 (Feeds)

- `GET /api/feeds`
  - 설명: 사용자에게 노출할 이전 유저들의 공개 해몽 결과 목록을 페이지네이션과 함께 반환합니다. (메인 페이지, `/feeds` 용도)

### 6.5 AI 처리 (AI Processing)

- `POST /api/ai/generate`
  - 설명: 결제가 완료된 주문의 상품(Product) 정보를 확인하여, 순수 텍스트 해몽인지 이미지 생성이 함께 포함된 해몽 상품인지 판별하고 AI 파이프라인을 분기 처리합니다.
  - **텍스트 생성 (Gemini API)**: 결제가 확인된 모든 꿈 텍스트를 바탕으로 AI 모델(Gemini)에 해몽 분석 프롬프트를 전송하여 장문의 해석 결과를 생성합니다.
  - **이미지 생성 (Image Generation API)**: 결제된 내역이 '해몽 텍스트 + AI 이미지 생성'이 포함된 상품인 경우에 한하여 호출됩니다. 일부분석된 텍스트 결과(혹은 꿈 원문)를 토대로 영어 프롬프트를 번역 및 재가공하고, 이미지 생성 API 모델을 호출하여 이미지를 얻습니다. 생성된 이미지는 Supabase Storage 등에 비동기적으로 업로드하여 Public URL 형식으로 변환한 뒤 DB에 저장합니다.
  - **후속 처리**: 텍스트 분석, 이미지 생성 및 DB 저장이 모두 정상적으로 끝났을 때(혹은 생성 과정 중 어디선가 에러로 실패했을 때) 최종 상태 정보와 내역을 **텔레그램 봇을 통해 관리자에게 알림 발송(Success / Fail 단계 명시)**합니다.

### 6.6 관리자 (Admin)

- **기술적 특이사항 (중요)**
  - **Server Actions 전환**: 클라이언트 사이드 `fetch` 시 발생하는 Next.js 미들웨어의 401/403 인증 이슈를 해결하기 위해 모든 관리자 데이터 조회 로직을 `src/app/actions/admin.ts`의 Server Actions로 전환하여 구현함.
  - **데이터 조인 최적화**: `orders`와 `dream_results` 간의 1:1 관계(UNIQUE FK)에 따른 PostgREST의 단일 객체 반환 특성을 고려하여 프론트엔드 데이터 바인딩 로직을 안정화함.

- `GET /api/admin/metrics` (구현완료 - Server Action `getAdminMetrics` 병행 가능) [x]
  - 설명: 관리자 대시보드용으로 기간별 매출과 주문 통계 데이타를 반환합니다.
- `GET /api/admin/orders` (구현완료 - Server Action `getAdminOrders`) [x]
  - 설명: 시스템 전체의 주문 발생 내역 리스트를 페이지네이션 및 필터와 함께 반환합니다. `dream_results`의 생성 상태(`analysis_status`)를 포함합니다.
- `GET /api/admin/orders/[id]` (구현완료 - Server Action `getAdminOrderDetail`) [x]
  - 설명: 상세 주문 내역에서 원본 꿈 텍스트, 사용자 정보, 결제 상태 및 해몽 결과를 반환합니다. `dream_results`는 단일 객체 형태로 매핑됩니다.
- `POST /api/admin/orders/[id]/regenerate` (구현완료) [x]
  - 설명: 결과물 품질 이슈 등을 이유로 LLM 해몽 재생성을 트리거합니다. 관리자 전용 권한 확인 후 AI 파이프라인을 재가동합니다.
- `GET /api/admin/users` (구현완료 - Server Action `getAdminUsers`) [x]
  - 설명: 회원 가입 유저와 비회원 유저 리스트를 조회하고, 각 유저별 누적 주문 및 결제 건수를 합산하여 반환합니다. `phone_number` 필드를 식별자로 사용합니다.

## 7. 데이터베이스 스키마 (Database Schema)

Supabase PostgreSQL 환경을 기준으로 구성하되, 인증 테이블(`auth.users`)과 연결되는 어플리케이션 전용 Public 테이블을 정의합니다. MECE 원칙에 따라 명확히 역할을 분리했습니다.

### 7.1 Users (`users`)

회원(소셜)과 비회원의 정보를 통합 관리하는 테이블입니다.

- **`id`** (UUID, Primary Key, **Not Null**): 고유 식별자 (Supabase `auth.users`의 PK와 1:1 매핑)
- **`role`** (String, **Not Null**): 사용자 역할 (`member`, `guest`, `admin`)
- **`provider`** (String, **Not Null**): 가입 경로 (`google`, `kakao`, `guest`)
- **`email`** (String, Null): 회원 이메일 (소셜 로그인 회원용)
- **`nickname`** (String, Null): 사용자 닉네임
- **`phone_number`** (String, Null): 비회원 식별 및 주문 조회용 전화번호
- **`guest_password_hash`** (String, Null): 비회원용 암호화된 비밀번호
- **`created_at`** (Timestamp, **Not Null**): 계정 생성 일시
- **`updated_at`** (Timestamp, **Not Null**): 정보 최종 수정 일시

### 7.2 Orders (`orders`)

사용자의 꿈 분석 요청 및 토스페이먼츠 결제 내역을 매핑하는 테이블입니다.

- **`id`** (UUID, Primary Key, **Not Null**): 내부 시스템의 고유 주문 식별자
- **`order_number`** (String, Unique, **Not Null**): 토스페이먼츠의 `orderId`로 사용될 고유 주문 번호
- **`user_id`** (UUID, Foreign Key, **Not Null**): 결제를 진행한 `users.id` 참조
- **`total_amount`** (Integer, **Not Null**): 총 결제 금액
- **`payment_status`** (String, **Not Null**): 결제 상태 (`pending`, `paid`, `failed`, `refunded`, `canceled`)
- **`payment_key`** (String, Null): 토스페이먼츠 승인 키 (결제 성공 시 저장)
- **`approved_at`** (Timestamp, Null): 토스페이먼츠 결제 승인 시각
- **`error_message`** (Text, Null): 결제 실패/에러 시 사유 메시지
- **`dream_content`** (Text, **Not Null**): 유저가 직접 입력한 원본 꿈 내용
- **`expert_field`** (String, **Not Null**): 선택한 해몽 전문 분야 (`freud`, `jung`, `neuroscience`, `gestalt` 등)
- **`includes_image`** (Boolean, **Not Null**): AI 이미지 생성 옵션 구매 여부
- **`created_at`** (Timestamp, **Not Null**): 주문서 생성 일시
- **`updated_at`** (Timestamp, **Not Null**): 결제 및 상태 업데이트 일시

### 7.3 Dream Results (`dream_results`)

결제 완료 후 생성되는 AI 해몽 결과물과 이미지 URL, 피드 공개 여부를 담당하는 테이블입니다.

- **`id`** (UUID, Primary Key, **Not Null**): 고유 식별자
- **`order_id`** (UUID, Foreign Key / Unique, **Not Null**): 매칭되는 `orders.id` 참조 (1:1 관계)
- **`analysis_status`** (String, **Not Null**): 해몽 진행 상태 (`processing`, `completed`, `failed`)
- **`analysis_text`** (Text, Null): AI(Gemini)가 생성해낸 심층 해몽 텍스트
- **`image_url`** (String, Null): AI(Gemini)가 묘사해준 꿈 이미지 URL (옵션 미구매 시 Null)
- **`is_public`** (Boolean, **Not Null**): Feed 페이지 공유 노출 여부 (`true` or `false`)
- **`created_at`** (Timestamp, **Not Null**): 해몽 작업 최초 생성 일시
- **`updated_at`** (Timestamp, **Not Null**): 해몽 결과 또는 노출 여부 수정(Update) 통제용 일시
