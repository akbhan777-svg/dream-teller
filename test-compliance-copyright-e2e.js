const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting E2E Test for Copyright Act & IP Infringement Prevention Compliance...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. Verify Terms Page (/terms)
    console.log('1. Navigating to /terms');
    await page.goto('http://localhost:3000/terms', { waitUntil: 'networkidle0' });

    const termsText = await page.evaluate(() => document.body.innerText);
    const hasCopyrightClause = termsText.includes('AI 결과물의 저작권') && termsText.includes('지식재산권');
    const hasUserResponsibility = termsText.includes('상표권') || termsText.includes('민·형사상 법적 책임');

    console.log(`Terms page contains Copyright clause: ${hasCopyrightClause}`);
    console.log(`Terms page contains User IP Responsibility clause: ${hasUserResponsibility}`);

    if (!hasCopyrightClause || !hasUserResponsibility) {
      throw new Error('Terms page is missing Copyright Act or IP Infringement User Responsibility clause!');
    }

    console.log('✅ Copyright Act & IP Infringement Compliance E2E Test Passed Successfully!');
  } catch (error) {
    console.error('❌ Copyright Compliance E2E Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
