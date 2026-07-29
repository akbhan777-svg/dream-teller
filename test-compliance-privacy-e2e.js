const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting E2E Test for Privacy & AI Model Opt-Out (PIPA Compliance)...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. Verify Privacy Policy Page (/privacy)
    console.log('1. Navigating to /privacy');
    await page.goto('http://localhost:3000/privacy', { waitUntil: 'networkidle0' });

    const privacyText = await page.evaluate(() => document.body.innerText);
    const hasOptOutClause = privacyText.includes('AI 모델 학습') && privacyText.includes('학습 미활용');

    console.log(`Privacy policy page contains AI Opt-out clause: ${hasOptOutClause}`);
    if (!hasOptOutClause) {
      throw new Error('Privacy policy page is missing AI Model Opt-out clause!');
    }

    // 2. Verify Form Privacy Notice (/)
    console.log('2. Navigating to / (Dream Teller Form)');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const formText = await page.evaluate(() => document.body.innerText);
    const hasFormPrivacyNotice = formText.includes('AI 모델 학습에 활용되지 않으며');

    console.log(`Form Step 3 contains Privacy Notice: ${hasFormPrivacyNotice}`);
    if (!hasFormPrivacyNotice) {
      throw new Error('Dream Teller Form is missing Step 3 Privacy Notice banner!');
    }

    console.log('✅ PIPA Privacy & AI Model Opt-out E2E Test Passed Successfully!');
  } catch (error) {
    console.error('❌ PIPA Privacy E2E Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
