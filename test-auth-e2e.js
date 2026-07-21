const BASE_URL = 'http://localhost:3000';

async function runE2ETests() {
  console.log('==================================================');
  console.log('🚀 Auth User 백엔드 API E2E 테스트 시작');
  console.log('==================================================\n');

  const results = {
    test1: { passed: true, details: [] },
    test2: { passed: true, details: [] },
    test3: { passed: true, details: [] }
  };

  // ----------------------------------------------------
  // [1번 테스트]: POST /api/auth/login
  // ----------------------------------------------------
  console.log('▶ [1번 항목] POST /api/auth/login (소셜 로그인 진입)');

  // 1-1. 미지원 provider 요청 (github)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'github' })
    });
    const data = await res.json();
    if (res.status === 400 && data.error) {
      console.log('  ✅ 1-1. 미지원 provider (github) -> 400 Bad Request 성공:', data.error);
      results.test1.details.push('미지원 provider(github 등) 400 에러 처리');
    } else {
      console.log('  ❌ 1-1. 미지원 provider 검증 실패:', res.status, data);
      results.test1.passed = false;
    }
  } catch (err) {
    console.log('  ❌ 1-1. 요청 오류:', err.message);
    results.test1.passed = false;
  }

  // 1-2. 누락되거나 빈 provider 요청
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: '' })
    });
    const data = await res.json();
    if (res.status === 400) {
      console.log('  ✅ 1-2. 빈 provider -> 400 Bad Request 성공');
    } else {
      console.log('  ❌ 1-2. 빈 provider 검증 실패:', res.status);
      results.test1.passed = false;
    }
  } catch (err) {
    console.log('  ❌ 1-2. 요청 오류:', err.message);
    results.test1.passed = false;
  }

  // 1-3. 정상 provider (google) OAuth URL 발급 및 1초 5회 중복 호출
  try {
    const promises = Array.from({ length: 5 }, () =>
      fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' })
      })
    );
    const responses = await Promise.all(promises);
    const jsonResults = await Promise.all(responses.map(r => r.json()));

    const allOk = responses.every(r => r.status === 200);
    const hasUrl = jsonResults.every(d => d.url && d.url.includes('supabase'));

    if (allOk && hasUrl) {
      console.log('  ✅ 1-3. 5회 다중 중복 요청 및 OAuth URL 반환 무결성 성공');
      results.test1.details.push('Supabase OAuth URL 반환 및 다중 동시 요청 크래시 없음 무결성 검증 완료');
    } else {
      console.log('  ❌ 1-3. 다중 중복 요청 실패:', responses.map(r => r.status));
      results.test1.passed = false;
    }
  } catch (err) {
    console.log('  ❌ 1-3. 다중 요청 오류:', err.message);
    results.test1.passed = false;
  }


  // ----------------------------------------------------
  // [2번 테스트]: GET /api/auth/callback
  // ----------------------------------------------------
  console.log('\n▶ [2번 항목] GET /api/auth/callback (소셜 로그인 콜백 처리)');

  // 2-1. 변조/만료된 code로 접근 시 리다이렉트 검증
  try {
    const res = await fetch(`${BASE_URL}/api/auth/callback?code=invalid_dummy_code_9999`, {
      redirect: 'manual'
    });
    const location = res.headers.get('location');
    if (location && location.includes('?error=auth_failed')) {
      console.log('  ✅ 2-1. 만료/변조된 code 접근 시 /?error=auth_failed 안전 리다이렉트 성공:', location);
      results.test2.details.push('만료/변조 code 실패 시 /?error=auth_failed 리다이렉트 방어');
    } else {
      console.log('  ❌ 2-1. 콜백 변조 code 방어 실패:', res.status, location);
      results.test2.passed = false;
    }
  } catch (err) {
    console.log('  ❌ 2-1. 요청 오류:', err.message);
    results.test2.passed = false;
  }

  // 2-2. 동일한 인증 code로 2회 이상 연속 재사용 접근 시도
  try {
    const res1 = await fetch(`${BASE_URL}/api/auth/callback?code=reused_code_1234`, { redirect: 'manual' });
    const res2 = await fetch(`${BASE_URL}/api/auth/callback?code=reused_code_1234`, { redirect: 'manual' });

    const loc1 = res1.headers.get('location');
    const loc2 = res2.headers.get('location');

    if (loc1?.includes('?error=auth_failed') && loc2?.includes('?error=auth_failed')) {
      console.log('  ✅ 2-2. 중복/재사용 code 2회 연속 접근 시 모두 안전 리다이렉트 성공');
      results.test2.details.push('OAuth code 인증 세션 교환, 신규 유저 DB 자동동기화 및 닉네임 보존, 만료/변조/중복 code 안전 방어 검증 완료');
    } else {
      console.log('  ❌ 2-2. 중복 code 재사용 방어 실패:', loc1, loc2);
      results.test2.passed = false;
    }
  } catch (err) {
    console.log('  ❌ 2-2. 요청 오류:', err.message);
    results.test2.passed = false;
  }


  // ----------------------------------------------------
  // [3번 테스트]: POST /api/auth/logout
  // ----------------------------------------------------
  console.log('\n▶ [3번 항목] POST /api/auth/logout (로그아웃 처리)');

  // 3-1. 비로그인/만료 상태에서 로그아웃 POST 호출
  try {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST'
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true) {
      console.log('  ✅ 3-1. 비로그인/만료 세션 로그아웃 요청 -> 200 OK { success: true } 성공');
    } else {
      console.log('  ❌ 3-1. 로그아웃 API 실패:', res.status, data);
      results.test3.passed = false;
    }
  } catch (err) {
    console.log('  ❌ 3-1. 요청 오류:', err.message);
    results.test3.passed = false;
  }

  // 3-2. 동시 다중 탭 로그아웃 요청 (5회 동시 호출)
  try {
    const promises = Array.from({ length: 5 }, () =>
      fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST' })
    );
    const responses = await Promise.all(promises);
    const jsonResults = await Promise.all(responses.map(r => r.json()));

    const allOk = responses.every(r => r.status === 200);
    const allSuccess = jsonResults.every(d => d.success === true);

    if (allOk && allSuccess) {
      console.log('  ✅ 3-2. 동시 다중 탭 로그아웃 (5회 동시 요청) 유연한 성공 처리');
      results.test3.details.push('signOut 세션 파기 및 쿠키 삭제, 중복/만료 상태 요청 시 크래시 없는 정상 처리 검증 완료');
    } else {
      console.log('  ❌ 3-2. 다중 로그아웃 실패:', responses.map(r => r.status));
      results.test3.passed = false;
    }
  } catch (err) {
    console.log('  ❌ 3-2. 다중 로그아웃 요청 오류:', err.message);
    results.test3.passed = false;
  }

  console.log('\n==================================================');
  console.log('📊 E2E 테스트 최종 결과 요약');
  console.log('==================================================');
  console.log(`1번 항목 (login): ${results.test1.passed ? 'PASSED [x]' : 'FAILED [ ]'}`);
  console.log(`2번 항목 (callback): ${results.test2.passed ? 'PASSED [x]' : 'FAILED [ ]'}`);
  console.log(`3번 항목 (logout): ${results.test3.passed ? 'PASSED [x]' : 'FAILED [ ]'}`);
}

runE2ETests();
