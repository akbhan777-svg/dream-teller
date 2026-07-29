const https = require('https');

function checkImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let size = 0;
      res.on('data', (chunk) => {
        size += chunk.length;
      });
      res.on('end', () => {
        resolve({
          url: url,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          sizeKB: Math.round(size / 1024)
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const prompt = "A breathtaking wide-angle surreal dreamscape, masterpiece, 8k resolution, ultra detailed, photorealistic, luxury aesthetic, cinematic lighting, 8k uhd, raytracing, perfect composition";
  const encoded = encodeURIComponent(prompt);
  
  const urls = [
    `https://image.pollinations.ai/prompt/${encoded}`,
    `https://image.pollinations.ai/prompt/${encoded}?width=2048&height=2048`,
    `https://image.pollinations.ai/prompt/${encoded}?width=2048&height=2048&model=flux`,
    `https://image.pollinations.ai/prompt/${encoded}.png?width=2048&height=2048&model=flux`,
    `https://image.pollinations.ai/prompt/${encoded}?width=2048&height=2048&model=turbo`,
    `https://image.pollinations.ai/prompt/${encoded}?width=1920&height=1080`
  ];

  for (const url of urls) {
    try {
      const result = await checkImage(url);
      console.log(`URL: ${result.url.substring(0, 70)}...`);
      console.log(`Status: ${result.statusCode}, Type: ${result.contentType}, Size: ${result.sizeKB} KB\n`);
    } catch (e) {
      console.error("Error fetching", url, e.message);
    }
  }
}

main();
