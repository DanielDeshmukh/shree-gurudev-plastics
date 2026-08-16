const https = require('https');
const fs = require('fs');
const path = require('path');

const MANGO_COLORS = [
  { name: 'Red', code: 'RED', hex: '#E31E24', filename: 'red' },
  { name: 'Mango Yellow', code: 'MY', hex: '#FFC72C', filename: 'mango_yellow' },
  { name: 'Orange', code: 'ORG', hex: '#FF6B2B', filename: 'orange' },
  { name: 'Citrus Green', code: 'CG', hex: '#C8D834', filename: 'citrus_green' },
  { name: 'Mist Blue', code: 'MB', hex: '#7BA4C7', filename: 'mist_blue' },
  { name: 'Black', code: 'BLK', hex: '#1A1A1A', filename: 'black' },
  { name: 'Dark Grey', code: 'DG', hex: '#4A4A4A', filename: 'dark_grey' },
  { name: 'Milky White', code: 'MW', hex: '#F0EDE5', filename: 'milky_white' },
  { name: 'Brick Red', code: 'BRD', hex: '#8B3A2F', filename: 'brick_red' },
  { name: 'Rattan Dark Beige', code: 'RDB', hex: '#8B6F47', filename: 'rattan_dark_beige' },
  { name: 'Sandal Yellow', code: 'SY', hex: '#C9A96E', filename: 'sandal_yellow' },
  { name: 'Olive Green', code: 'OG', hex: '#5B7553', filename: 'olive_green' },
  { name: 'Light Peach', code: 'LP', hex: '#F5C8A8', filename: 'light_peach' },
  { name: 'Dark Blue', code: 'DB', hex: '#1A3A6B', filename: 'dark_blue' },
  { name: 'Blue', code: 'BL', hex: '#2E6DC7', filename: 'blue' },
  { name: 'Globus Brown', code: 'GB', hex: '#6B4226', filename: 'globus_brown' },
  { name: 'Cherry', code: 'CHR', hex: '#C41E3A', filename: 'cherry' },
  { name: 'Sandal Wood', code: 'SW', hex: '#B8860B', filename: 'sandal_wood' },
  { name: 'Teak Wood', code: 'TW', hex: '#8B5E3C', filename: 'teak_wood' },
  { name: 'Marble Beige', code: 'MBG', hex: '#D4C4A8', filename: 'marble_beige' },
  { name: 'Pink', code: 'PNK', hex: '#E75480', filename: 'pink' },
  { name: 'Purple', code: 'PRPL', hex: '#6B2D8B', filename: 'purple' },
  { name: 'New Blue', code: 'NBL', hex: '#1E90FF', filename: 'new_blue' },
  { name: 'Eagle Brown', code: 'EB', hex: '#5C4033', filename: 'eagle_brown' },
  { name: 'Weather Brown', code: 'WB', hex: '#7B5B3A', filename: 'weather_brown' },
  { name: 'Neo Blue', code: 'NB', hex: '#00A3E0', filename: 'neo_blue' },
  { name: 'Flask Maroon', code: 'FM', hex: '#7B2D42', filename: 'flask_maroon' },
  { name: 'Green', code: 'GRN', hex: '#2E8B57', filename: 'green' },
  { name: 'Ivory', code: 'IVR', hex: '#FFFFF0', filename: 'ivory' },
  { name: 'Marble Gray', code: 'MGR', hex: '#B8B8B0', filename: 'marble_gray' },
  { name: 'Plaza Top', code: 'PT', hex: '#C4A882', filename: 'plaza_top' },
  { name: 'Forest Green', code: 'FG', hex: '#228B22', filename: 'forest_green' },
  { name: 'Navy Blue', code: 'NVB', hex: '#000080', filename: 'navy_blue' },
  { name: 'Marina Blue', code: 'MBL', hex: '#0077C8', filename: 'marina_blue' },
  { name: 'Rose Red', code: 'RR', hex: '#C21E56', filename: 'rose_red' },
  { name: 'Dark Peach', code: 'DP', hex: '#D4845A', filename: 'dark_peach' },
  { name: 'Siesta Brown', code: 'SB', hex: '#6B4423', filename: 'siesta_brown' },
  { name: 'Neo Yellow', code: 'NY', hex: '#FFD000', filename: 'neo_yellow' },
  { name: 'Lush Green', code: 'LG', hex: '#2DB84D', filename: 'lush_green' },
  { name: 'Gold', code: 'GLD', hex: '#DAA520', filename: 'gold' },
];

const COLOR_LIST = MANGO_COLORS.map(c => `${c.code}=${c.name}`).join(', ');
const NIM_KEY = 'process.env.NIM_API_KEY';
const NIM_MODEL = 'meta/llama-3.2-11b-vision-instruct';

function callNimVision(imageBase64) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: NIM_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `Identify the primary product color. Reply ONLY with JSON, no other text.\nValid colors: ${COLOR_LIST}\nJSON: {"code":"BLK"}` },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
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

(async () => {
  console.log('MANGO REMAINING RENAMER');
  console.log('Scanning for generic img{N} files...\n');

  // Scan all categories for remaining generic files
  const tasks = [];
  const catDirs = fs.readdirSync(BASE).filter(d => fs.statSync(path.join(BASE, d)).isDirectory());
  for (const cat of catDirs) {
    const catDir = path.join(BASE, cat);
    const products = fs.readdirSync(catDir).filter(d => fs.statSync(path.join(catDir, d)).isDirectory());
    for (const slug of products) {
      const prodDir = path.join(catDir, slug);
      const files = fs.readdirSync(prodDir).filter(f => /^img\d+\.(png|jpg)$/i.test(f));
      for (const f of files) {
        tasks.push({ cat, slug, file: f, fullPath: path.join(prodDir, f) });
      }
    }
  }

  console.log(`Found ${tasks.length} generic files to rename\n`);

  let renamed = 0, failed = 0, skipped = 0;

  for (let i = 0; i < tasks.length; i++) {
    const { cat, slug, file, fullPath } = tasks[i];
    const ext = file.match(/\.(\w+)$/)[1];

    if (!fs.existsSync(fullPath)) {
      console.log(`[${i+1}/${tasks.length}] SKIP  ${cat}/${slug}/${file} (gone)`);
      skipped++;
      continue;
    }

    const imgBuf = fs.readFileSync(fullPath);
    if (imgBuf.length < 1000) {
      console.log(`[${i+1}/${tasks.length}] SKIP  ${cat}/${slug}/${file} (${imgBuf.length}B)`);
      skipped++;
      continue;
    }

    const imgBase64 = imgBuf.toString('base64');
    let success = false;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await callNimVision(imgBase64);
        const jsonMatch = result.match(/\{[^}]+\}/);
        if (!jsonMatch) throw new Error('no JSON');

        const parsed = JSON.parse(jsonMatch[0]);
        const code = (parsed.code || '').toUpperCase();
        const colorObj = MANGO_COLORS.find(c => c.code === code);
        if (!colorObj) throw new Error('unknown: ' + code);

        const newName = `${slug}_${colorObj.filename}.${ext}`;
        let finalPath = path.join(path.dirname(fullPath), newName);

        if (fs.existsSync(finalPath)) {
          let n = 2;
          while (fs.existsSync(path.join(path.dirname(fullPath), `${slug}_${colorObj.filename}_${n}.${ext}`))) n++;
          finalPath = path.join(path.dirname(fullPath), `${slug}_${colorObj.filename}_${n}.${ext}`);
        }

        if (!fs.existsSync(fullPath)) { skipped++; success = true; break; }

        fs.renameSync(fullPath, finalPath);
        console.log(`[${i+1}/${tasks.length}] RENAMED  ${cat}/${slug}/${file} -> ${path.basename(finalPath)}  (${colorObj.name})`);
        renamed++;
        success = true;
        break;
      } catch (e) {
        if (attempt < 3) await sleep(3000);
        else {
          console.log(`[${i+1}/${tasks.length}] FAILED  ${cat}/${slug}/${file} (${e.message})`);
          failed++;
        }
      }
    }

    if (i < tasks.length - 1) await sleep(2500);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Renamed: ${renamed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
})();
