const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting E2E Test for Fair Labeling & Medical Act Disclaimer Compliance...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. Verify Form Step 4 Disclaimer (/)
    console.log('1. Navigating to / (Dream Teller Form)');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const formText = await page.evaluate(() => document.body.innerText);
    const hasFormDisclaimer = formText.includes('엔터테인먼트 목적') && formText.includes('의학적');

    console.log(`Form Step 4 contains Medical Disclaimer: ${hasFormDisclaimer}`);
    if (!hasFormDisclaimer) {
      throw new Error('Dream Teller Form Step 4 is missing Medical Disclaimer!');
    }

    console.log('✅ Fair Labeling & Medical Act Disclaimer E2E Test Passed Successfully!');
  } catch (error) {
    console.error('❌ Medical Disclaimer E2E Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
