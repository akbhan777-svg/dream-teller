const BASE_URL = 'http://localhost:3000';

async function runRemainingTests() {
  console.log('==================================================');
  console.log('🚀 잔여 E2E 테스트 진행 시작 (4, 7, 13, 14, 15, 16, 17, 18)');
  console.log('==================================================\n');

  // [4번 테스트]: POST /api/auth/guest (비회원 세션 발급)
  console.log('▶ [4번 항목] POST /api/auth/guest (비회원 세션 발급)');
  try {
    const res = await fetch(`${BASE_URL}/api/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '01012345678', password: 'password123' })
    });
    console.log(`  상태 코드: ${res.status}`);
  } catch (err) {
    console.log(`  요청 오류: ${err.message}`);
  }

  // [7번 테스트]: POST /api/orders (비회원 주문 생성 및 세션 연동)
  console.log('\n▶ [7번 항목] POST /api/orders (비회원 주문)');
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guest_phone: '01012345678',
        guest_password: 'password123',
        amount: 1500,
        order_type: 'single_interpretation'
      })
    });
    console.log(`  상태 코드: ${res.status}`);
  } catch (err) {
    console.log(`  요청 오류: ${err.message}`);
  }

  // [13번 테스트]: GET /api/admin/* (관리자 권한 제어)
  console.log('\n▶ [13번 항목] GET /api/admin/orders (관리자 API 접근 시도)');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/orders`);
    console.log(`  상태 코드: ${res.status}`);
  } catch (err) {
    console.log(`  요청 오류: ${err.message}`);
  }

  // [14번, 15번 테스트]: POST /api/ai/generate (AI 처리 및 텔레그램 연동)
  console.log('\n▶ [14번, 15번 항목] POST /api/ai/generate (AI 생성 및 알림)');
  try {
    const res = await fetch(`${BASE_URL}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'dummy-order-id' })
    });
    console.log(`  상태 코드: ${res.status}`);
  } catch (err) {
    console.log(`  요청 오류: ${err.message}`);
  }

  // [16번 테스트]: /my-page (마이페이지 렌더링 검증)
  console.log('\n▶ [16번 항목] GET /my-page (마이페이지 DB 렌더링)');
  try {
    const res = await fetch(`${BASE_URL}/my-page`);
    console.log(`  상태 코드: ${res.status}`);
  } catch (err) {
    console.log(`  요청 오류: ${err.message}`);
  }

  // [17번 테스트]: / (메인페이지 피드 렌더링)
  console.log('\n▶ [17번 항목] GET / (메인페이지 진입)');
  try {
    const res = await fetch(`${BASE_URL}/`);
    console.log(`  상태 코드: ${res.status}`);
  } catch (err) {
    console.log(`  요청 오류: ${err.message}`);
  }

  // [18번 테스트]: /feeds (피드 페이지 접근)
  console.log('\n▶ [18번 항목] GET /feeds (피드 페이지 진입)');
  try {
    const res = await fetch(`${BASE_URL}/feeds`);
    console.log(`  상태 코드: ${res.status}`);
  } catch (err) {
    console.log(`  요청 오류: ${err.message}`);
  }
}

runRemainingTests();
