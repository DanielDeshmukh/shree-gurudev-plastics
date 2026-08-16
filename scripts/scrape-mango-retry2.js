const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mcpbe.mangochairs.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'mango-images');
const LOG_FILE = path.join(OUTPUT_DIR, 'scrape-retry2.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const RETRY_SLUGS = [
  'sapphire-pine','sydney','santosa','cube-14',
  'spencer-small','spencer-big','checkmate-devine-big','checkmate',
  'checkmate-decor-big','checkmate-delight-big-1','peppy'
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 30000);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
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

function extractProductData(html, slug) {
  let name = slug;
  let category = 'other';
  let variants = [];

  const titleMatch = html.match(/"children":"(Buy |Shop )?([^"]+?)(\s*\|\s*Mango.*)?"/);
  if (titleMatch) name = titleMatch[2].trim();

  const catMap = [
    [/Premuim|Premium/i, 'premium-chairs'], [/Medium/i, 'medium-chairs'],
    [/Economical|Economy/i, 'economical-chairs'], [/Armless/i, 'armless-chairs'],
    [/Baby/i, 'baby-chairs'], [/Cafe|Restaurant|HORECA/i, 'cafe-chairs'],
    [/Table/i, 'tables'], [/Stool/i, 'stools'], [/Cabinet/i, 'cabinets'],
    [/Dustbin/i, 'dustbins'], [/Household/i, 'household']
  ];
  for (const [re, cat] of catMap) {
    if (re.test(html)) { category = cat; break; }
  }

  const variantPattern = /\\"id\\":(\d+),\\"specification\\":\{\\"colour\\":\\"([^\\]+)\\".*?\\"images\\":\[([^\]]*)\]/g;
  let m;
  while ((m = variantPattern.exec(html)) !== null) {
    const color = m[2];
    const imgUrls = [];
    const imgUrlPattern = /\\"([^\\"]+)\\"/g;
    let imgMatch;
    while ((imgMatch = imgUrlPattern.exec(m[3])) !== null) {
      const url = imgMatch[1].startsWith('http') ? imgMatch[1] : BASE_URL + imgMatch[1];
      imgUrls.push(url);
    }
    if (imgUrls.length > 0) variants.push({ color, imageUrl: imgUrls[0] });
  }

  if (variants.length === 0) {
    const imgPattern = /\/media\/product_variant\/[^"\\]+\.(?:png|jpg|jpeg|webp)/g;
    const seen = new Set();
    while ((m = imgPattern.exec(html)) !== null) {
      const url = BASE_URL + m[0];
      if (!seen.has(url)) { seen.add(url); variants.push({ color: '', imageUrl: url }); }
    }
  }

  return { slug, name, category, variants };
}

function getVariantFilename(variant, index) {
  if (variant.color) {
    return variant.color.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '.png';
  }
  return `img${index + 1}.png`;
}

async function main() {
  fs.writeFileSync(LOG_FILE, '');
  log('=== MANGO RETRY 2 START ===');
  log(`Retrying ${RETRY_SLUGS.length} slugs with 30s timeout`);

  let totalDownloaded = 0;
  let stillFailed = [];

  for (let i = 0; i < RETRY_SLUGS.length; i++) {
    const slug = RETRY_SLUGS[i];
    const idx = i + 1;

    try {
      const html = await fetchPage(`https://mangochairs.com/product/${slug}`);
      const product = extractProductData(html, slug);
      const dir = path.join(OUTPUT_DIR, product.category, slug);

      if (fs.existsSync(dir)) {
        const existing = fs.readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
        if (existing.length >= product.variants.length && product.variants.length > 0) {
          log(`[${idx}/${RETRY_SLUGS.length}] SKIP: ${slug} (all ${product.variants.length} exist)`);
          await sleep(1500);
          continue;
        }
      }

      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      let downloaded = 0;
      for (let j = 0; j < product.variants.length; j++) {
        const variant = product.variants[j];
        const filename = getVariantFilename(variant, j);
        const filepath = path.join(dir, filename);
        if (fs.existsSync(filepath)) continue;
        await downloadFile(variant.imageUrl, filepath);
        downloaded++;
        await sleep(500);
      }

      totalDownloaded += downloaded;
      log(`[${idx}/${RETRY_SLUGS.length}] ${product.category}/${slug}: +${downloaded} images (${product.name}) [variants: ${product.variants.length}]`);
    } catch (e) {
      stillFailed.push(slug);
      log(`[${idx}/${RETRY_SLUGS.length}] ERR: ${slug} - ${e.message}`);
    }

    await sleep(3000);
  }

  log(`\n=== DONE === Downloaded: ${totalDownloaded}, Still Failed: ${stillFailed.length}`);
  if (stillFailed.length > 0) log(`Still failed: ${JSON.stringify(stillFailed)}`);
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
