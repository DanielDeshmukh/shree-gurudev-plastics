const https = require('https');
const slugs = ['salsa', 'sizzler', 'sandra', 'scoop', 'sushi', 'spice', 'party'];
const BASE = 'https://mangochairs.com';

function fetch(slug) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 20000);
    https.get(`${BASE}/product/${slug}`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => { clearTimeout(timer); resolve(data); });
      res.on('error', (e) => { clearTimeout(timer); reject(e); });
    }).on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}

async function main() {
  for (const slug of slugs) {
    try {
      const html = await fetch(slug);
      const imgs = html.match(/\/media\/product_variant\/[^"\\]+\.(png|jpg|jpeg|webp)/g) || [];
      const unique = [...new Set(imgs)];
      console.log(`${slug}: ${unique.length} images`);
    } catch (e) {
      console.log(`${slug}: ERROR - ${e.message}`);
    }
  }
}
main();
