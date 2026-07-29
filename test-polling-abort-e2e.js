const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Polling Abort Stability E2E Test...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  let fetchErrorCaught = false;

  // Listen to page errors and console messages
  page.on('pageerror', (err) => {
    if (err.message.includes('Failed to fetch') || err.message.includes('Abort')) {
      fetchErrorCaught = true;
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error' && (msg.text().includes('Failed to fetch') || msg.text().includes('Abort'))) {
      fetchErrorCaught = true;
    }
  });
  
  try {
    // We assume there's an existing order or we just simulate being on a dream-result page
    // Even if it redirects or shows 404/forbidden, if the interval starts, it might trigger the error.
    // For a real test, we would generate a pending order first, but this is a structural check.
    
    // Actually, going to /my-page directly triggers user fetching.
    // Let's create an order first through the API, then go to the result page.
    console.log('Creating a mock pending order...');
    const fetch = require('node-fetch');
    const orderRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'single',
        amount: 990,
        includesImage: false,
        dreamContent: 'Test dream for polling'
      }),
    });
    
    const orderData = await orderRes.json();
    const orderId = orderData.orderId;
    
    console.log(`Order created: ${orderId}. Navigating to result page...`);
    
    // Go to the result page which will start polling
    await page.goto(`http://localhost:3000/dream-result/${orderId}`, { waitUntil: 'networkidle0' });
    
    console.log('Polling started. Waiting 6 seconds for at least one poll to trigger...');
    await new Promise(r => setTimeout(r, 6000));
    
    console.log('User is suddenly navigating away to /my-page...');
    // Trigger navigation away while polling might be in-flight
    await page.goto('http://localhost:3000/my-page', { waitUntil: 'networkidle0' });
    
    console.log('Waiting another 5 seconds to catch any delayed abort errors...');
    await new Promise(r => setTimeout(r, 5000));
    
    if (fetchErrorCaught) {
      console.error('❌ E2E Test Failed: "Failed to fetch" or "Abort" error was caught in the console during page transition.');
      process.exit(1);
    } else {
      console.log('✅ E2E Test Passed: No polling abort errors detected during rapid page transitions.');
    }
  } catch (error) {
    console.error('❌ E2E Test Failed due to unexpected exception:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
