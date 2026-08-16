const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mcpbe.mangochairs.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'mango-images');
const LOG_FILE = path.join(OUTPUT_DIR, 'scrape.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

const PRODUCT_SLUGS = [
  'bella','testa','maple','vanilla','venice','milan','paris','honey','ginger','olive','sugar','nivan',
  'nova','nirali','nixon','neo','amazing','mint','melody','majestic','magic','miracle','style','sigma',
  'symphony','savanna','sahara','storm','martini','meloni','taqilla','tiffany','conwood','carnival',
  'lipstick','stanly','irani','cocktail','salsa','sizzler','sandra','scoop','sushi','spice','party',
  'buffet','party-fruit','party-juice','buffet-fruit','buffet-juice','safari','sapphire','sapphire-pine',
  'sapphire-flora','saffron','chit-chat','oreoz','tokyo','sydney','santosa','swizz','seoni','fazo',
  'solo','benzo','audio','super','star','sun','shine','diva','opera','remo','mezzo','mango-9021',
  'mango-9022','mango-9023','mango-9024','mango-9025','silk','satin','silver','mango-1003','mango-1004',
  'mango-1005','mango-1006','ace','ventura','monty','nawab','sultan','wazir','prince','king','cube-18',
  'nepolean','striker','cube-14','anchor','champion','alpha','salt','pepper','insta','i-con','oscar',
  'kremlin','gem','sikandar','sunday','murfi','tango','tik-tok','topass','rocky','cube-10','mango-1008',
  'mango-1009','mango-1010','mango-1060','mango-1061','mango-1062','mango-1063','mango-1064','spark-smal',
  'spark-big','spencer-small','spencer-big','checkmate-devine-small','checkmate-devine-big','checkmate',
  'checkmate-decor-big','checkmate-delight-big','checkmate-delight-big-1','shagun','bidai','sangeet',
  'shahnai','charlie','shalimar','bistro','shangrilla','summer','blossom','snow','spring','power','pride',
  'prestige','pedal-bin','abcd','santa','chimpu','little-heart','genius','panda','pony','peppy','smiley',
  'maggy','marina','store-it-drawer-4','big-shoe-rack','big-multi-purpose-rack','kinder','small-shoe-rack',
  'small-multi-purpose-rack'
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 15000);
    const fullUrl = url.startsWith('http') ? url : `https://mangochairs.com${url}`;
    https.get(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
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

  // Extract variants with colour + images
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

  // Fallback: grab all variant images without color mapping
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
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(LOG_FILE, '');

  log('=== MANGO SCRAPE START ===');
  log(`Total products: ${PRODUCT_SLUGS.length}`);

  const allProducts = [];
  let totalDownloaded = 0;
  let skipped = 0;
  let failed = [];

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  for (let i = 0; i < PRODUCT_SLUGS.length; i++) {
    const slug = PRODUCT_SLUGS[i];
    const idx = i + 1;
    try {
      const html = await fetchPage(`https://mangochairs.com/product/${slug}`);
      const product = extractProductData(html, slug);
      const dir = path.join(OUTPUT_DIR, product.category, slug);

      // Check if already fully downloaded
      if (fs.existsSync(dir)) {
        const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
        if (existing.length >= product.variants.length && product.variants.length > 0) {
          skipped++;
          log(`[${idx}/${PRODUCT_SLUGS.length}] SKIP: ${slug} (all ${product.variants.length} variants exist)`);
          await sleep(500);
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
        await sleep(200);
      }

      totalDownloaded += downloaded;
      allProducts.push({ ...product, downloadedCount: downloaded });
      log(`[${idx}/${PRODUCT_SLUGS.length}] ${product.category}/${slug}: +${downloaded} images (${product.name}) [total variants: ${product.variants.length}]`);
    } catch (e) {
      failed.push(slug);
      log(`[${idx}/${PRODUCT_SLUGS.length}] ERR: ${slug} - ${e.message}`);
    }
    await sleep(1500);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(allProducts, null, 2));
  log(`=== DONE === Downloaded: ${totalDownloaded}, Skipped: ${skipped}, Failed: ${failed.length}, Products: ${allProducts.length}`);
  if (failed.length > 0) log(`Failed slugs: ${JSON.stringify(failed)}`);
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
