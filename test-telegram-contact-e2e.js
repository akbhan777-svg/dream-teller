const fetch = require('node-fetch');

(async () => {
  console.log('Starting Telegram Contact Bot E2E Test...');
  
  // Test Case 1: Normal Contact Request
  const testNormal = {
    name: "비회원 홍길동",
    email: "test@example.com",
    category: "환불 문의",
    message: "테스트 문의입니다. 빠르게 연락주세요."
  };
  
  // Test Case 2: Incomplete info (no email, no category) & Special chars
  const testSpecialChars = {
    name: "Tom & Jerry",
    email: "", // User leaves it blank
    category: "", // User leaves it blank
    message: "<b>HTML 태그</b>가 포함된 내용 & 테스트 <스크립트> 등."
  };

  const testCases = [
    { name: "Normal Request", payload: testNormal },
    { name: "Special Characters & Missing Fields", payload: testSpecialChars }
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    console.log(`\nTesting: ${tc.name}`);
    try {
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tc.payload)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`✅ Passed: Server accepted and processed the inquiry.`);
        passedCount++;
      } else {
        console.error(`❌ Failed: Server returned error:`, result);
      }
    } catch (e) {
      console.error(`❌ Failed Exception on ${tc.name}:`, e.message);
    }
  }

  console.log(`\nResult: ${passedCount} / ${testCases.length} tests passed.`);
  if (passedCount === testCases.length) {
    console.log('🎉 E2E Telegram Contact Bot Test Passed Successfully!');
  } else {
    console.error('❌ E2E Test Failed!');
    process.exit(1);
  }
})();
