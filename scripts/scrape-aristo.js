const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.aristoplast.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'aristo-images');
const LOG_FILE = path.join(OUTPUT_DIR, 'scrape.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// All category page URLs from the nav
const CATEGORY_URLS = [
  { url: '/products/houseware/5', cat: 'houseware' },
  { url: '/products/air-tight-containers/8?pid=5', cat: 'houseware/air-tight-containers' },
  { url: '/products/lock--fresh/9?pid=5', cat: 'houseware/lock-fresh' },
  { url: '/products/easy-lock/10?pid=5', cat: 'houseware/easy-lock' },
  { url: '/products/twist-o-lock--neo-fresh/11?pid=5', cat: 'houseware/twist-o-lock' },
  { url: '/products/breeza/50?pid=5', cat: 'houseware/breeza' },
  { url: '/products/baskets--bowls/14?pid=5', cat: 'houseware/baskets-bowls' },
  { url: '/products/bath-mates/19?pid=5', cat: 'houseware/bath-mates' },
  { url: '/products/bath-tubs-drums--laundry-baskets/20?pid=5', cat: 'houseware/bath-tubs' },
  { url: '/products/coffee-mugs/16?pid=5', cat: 'houseware/coffee-mugs' },
  { url: '/products/dinner-set/6?pid=5', cat: 'houseware/dinner-set' },
  { url: '/products/dual-colour-products/7?pid=5', cat: 'houseware/dual-colour' },
  { url: '/products/jugs--serving-trays/15?pid=5', cat: 'houseware/jugs-trays' },
  { url: '/products/miscellanceous-items/18?pid=5', cat: 'houseware/misc' },
  { url: '/products/multipurpose-rack/4?pid=5', cat: 'houseware/rack' },
  { url: '/products/planters/23?pid=5', cat: 'houseware/planters' },
  { url: '/products/school-items/17?pid=5', cat: 'houseware/school' },
  { url: '/products/shopping-baskets/13?pid=5', cat: 'houseware/shopping-baskets' },
  { url: '/products/sprayers/21?pid=5', cat: 'houseware/sprayers' },
  { url: '/products/storage-bucket/22?pid=5', cat: 'houseware/storage-bucket' },
  { url: '/products/storage-containers/12?pid=5', cat: 'houseware/storage-containers' },
  { url: '/products/bins/24?pid=5', cat: 'houseware/bins' },
  { url: '/products/dustbins/52', cat: 'dustbins' },
  { url: '/products/waste-bin/28?pid=52', cat: 'dustbins/waste-bin' },
  { url: '/products/swing-bins/27?pid=52', cat: 'dustbins/swing-bins' },
  { url: '/products/insulated-ware/29', cat: 'insulated-ware' },
  { url: '/products/ice-box/30?pid=29', cat: 'insulated-ware/ice-box' },
  { url: '/products/cleaning-products/25', cat: 'cleaning' },
  { url: '/products/spin-bucket/47?pid=25', cat: 'cleaning/spin-bucket' },
  { url: '/products/toilet-brushes/26?pid=25', cat: 'cleaning/toilet-brushes' },
  { url: '/products/furniture/1', cat: 'furniture' },
  { url: '/products/cabinets/2?pid=1', cat: 'furniture/cabinets' },
  { url: '/products/multi-purpose-drawers/3?pid=1', cat: 'furniture/drawers' },
  { url: '/products/multipurpose-rack/4?pid=1', cat: 'furniture/rack' },
  { url: '/products/material-handling-crates/31', cat: 'crates' },
  { url: '/products/300200-series-crates/33?pid=31', cat: 'crates/300-200' },
  { url: '/products/400300-series-crates/34?pid=31', cat: 'crates/400-300' },
  { url: '/products/500325-series-crates/35?pid=31', cat: 'crates/500-325' },
  { url: '/products/600400-series-crates/36?pid=31', cat: 'crates/600-400' },
  { url: '/products/crate-baskets/40?pid=31', cat: 'crates/baskets' },
  { url: '/products/crate-dairy/43?pid=31', cat: 'crates/dairy' },
  { url: '/products/crate-f--v-produce/38?pid=31', cat: 'crates/fv-produce' },
  { url: '/products/crate-fabricated/45?pid=31', cat: 'crates/fabricated' },
  { url: '/products/crate-general/39?pid=31', cat: 'crates/general' },
  { url: '/products/mini-jumbo-jumbo-maha-jumbo--super-jumbo-series/37?pid=31', cat: 'crates/jumbo' },
  { url: '/products/crate-fpo-storage-bins/41?pid=31', cat: 'crates/fpo' },
  { url: '/products/trolley-and-stand/44?pid=31', cat: 'crates/trolley' },
  { url: '/products/pallet/46?pid=31', cat: 'crates/pallet' },
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 15000);
    const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
    https.get(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'identity'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        clearTimeout(timer);
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { clearTimeout(timer); return reject(new Error(`HTTP ${res.statusCode}`)); }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => { clearTimeout(timer); resolve(data); });
      res.on('error', (e) => { clearTimeout(timer); reject(e); });
    }).on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 30000);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        clearTimeout(timer);
        return downloadFile(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { clearTimeout(timer); return reject(new Error(`HTTP ${res.statusCode}`)); }
      const stream = fs.createWriteStream(filepath);
      res.pipe(stream);
      stream.on('finish', () => { clearTimeout(timer); stream.close(); resolve(); });
      stream.on('error', (e) => { clearTimeout(timer); reject(e); });
    }).on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}

function extractProductsFromCategory(html) {
  const products = [];
  // Product links: /product/slug/ID  or /product/slug
  const linkPattern = /href="(?:https?:\/\/(?:www\.)?aristoplast\.com)?\/product\/([^"\/]+)(?:\/[^"]*)?"/g;
  let m;
  const seen = new Set();
  while ((m = linkPattern.exec(html)) !== null) {
    const slug = m[1];
    if (!seen.has(slug) && slug !== 'undefined') {
      seen.add(slug);
      products.push(slug);
    }
  }
  return products;
}

function extractImagesFromCategory(html) {
  const images = [];
  // Product images: /admin/img/product/NNN/HASH.jpg
  const imgPattern = /src="(?:https?:\/\/(?:www\.)?aristoplast\.com)?\/admin\/img\/product\/(\d+\/[^"]+)"/g;
  let m;
  while ((m = imgPattern.exec(html)) !== null) {
    const imgUrl = BASE_URL + '/admin/img/product/' + m[1];
    if (!images.includes(imgUrl)) images.push(imgUrl);
  }
  return images;
}

function extractProductName(html, slug) {
  // Try h1 tag
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  if (h1) return h1[1].trim();
  // Try og:title
  const og = html.match(/property="og:title"\s+content="([^"]+)"/);
  if (og) return og[1].trim();
  return slug;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(LOG_FILE, '');

  log('=== ARISTO SCRAPE START ===');
  log(`Scraping ${CATEGORY_URLS.length} categories...`);

  let totalDownloaded = 0;
  const allProducts = [];
  const BATCH = 5;

  for (let i = 0; i < CATEGORY_URLS.length; i += BATCH) {
    const batch = CATEGORY_URLS.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async ({ url, cat }) => {
      try {
        const html = await fetchPage(url);
        const productSlugs = extractProductsFromCategory(html);
        const categoryImages = extractImagesFromCategory(html);
        return { cat, productSlugs, categoryImages, error: null };
      } catch (e) {
        return { cat, productSlugs: [], categoryImages: [], error: e.message };
      }
    }));

    for (const r of results) {
      const idx = i + results.indexOf(r) + 1;
      if (r.error) {
        log(`[${idx}/${CATEGORY_URLS.length}] ERR: ${r.cat} - ${r.error}`);
      } else {
        log(`[${idx}/${CATEGORY_URLS.length}] ${r.cat}: ${r.productSlugs.length} products, ${r.categoryImages.length} images`);

        // Download category images
        if (r.categoryImages.length > 0) {
          const dir = path.join(OUTPUT_DIR, r.cat);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

          for (let j = 0; j < r.categoryImages.length; j++) {
            const imgUrl = r.categoryImages[j];
            const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
            const filename = `img_${j + 1}${ext}`;
            const filepath = path.join(dir, filename);
            if (fs.existsSync(filepath)) continue;
            try {
              await downloadFile(imgUrl, filepath);
              totalDownloaded++;
            } catch (e) {
              log(`  ERR download: ${filename} - ${e.message}`);
            }
          }
        }
      }
    }
  }

  log(`=== DONE === Downloaded: ${totalDownloaded} images`);
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
