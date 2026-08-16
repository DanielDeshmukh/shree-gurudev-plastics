const https = require('https');
const fs = require('fs');
const path = require('path');

const MANGO_COLORS = [
  { name: 'Red', code: 'RED', filename: 'red' },
  { name: 'Mango Yellow', code: 'MY', filename: 'mango_yellow' },
  { name: 'Orange', code: 'ORG', filename: 'orange' },
  { name: 'Citrus Green', code: 'CG', filename: 'citrus_green' },
  { name: 'Mist Blue', code: 'MB', filename: 'mist_blue' },
  { name: 'Black', code: 'BLK', filename: 'black' },
  { name: 'Dark Grey', code: 'DG', filename: 'dark_grey' },
  { name: 'Milky White', code: 'MW', filename: 'milky_white' },
  { name: 'Brick Red', code: 'BRD', filename: 'brick_red' },
  { name: 'Rattan Dark Beige', code: 'RDB', filename: 'rattan_dark_beige' },
  { name: 'Sandal Yellow', code: 'SY', filename: 'sandal_yellow' },
  { name: 'Olive Green', code: 'OG', filename: 'olive_green' },
  { name: 'Light Peach', code: 'LP', filename: 'light_peach' },
  { name: 'Dark Blue', code: 'DB', filename: 'dark_blue' },
  { name: 'Blue', code: 'BL', filename: 'blue' },
  { name: 'Globus Brown', code: 'GB', filename: 'globus_brown' },
  { name: 'Cherry', code: 'CHR', filename: 'cherry' },
  { name: 'Sandal Wood', code: 'SW', filename: 'sandal_wood' },
  { name: 'Teak Wood', code: 'TW', filename: 'teak_wood' },
  { name: 'Marble Beige', code: 'MBG', filename: 'marble_beige' },
  { name: 'Pink', code: 'PNK', filename: 'pink' },
  { name: 'Purple', code: 'PRPL', filename: 'purple' },
  { name: 'New Blue', code: 'NBL', filename: 'new_blue' },
  { name: 'Eagle Brown', code: 'EB', filename: 'eagle_brown' },
  { name: 'Weather Brown', code: 'WB', filename: 'weather_brown' },
  { name: 'Neo Blue', code: 'NB', filename: 'neo_blue' },
  { name: 'Flask Maroon', code: 'FM', filename: 'flask_maroon' },
  { name: 'Green', code: 'GRN', filename: 'green' },
  { name: 'Ivory', code: 'IVR', filename: 'ivory' },
  { name: 'Marble Gray', code: 'MGR', filename: 'marble_gray' },
  { name: 'Plaza Top', code: 'PT', filename: 'plaza_top' },
  { name: 'Forest Green', code: 'FG', filename: 'forest_green' },
  { name: 'Navy Blue', code: 'NVB', filename: 'navy_blue' },
  { name: 'Marina Blue', code: 'MBL', filename: 'marina_blue' },
  { name: 'Rose Red', code: 'RR', filename: 'rose_red' },
  { name: 'Dark Peach', code: 'DP', filename: 'dark_peach' },
  { name: 'Siesta Brown', code: 'SB', filename: 'siesta_brown' },
  { name: 'Neo Yellow', code: 'NY', filename: 'neo_yellow' },
  { name: 'Lush Green', code: 'LG', filename: 'lush_green' },
  { name: 'Gold', code: 'GLD', filename: 'gold' },
];

const COLOR_LIST = MANGO_COLORS.map(c => `${c.code}=${c.name}`).join(', ');
const NIM_KEY = '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';
const NIM_MODEL = 'meta/llama-3.2-11b-vision-instruct';

function callNim(imageBase64) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: NIM_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Identify the primary product color. Reply ONLY with JSON, no other text.\nValid colors: ' + COLOR_LIST + '\nJSON: {"code":"BLK"}' },
          { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageBase64 } }
        ]
      }],
      max_tokens: 50,
      temperature: 0.0
    });
    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + NIM_KEY, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data).choices[0].message.content); } catch(e) { reject(new Error('parse')); } });
    });
    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const BASE = path.join(__dirname, '..', 'mango-images');
const CATEGORIES = ['horeca-chairs', 'armless-chairs'];

(async () => {
  console.log('=== SCRIPT 1: horeca-chairs + armless-chairs ===');
  console.log('Key: nvapi-oir1...2D2mE8\n');

  let renamed = 0, failed = 0, skipped = 0;

  for (const cat of CATEGORIES) {
    const catDir = path.join(BASE, cat);
    if (!fs.existsSync(catDir)) continue;
    const products = fs.readdirSync(catDir).filter(d => fs.statSync(path.join(catDir, d)).isDirectory());
    console.log('\n=== ' + cat + ' (' + products.length + ' products) ===');

    for (const slug of products) {
      const prodDir = path.join(catDir, slug);
      const allFiles = fs.readdirSync(prodDir).filter(f => /\.(jpg|png)$/i.test(f));
      const generic = allFiles.filter(f => /^img\d+\.(png|jpg)$/i.test(f));

      if (generic.length === 0) {
        console.log('  ' + slug + ': SKIP (' + allFiles.length + ' done)');
        skipped += allFiles.length;
        continue;
      }

      console.log('  ' + slug + ': ' + generic.length + ' to rename');

      for (let i = 0; i < generic.length; i++) {
        const oldName = generic[i];
        const ext = oldName.match(/\.(\w+)$/)[1];
        const oldPath = path.join(prodDir, oldName);

        if (!fs.existsSync(oldPath)) { skipped++; continue; }

        const buf = fs.readFileSync(oldPath);
        if (buf.length < 1000) { console.log('    [' + (i+1) + '/' + generic.length + '] SKIP ' + oldName + ' (small)'); skipped++; continue; }

        let ok = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const result = await callNim(buf.toString('base64'));
            const m = result.match(/\{[^}]+\}/);
            if (!m) throw new Error('no json');
            const code = (JSON.parse(m[0]).code || '').toUpperCase();
            const color = MANGO_COLORS.find(c => c.code === code);
            if (!color) throw new Error('unknown: ' + code);

            let newName = slug + '_' + color.filename + '.' + ext;
            let newPath = path.join(prodDir, newName);
            if (fs.existsSync(newPath)) {
              let n = 2;
              while (fs.existsSync(path.join(prodDir, slug + '_' + color.filename + '_' + n + '.' + ext))) n++;
              newPath = path.join(prodDir, slug + '_' + color.filename + '_' + n + '.' + ext);
            }
            if (!fs.existsSync(oldPath)) { skipped++; ok = true; break; }
            fs.renameSync(oldPath, newPath);
            console.log('    [' + (i+1) + '/' + generic.length + '] ' + oldName + ' -> ' + path.basename(newPath) + ' (' + color.name + ')');
            renamed++;
            ok = true;
            break;
          } catch (e) {
            if (attempt < 3) await sleep(3000);
            else { console.log('    [' + (i+1) + '/' + generic.length + '] FAIL ' + oldName + ' (' + e.message + ')'); failed++; }
          }
        }
        if (i < generic.length - 1) await sleep(2500);
      }
    }
  }

  console.log('\n=== DONE === Renamed: ' + renamed + ', Failed: ' + failed + ', Skipped: ' + skipped);
})();
