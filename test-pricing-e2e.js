const fetch = require('node-fetch');

(async () => {
  console.log('Starting Backend Pricing Integrity E2E Test...');
  
  const testCases = [
    { name: 'Single (No Image)', plan: 'single', includesImage: false, amount: 990, expectSuccess: true },
    { name: 'Single (With Image)', plan: 'single', includesImage: true, amount: 1190, expectSuccess: true },
    { name: 'Pass 5 (Member Only)', plan: 'pass5', includesImage: true, amount: 4760, expectSuccess: false, isMemberRoute: true }, // will fail 403 as guest, which is expected
    { name: 'Pass 10 (Member Only)', plan: 'pass10', includesImage: true, amount: 8330, expectSuccess: false, isMemberRoute: true }, // will fail 403 as guest
    { name: 'Single (Hacked Amount)', plan: 'single', includesImage: false, amount: 100, expectSuccess: false },
    { name: 'Single (Old Price)', plan: 'single', includesImage: true, amount: 2000, expectSuccess: false },
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    console.log(`\nTesting: ${tc.name} | Amount: ${tc.amount}`);
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: tc.plan,
          amount: tc.amount,
          includesImage: tc.includesImage,
          dreamContent: 'Test dream',
        }),
      });

      const result = await response.json();
      
      // If it's a member route and we test as guest, we expect 403.
      if (tc.isMemberRoute && response.status === 403) {
         console.log(`✅ Passed (Expected 403 Forbidden for guest on multi-pass): ${JSON.stringify(result)}`);
         passedCount++;
         continue;
      }
      
      if (tc.expectSuccess) {
        if (result.success && result.amount === tc.amount) {
          console.log(`✅ Passed: Server accepted correct amount ${tc.amount}`);
          passedCount++;
        } else {
          console.error(`❌ Failed: Server rejected correct amount ${tc.amount}. Response:`, result);
        }
      } else {
        if (!result.success) {
          console.log(`✅ Passed: Server correctly rejected hacked/incorrect amount ${tc.amount}. Error: ${result.error}`);
          passedCount++;
        } else {
          console.error(`❌ Failed: Server ACCEPTED incorrect amount ${tc.amount}! SECURITY BREACH!`);
        }
      }
    } catch (e) {
      console.error(`❌ Request Failed for ${tc.name}:`, e.message);
    }
  }

  console.log(`\nResult: ${passedCount} / ${testCases.length} tests passed.`);
  if (passedCount === testCases.length) {
    console.log('🎉 E2E Pricing Integrity Test Passed Successfully!');
  } else {
    console.error('❌ E2E Pricing Integrity Test Failed!');
    process.exit(1);
  }
})();
