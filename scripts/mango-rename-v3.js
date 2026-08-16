const https = require('https');
const fs = require('fs');
const path = require('path');

const MANGO_COLORS = [
  { code: 'RED', name: 'Red', filename: 'red' },
  { code: 'MY', name: 'Mango Yellow', filename: 'mango_yellow' },
  { code: 'ORG', name: 'Orange', filename: 'orange' },
  { code: 'CG', name: 'Citrus Green', filename: 'citrus_green' },
  { code: 'MB', name: 'Mist Blue', filename: 'mist_blue' },
  { code: 'BLK', name: 'Black', filename: 'black' },
  { code: 'DG', name: 'Dark Grey', filename: 'dark_grey' },
  { code: 'MW', name: 'Milky White', filename: 'milky_white' },
  { code: 'BRD', name: 'Brick Red', filename: 'brick_red' },
  { code: 'RDB', name: 'Rattan Dark Beige', filename: 'rattan_dark_beige' },
  { code: 'SY', name: 'Sandal Yellow', filename: 'sandal_yellow' },
  { code: 'OG', name: 'Olive Green', filename: 'olive_green' },
  { code: 'LP', name: 'Light Peach', filename: 'light_peach' },
  { code: 'DB', name: 'Dark Blue', filename: 'dark_blue' },
  { code: 'BL', name: 'Blue', filename: 'blue' },
  { code: 'GB', name: 'Globus Brown', filename: 'globus_brown' },
  { code: 'CHR', name: 'Cherry', filename: 'cherry' },
  { code: 'SW', name: 'Sandal Wood', filename: 'sandal_wood' },
  { code: 'TW', name: 'Teak Wood', filename: 'teak_wood' },
  { code: 'MBG', name: 'Marble Beige', filename: 'marble_beige' },
  { code: 'PNK', name: 'Pink', filename: 'pink' },
  { code: 'PRPL', name: 'Purple', filename: 'purple' },
  { code: 'NBL', name: 'New Blue', filename: 'new_blue' },
  { code: 'EB', name: 'Eagle Brown', filename: 'eagle_brown' },
  { code: 'WB', name: 'Weather Brown', filename: 'weather_brown' },
  { code: 'NB', name: 'Neo Blue', filename: 'neo_blue' },
  { code: 'FM', name: 'Flask Maroon', filename: 'flask_maroon' },
  { code: 'GRN', name: 'Green', filename: 'green' },
  { code: 'IVR', name: 'Ivory', filename: 'ivory' },
  { code: 'MGR', name: 'Marble Gray', filename: 'marble_gray' },
  { code: 'PT', name: 'Plaza Top', filename: 'plaza_top' },
  { code: 'FG', name: 'Forest Green', filename: 'forest_green' },
  { code: 'NVB', name: 'Navy Blue', filename: 'navy_blue' },
  { code: 'MBL', name: 'Marina Blue', filename: 'marina_blue' },
  { code: 'RR', name: 'Rose Red', filename: 'rose_red' },
  { code: 'DP', name: 'Dark Peach', filename: 'dark_peach' },
  { code: 'SB', name: 'Siesta Brown', filename: 'siesta_brown' },
  { code: 'NY', name: 'Neo Yellow', filename: 'neo_yellow' },
  { code: 'LG', name: 'Lush Green', filename: 'lush_green' },
  { code: 'GLD', name: 'Gold', filename: 'gold' },
];

const VALID_CODES = new Set(MANGO_COLORS.map(c => c.code));
const CODE_TO_COLOR = {};
MANGO_COLORS.forEach(c => { CODE_TO_COLOR[c.code] = c; });

// Key 3 - fresh
const NIM_KEY = process.argv[2] || 'process.env.NIM_API_KEY';
const NIM_MODEL = 'meta/llama-3.2-11b-vision-instruct';

const VALID_CODES_STR = MANGO_COLORS.map(c => c.code).join(', ');
const PROMPT = `Look at this image of a plastic chair/furniture. Identify its PRIMARY color.

You MUST reply with exactly ONE of these color codes: ${VALID_CODES_STR}

Reply with ONLY a JSON object like: {"code":"RED"}

Do NOT output anything else. Only the JSON.`;

function callNimVision(imageBase64) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: NIM_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
        ]
      }],
      max_tokens: 50,
      temperature: 0.0
    });
    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NIM_KEY}`, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) { reject(new Error(parsed.error.message || 'API error')); return; }
          resolve(parsed.choices[0].message.content);
        } catch(e) { reject(new Error('parse: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseColorCode(response) {
  const jsonMatch = response.match(/\{[^}]+\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    let code = (parsed.code || '').toUpperCase().trim();
    // Common mistakes the model makes
    if (code === 'BROWN') code = 'GB'; // Globus Brown
    if (code === 'GREY' || code === 'GRAY') code = 'DG'; // Dark Grey
    if (code === 'WHITE') code = 'MW'; // Milky White
    if (code === 'YELLOW') code = 'MY'; // Mango Yellow
    if (code === 'WOOD') code = 'SW'; // Sandal Wood
    if (code === 'BEIGE') code = 'MBG'; // Marble Beige
    if (code === 'MAROON') code = 'FM'; // Flask Maroon
    if (code === 'RED' || code === 'RR' || code === 'CHR' || code === 'BRD' || code === 'FM') {
      // These are all valid, keep as is
    }
    if (VALID_CODES.has(code)) return CODE_TO_COLOR[code];
    return null;
  } catch(e) { return null; }
}

const BASE = path.join(__dirname, '..', 'mango-images');

// Products to rename - ALL remaining generic files
function findRemainingProducts() {
  const results = [];
  const catDirs = fs.readdirSync(BASE).filter(d => fs.statSync(path.join(BASE, d)).isDirectory());
  for (const cat of catDirs) {
    const catDir = path.join(BASE, cat);
    const prods = fs.readdirSync(catDir).filter(d => fs.statSync(path.join(catDir, d)).isDirectory());
    for (const prod of prods) {
      const prodDir = path.join(catDir, prod);
      const generic = fs.readdirSync(prodDir).filter(f => /^img\d+\.(png|jpg|jpeg)$/i.test(f));
      if (generic.length > 0) {
        results.push({ category: cat, slug: prod, dir: prodDir, files: generic });
      }
    }
  }
  return results;
}

(async () => {
  const logFile = path.join(BASE, 'rename-v3.log');
  const log = (msg) => { console.log(msg); fs.appendFileSync(logFile, msg + '\n'); };
  fs.writeFileSync(logFile, 'MANGO COLOR RENAMER v3\nStarted: ' + new Date().toISOString() + '\nKey: ' + NIM_KEY.slice(0, 12) + '...\n\n');

  const products = findRemainingProducts();
  const totalFiles = products.reduce((s, p) => s + p.files.length, 0);
  log(`Found ${products.length} products with ${totalFiles} generic files`);
  console.log(`\nFound ${products.length} products with ${totalFiles} generic files\n`);

  let totalRenamed = 0, totalFailed = 0;
  let callCount = 0;
  const RATE_LIMIT_MS = 800; // 800ms between calls

  for (const prod of products) {
    log(`\n=== ${prod.category}/${prod.slug} (${prod.files.length} files) ===`);

    for (let i = 0; i < prod.files.length; i++) {
      const oldName = prod.files[i];
      const ext = oldName.match(/\.(\w+)$/)[1];
      const oldPath = path.join(prod.dir, oldName);

      if (!fs.existsSync(oldPath)) {
        console.log(`  [${i+1}/${prod.files.length}] SKIP ${oldName} (gone)`);
        continue;
      }

      const imgBuf = fs.readFileSync(oldPath);
      if (imgBuf.length < 1000) {
        console.log(`  [${i+1}/${prod.files.length}] SKIP ${oldName} (${imgBuf.length}B too small)`);
        continue;
      }

      // Rate limit
      if (callCount > 0) await sleep(RATE_LIMIT_MS);

      let success = false;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          callCount++;
          const result = await callNimVision(imgBuf.toString('base64'));
          const color = parseColorCode(result);

          if (!color) {
            const rawCode = (result.match(/"code"\s*:\s*"([^"]+)"/) || [])[1] || '?';
            if (attempt < 5) {
              await sleep(1000 * attempt);
              continue;
            }
            throw new Error(`invalid code: ${rawCode} from: ${result.slice(0, 100)}`);
          }

          const newName = `${prod.slug}_${color.filename}.${ext}`;
          let finalPath = path.join(prod.dir, newName);

          if (fs.existsSync(finalPath)) {
            let n = 2;
            while (fs.existsSync(path.join(prod.dir, `${prod.slug}_${color.filename}_${n}.${ext}`))) n++;
            finalPath = path.join(prod.dir, `${prod.slug}_${color.filename}_${n}.${ext}`);
          }

          if (!fs.existsSync(oldPath)) { continue; }

          fs.renameSync(oldPath, finalPath);
          const finalName = path.basename(finalPath);
          console.log(`  [${i+1}/${prod.files.length}] ${oldName} -> ${finalName} (${color.name})`);
          log(`  ${oldName} -> ${finalName} (${color.name})`);
          totalRenamed++;
          success = true;
          break;
        } catch (e) {
          if (attempt >= 5) {
            console.log(`  [${i+1}/${prod.files.length}] FAILED ${oldName} (${e.message})`);
            log(`  FAILED ${oldName}: ${e.message}`);
            totalFailed++;
          } else {
            await sleep(1000 * attempt);
          }
        }
      }
    }
  }

  console.log(`\n=== DONE === Renamed: ${totalRenamed}, Failed: ${totalFailed}`);
  log(`\n=== DONE === Renamed: ${totalRenamed}, Failed: ${totalFailed}`);
  log(`Finished: ${new Date().toISOString()}`);
})();
