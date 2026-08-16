const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 60000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = new URL(url).origin + loc;
        return fetch(loc).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 90000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = new URL(url).origin + loc;
        return download(loc, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(); });
      ws.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const BASE_DIR = path.join(__dirname, '..', 'mango-images', 'premium-chairs');

const SLUGS = [
  'checkmate',
  'peppy'
];

async function processSlug(slug) {
  const dir = path.join(BASE_DIR, slug);
  const productPage = `https://mangochairs.com/product/${slug}`;

  console.log('');
  console.log('='.repeat(60));
  console.log('PRODUCT: ' + slug);
  console.log('PAGE: ' + productPage);
  console.log('='.repeat(60));

  // Fetch product page
  console.log('[1] Fetching product page...');
  let html;
  try {
    html = await fetch(productPage);
    console.log('    OK - ' + (html.length / 1024).toFixed(0) + 'KB HTML');
  } catch (e) {
    console.log('    FAIL - ' + e.message);
    return;
  }

  // Extract all image URLs from the HTML
  // Pattern 1: mcpbe.mangochairs.com/media/product_variant/... in string literals
  const urlPattern = /mcpbe\.mangochairs\.com[\\/]+media[\\/]+product_variant[\\/]+([^\s"'<>\\]+)/g;
  const imageUrls = new Map();
  let match;
  while ((match = urlPattern.exec(html)) !== null) {
    const raw = match[0];
    const filename = match[1];
    const cleanUrl = 'https://mcpbe.mangochairs.com/media/product_variant/' + filename;
    if (!imageUrls.has(filename)) {
      imageUrls.set(filename, cleanUrl);
    }
  }

  console.log('[2] Found ' + imageUrls.size + ' unique image filenames in HTML:');
  for (const [fn, url] of imageUrls) {
    console.log('    - ' + fn);
  }

  // Also check the product API for base images
  console.log('[3] Checking product API for base images...');
  try {
    const apiUrl = `https://mcpbe.mangochairs.com/frontend/products/?search=${slug}&page=1&page_size=10`;
    const apiData = JSON.parse(await fetch(apiUrl));
    const product = apiData.products.find(p => p.slug === slug);
    if (product) {
      console.log('    API name: ' + product.name);
      console.log('    API category: ' + product.category_name + ' (id=' + product.category_id + ')');
      console.log('    API has_variant: ' + product.has_variant);
      console.log('    API images: ' + product.images.length);
      for (const img of product.images) {
        const fullUrl = 'https://mcpbe.mangochairs.com' + img;
        const fn = img.split('/').pop();
        if (!imageUrls.has(fn)) {
          imageUrls.set(fn, fullUrl);
          console.log('    + NEW from API: ' + fn);
        }
      }
    }
  } catch (e) {
    console.log('    API error: ' + e.message);
  }

  console.log('[4] Total unique images to download: ' + imageUrls.size);

  // Ensure directory exists
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Check what we already have
  const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
  console.log('[5] Already on disk: ' + existing.length + ' files');
  for (const f of existing) {
    const size = fs.statSync(path.join(dir, f)).size;
    console.log('    - ' + f + ' (' + (size / 1024).toFixed(0) + 'KB)');
  }

  // Download each image
  console.log('');
  console.log('[6] Starting downloads...');
  const entries = [...imageUrls.values()];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const url = entries[i];
    const ext = url.endsWith('.jpg') ? '.jpg' : '.png';
    const filename = 'img' + (i + 1) + ext;
    const dest = path.join(dir, filename);

    // Skip if already exists with content
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
      console.log('    [' + (i + 1) + '/' + entries.length + '] SKIP  ' + filename + ' (already exists, ' + (fs.statSync(dest).size / 1024).toFixed(0) + 'KB)');
      skipped++;
      continue;
    }

    process.stdout.write('    [' + (i + 1) + '/' + entries.length + '] GET   ' + filename + ' <- ' + url.split('/').pop() + ' ... ');
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      console.log('OK (' + (size / 1024).toFixed(0) + 'KB)');
      downloaded++;
    } catch (e) {
      console.log('FAIL (' + e.message + ')');
      failed++;
    }
    if (i < entries.length - 1) await sleep(1500);
  }

  // Final count
  const finalFiles = fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
  console.log('');
  console.log('RESULT for ' + slug + ':');
  console.log('  New downloads: ' + downloaded);
  console.log('  Skipped: ' + skipped);
  console.log('  Failed: ' + failed);
  console.log('  Total files on disk: ' + finalFiles.length);
}

(async () => {
  console.log('MANGO FINAL RETRY - checkmate & peppy');
  console.log('Time: ' + new Date().toISOString());
  console.log('');

  for (const slug of SLUGS) {
    try {
      await processSlug(slug);
    } catch (e) {
      console.log('FATAL ERROR for ' + slug + ': ' + e.message);
    }
    await sleep(3000);
  }

  console.log('');
  console.log('=== ALL DONE ===');
})();
