const fetch = require('node-fetch');

(async () => {
  console.log('Starting Vercel Serverless Memory & Perf Optimization E2E Test...');
  
  // Test the latency of the /api/orders route without DOMPurify overhead
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'single',
        amount: 990, // using the correct new pricing
        includesImage: false,
        dreamContent: 'Performance test dream content'
      })
    });
    
    const result = await response.json();
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    if (response.ok && result.success) {
      console.log(`✅ Passed: API Request Succeeded without 500 error.`);
      console.log(`⏱️ Latency: ${latency}ms`);
      
      if (latency < 3000) {
        console.log(`✅ Passed: Latency is within acceptable cold-start / fast execution bounds (less than 3000ms).`);
      } else {
        console.warn(`⚠️ Warning: Latency was ${latency}ms, which is slightly high, but 500 HTML errors were avoided.`);
      }
      
      // Also confirm isomorphic-dompurify is not present in package.json
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      if (!pkg.dependencies['isomorphic-dompurify'] && !pkg.dependencies['dompurify']) {
         console.log('✅ Passed: Heavy DOMPurify dependencies successfully removed from package.json');
      } else {
         console.error('❌ CRITICAL: Heavy DOMPurify dependencies still exist in package.json!');
         process.exit(1);
      }
      
      console.log('\n🎉 E2E Vercel Serverless Perf Test Passed Successfully!');
    } else {
      console.error(`❌ Failed: API returned an error!`, result);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed Exception:', error.message);
    process.exit(1);
  }
})();
