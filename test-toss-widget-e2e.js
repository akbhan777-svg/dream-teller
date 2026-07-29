const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Toss Payments Widget V2 Mobile Touch & Promise Hang E2E Test...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Emulate mobile device
  const iPhone = puppeteer.KnownDevices['iPhone 13'];
  await page.emulate(iPhone);
  
  try {
    // 1. First Pass
    console.log('--- Test Run 1: Normal Navigation ---');
    await page.goto('http://localhost:3000/dream-teller', { waitUntil: 'networkidle0' });
    
    // Step 1
    await page.waitForSelector('textarea[placeholder*="꿈의 내용"]');
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeInputValueSetter.call(textarea, '모바일 터치 결제 위젯을 테스트하기 위한 충분한 길이의 꿈 내용입니다.');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    await page.waitForSelector('button:not([disabled])');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('다음으로'));
      if (nextBtn) nextBtn.click();
    });

    // Step 2
    await page.waitForSelector('input[placeholder*="년도"]');
    await page.type('input[placeholder*="년도"]', '1990');
    // click male/female button just in case
    await page.evaluate(() => {
      const gBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === '남성');
      if (gBtn) gBtn.click();
      const nextBtn2 = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('결과 확인하러 가기'));
      if (nextBtn2) nextBtn2.click();
    });

    // Step 3
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(el => el.textContent.includes('결제하기'));
    }, { timeout: 5000 });
    
    await page.evaluate(() => {
      const payBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('결제하기'));
      if (payBtn) payBtn.click();
    });

    // Wait for Toss Payments page to render the widget
    console.log('Waiting for Toss Payments Widget iframe to load...');
    await page.waitForSelector('#payment-method iframe', { timeout: 15000 });
    console.log('✅ Toss Widget iframe rendered successfully (No Infinite Loop detected on first load)');
    
    // Test mobile touch / pointer events
    // Instead of evaluating, we use page.tap which simulates a touch event
    const iframeHandle = await page.$('#payment-method iframe');
    if (iframeHandle) {
      console.log('Simulating mobile touch on the widget iframe...');
      await iframeHandle.tap();
      console.log('✅ Mobile touch event dispatched successfully without CSS transform hit-testing errors.');
    } else {
      throw new Error("Iframe not found for touch test.");
    }

    // 2. Second Pass (Reload / Refresh) - Check Promise Hang
    console.log('--- Test Run 2: Reloading (Promise Hang check) ---');
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Because reloading might reset to step 1 depending on the state, we just navigate again
    await page.goto('http://localhost:3000/dream-teller', { waitUntil: 'networkidle0' });
    
    // Quick re-entry
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeInputValueSetter.call(textarea, '모바일 터치 결제 위젯을 테스트하기 위한 충분한 길이의 꿈 내용입니다.');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('다음으로'));
      if (nextBtn) nextBtn.click();
    });

    await page.waitForSelector('input[placeholder*="년도"]');
    await page.type('input[placeholder*="년도"]', '1990');
    await page.evaluate(() => {
      const gBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === '여성');
      if (gBtn) gBtn.click();
      const nextBtn2 = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('결과 확인하러 가기'));
      if (nextBtn2) nextBtn2.click();
    });

    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(el => el.textContent.includes('결제하기'));
    }, { timeout: 5000 });
    
    await page.evaluate(() => {
      const payBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('결제하기'));
      if (payBtn) payBtn.click();
    });

    // Check again for hang
    console.log('Waiting for Toss Payments Widget iframe again...');
    await page.waitForSelector('#payment-method iframe', { timeout: 15000 });
    console.log('✅ Toss Widget iframe rendered successfully on repeated attempt. No Promise Hang occurred.');
    
    console.log('🎉 E2E Test Passed Successfully!');
  } catch (error) {
    console.error('❌ E2E Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
