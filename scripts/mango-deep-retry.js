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

async function processSlug(slug) {
  const dir = path.join(BASE_DIR, slug);
  const productPage = `https://mangochairs.com/product/${slug}`;

  console.log('');
  console.log('='.repeat(60));
  console.log('PRODUCT: ' + slug);
  console.log('='.repeat(60));

  // Step 1: Fetch product page
  console.log('[STEP 1] Fetching product page...');
  let html;
  try {
    html = await fetch(productPage);
    console.log('  Got ' + (html.length / 1024).toFixed(0) + 'KB');
  } catch (e) {
    console.log('  FAIL: ' + e.message);
    return;
  }

  // Step 2: Extract RSC data - look for image URLs in the encoded payload
  console.log('[STEP 2] Extracting RSC data...');

  // Find all RSC script chunks
  const rscChunks = [];
  const rscRegex = /self\.__next_f\.push\(\[1,"(.+?)"\]\)/gs;
  let m;
  while ((m = rscRegex.exec(html)) !== null) {
    rscChunks.push(m[1]);
  }
  console.log('  Found ' + rscChunks.length + ' RSC chunks');

  // Combine and unescape RSC data
  const allRsc = rscChunks.join('');

  // Find all media/product_variant URLs in RSC data
  const mediaPattern = /media[\\/]+product_variant[\\/]+([^\s"'<>\\]+)/g;
  const rscImages = new Map();
  while ((m = mediaPattern.exec(allRsc)) !== null) {
    const fn = m[1];
    if (!rscImages.has(fn)) {
      rscImages.set(fn, 'https://mcpbe.mangochairs.com/media/product_variant/' + fn);
    }
  }

  // Also search for colour data to understand variants
  const colourPattern = /colour[\\"]*?:[\\"]*?([A-Za-z\s]+?)[\\"]/g;
  const colours = [];
  while ((m = colourPattern.exec(allRsc)) !== null) {
    const c = m[1].trim();
    if (c && !colours.includes(c) && c.length < 30) colours.push(c);
  }

  console.log('  RSC images found: ' + rscImages.size);
  for (const [fn, url] of rscImages) {
    console.log('    - ' + fn);
  }
  console.log('  Colour variants found: ' + colours.length);
  if (colours.length > 0) console.log('    ' + colours.join(', '));

  // Step 3: Fetch API for base images
  console.log('[STEP 3] Fetching API data...');
  let apiImages = [];
  try {
    const apiUrl = `https://mcpbe.mangochairs.com/frontend/products/?search=${slug}&page=1&page_size=10`;
    const apiData = JSON.parse(await fetch(apiUrl));
    const product = apiData.products.find(p => p.slug === slug);
    if (product) {
      console.log('  Product: ' + product.name);
      console.log('  Category: ' + product.category_name + ' (id=' + product.category_id + ')');
      console.log('  Variants: ' + (product.has_variant ? 'YES' : 'NO'));
      console.log('  API images: ' + product.images.length);
      for (const img of product.images) {
        const fn = img.split('/').pop();
        const fullUrl = 'https://mcpbe.mangochairs.com' + img;
        apiImages.push({ fn, url: fullUrl });
        console.log('    - ' + fn);
      }
    }
  } catch (e) {
    console.log('  API error: ' + e.message);
  }

  // Step 4: Merge all unique images
  console.log('[STEP 4] Merging image lists...');
  const allImages = new Map();
  for (const { fn, url } of apiImages) {
    allImages.set(fn, url);
  }
  for (const [fn, url] of rscImages) {
    if (!allImages.has(fn)) allImages.set(fn, url);
  }

  console.log('  Total unique images: ' + allImages.size);

  // Step 5: Check existing files
  console.log('[STEP 5] Checking existing files...');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const existing = fs.readdirSync(dir).filter(f => /\.(png|jpg)$/i.test(f));
  console.log('  On disk: ' + existing.length + ' files');

  // Step 6: Download
  console.log('[STEP 6] Downloading...');
  const entries = [...allImages.entries()];
  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const [fn, url] = entries[i];
    const destFilename = 'img' + (i + 1) + (fn.endsWith('.jpg') ? '.jpg' : '.png');
    const dest = path.join(dir, destFilename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
      console.log('  [' + (i + 1) + '/' + entries.length + '] SKIP  ' + destFilename + ' (' + (fs.statSync(dest).size / 1024).toFixed(0) + 'KB)');
      continue;
    }

    process.stdout.write('  [' + (i + 1) + '/' + entries.length + '] GET   ' + fn + ' -> ' + destFilename + ' ... ');
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      console.log('OK (' + (size / 1024).toFixed(0) + 'KB)');
      downloaded++;
    } catch (e) {
      console.log('FAIL (' + e.message + ')');
      failed++;
    }
    if (i < entries.length - 1) await sleep(2000);
  }

  const finalCount = fs.readdirSync(dir).filter(f => /\.(png|jpg)$/i.test(f)).length;
  console.log('');
  console.log('RESULT: +' + downloaded + ' new, ' + failed + ' failed, ' + finalCount + ' total on disk');
}

(async () => {
  console.log('MANGO DEEP RETRY');
  console.log('Time: ' + new Date().toISOString());

  for (const slug of ['checkmate', 'peppy']) {
    try {
      await processSlug(slug);
    } catch (e) {
      console.log('FATAL: ' + e.message);
    }
    await sleep(3000);
  }

  console.log('');
  console.log('=== COMPLETE ===');
})();
