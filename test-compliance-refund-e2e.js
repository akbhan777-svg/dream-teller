const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting E2E Test for Refund Consent (Compliance)...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('Navigated to localhost:3000');

    // Fill phone and password
    console.log('Filling out guest info (Step 1)');
    await page.waitForSelector('input[type="tel"]');
    await page.type('input[type="tel"]', '01012345678');
    await page.type('input[name="guest-pin"]', '1234');
    
    // Select expert
    console.log('Selecting expert (Step 2)');
    await page.evaluate(() => {
      const expertBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('프로이트') || el.textContent.includes('칼 융'));
      if (expertBtn) expertBtn.click();
    });

    // Fill Dream Content
    console.log('Filling out dream content (Step 3)');
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        // trigger react onChange
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        nativeInputValueSetter.call(textarea, '이것은 20자가 넘어가는 매우 길고 상세한 꿈 내용입니다. 환불 동의 테스트를 위해 작성되었습니다. 이정도면 20자가 넘습니다.');
        const ev2 = new Event('input', { bubbles: true});
        textarea.dispatchEvent(ev2);
      }
    });
    
    // Select Single Payment
    console.log('Selecting payment option (Step 4)');
    await page.evaluate(() => {
      const singleOpt = Array.from(document.querySelectorAll('label')).find(el => el.textContent.includes('1회 해몽권') || el.textContent.includes('단판'));
      if (singleOpt) singleOpt.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Check if the payment button is disabled
    const isBtnDisabled = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('결제하기'));
      return btn ? btn.disabled : false;
    });
    
    console.log(`Payment button is disabled before consent: ${isBtnDisabled}`);
    if (!isBtnDisabled) {
      throw new Error("Payment button should be DISABLED before checking the consent box.");
    }
    
    // Click the consent checkbox
    console.log('Clicking refund consent checkbox');
    await page.click('input#refund-consent-checkbox');
    
    await new Promise(r => setTimeout(r, 500));

    // Check if the payment button is enabled
    const isBtnEnabled = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('결제하기'));
      return btn ? !btn.disabled : false;
    });
    
    console.log(`Payment button is enabled after consent: ${isBtnEnabled}`);
    if (!isBtnEnabled) {
      throw new Error("Payment button should be ENABLED after checking the consent box.");
    }
    
    console.log('✅ E2E Test Passed Successfully!');
  } catch (error) {
    console.error('❌ E2E Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
