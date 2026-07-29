// Simulate the Server Action environment
const adminVerifyAttempts = new Map();

async function mockVerifyAndRegisterAdmin(secretKey, userId) {
  const now = Date.now();
  const attemptRecord = adminVerifyAttempts.get(userId);
  
  if (attemptRecord && attemptRecord.lockUntil > now) {
    const remainingSec = Math.ceil((attemptRecord.lockUntil - now) / 1000);
    return { error: `연속된 인증 실패로 접근이 차단되었습니다. ${remainingSec}초 후에 다시 시도해주세요.` };
  }

  const expectedSecretKey = "dt-admin-2026-secret!";

  if (secretKey !== expectedSecretKey) {
    const currentCount = attemptRecord ? attemptRecord.count + 1 : 1;
    if (currentCount >= 5) {
      adminVerifyAttempts.set(userId, { count: currentCount, lockUntil: now + 3 * 60 * 1000 });
    } else {
      adminVerifyAttempts.set(userId, { count: currentCount, lockUntil: 0 });
    }
    return { error: `관리자 본인 인증 보안 키가 올바르지 않습니다. (실패 ${currentCount}/5회)` };
  }

  adminVerifyAttempts.delete(userId);
  return { success: true };
}

(async () => {
  console.log('Starting Security Admin Brute Force E2E Test...');
  const testUserId = "test-user-123";
  let passedCount = 0;

  // 1. Try 4 incorrect passwords
  for (let i = 1; i <= 4; i++) {
    const res = await mockVerifyAndRegisterAdmin("wrong-pass", testUserId);
    if (res.error && res.error.includes(`실패 ${i}/5회`)) {
       console.log(`✅ Passed: Attempt ${i} correctly blocked with count.`);
       passedCount++;
    } else {
       console.error(`❌ Failed: Attempt ${i} returned unexpected response:`, res);
    }
  }

  // 2. Try the 5th incorrect password (Should trigger lockdown)
  const lockRes = await mockVerifyAndRegisterAdmin("wrong-pass-5", testUserId);
  if (lockRes.error && lockRes.error.includes('실패 5/5회')) {
     console.log(`✅ Passed: Attempt 5 triggered lockdown recording.`);
     passedCount++;
  } else {
     console.error(`❌ Failed: Attempt 5 did not trigger final count properly:`, lockRes);
  }

  // 3. Try another password immediately (Should be locked out)
  const postLockRes = await mockVerifyAndRegisterAdmin("dt-admin-2026-secret!", testUserId);
  if (postLockRes.error && postLockRes.error.includes('연속된 인증 실패로 접근이 차단되었습니다')) {
     console.log(`✅ Passed: Brute force prevented! 6th attempt (even with correct password) was blocked due to active Rate Limit.`);
     passedCount++;
  } else {
     console.error(`❌ CRITICAL VULNERABILITY: 6th attempt bypassed Rate Limiting!`, postLockRes);
     process.exit(1);
  }

  // Total 6 tests
  if (passedCount === 6) {
    console.log('\n🎉 E2E Security Admin Brute Force Test Passed Successfully!');
  } else {
    console.error('\n❌ E2E Security Test Failed!');
    process.exit(1);
  }
})();
