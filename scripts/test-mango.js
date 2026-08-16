const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', (c) => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function test() {
  const html = await fetch('https://mangochairs.com/product/bella');
  
  // Check what format the slug appears in
  const tests = ['"bella"', 'bella', '"slug":"bella"', '\\"slug\\":\\"bella\\"'];
  for (const t of tests) {
    const idx = html.indexOf(t);
    console.log(`"${t}": index=${idx}`);
  }
  
  // Find the product name "Bella" 
  const idx = html.indexOf('Bella');
  console.log('\n"Bella" found at:', idx);
  if (idx > -1) {
    console.log('Context:', html.substring(Math.max(0, idx - 100), idx + 200));
  }
  
  // Find first /media/product image
  const imgIdx = html.indexOf('/media/product');
  console.log('\nFirst /media/product at:', imgIdx);
  if (imgIdx > -1) {
    console.log('Context:', html.substring(Math.max(0, imgIdx - 100), imgIdx + 200));
  }
}

test().catch(console.error);
