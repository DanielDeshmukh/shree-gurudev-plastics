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

const NIM_KEY = process.env.NIM_API_KEY;
const NIM_MODEL = 'meta/llama-3.2-11b-vision-instruct';

function getColorPrompt() {
  const colorList = MANGO_COLORS.map(c => `- ${c.name} (${c.code}): hex ${c.hex}`).join('\n');
  return `You are analyzing a plastic chair/furniture product image. Your task is to identify the PRIMARY color of the product.

Here are the official Mango Chairs color definitions you MUST use:

${colorList}

Analyze the image and determine the PRIMARY color of the product (not background). Match it to the CLOSEST color from the list above.

Reply with ONLY a JSON object:
{"color": "Color Name", "code": "CODE", "confidence": 0.95}

If no color matches well, use the closest one. Do NOT invent new colors.`;
}

function callNimVision(imageBase64, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: NIM_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      }],
      max_tokens: 200,
      temperature: 0.1
    });
    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NIM_KEY}`, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data).choices[0].message.content); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const BASE = path.join(__dirname, '..', 'mango-images');

// 5 test products across different categories
const TESTS = [
  { slug: 'carnival', category: 'horeca-chairs', file: 'img1.png' },
  { slug: 'monty', category: 'stools', file: 'img1.png' },
  { slug: 'peppy', category: 'baby-chairs', file: 'img1.png' },
  { slug: 'marina', category: 'household', file: 'img1.png' },
  { slug: 'bistro', category: 'armless-chairs', file: 'img1.png' },
];

(async () => {
  console.log('MANGO COLOR RENAME - TEST (5 images)\n');

  for (const t of TESTS) {
    const oldPath = path.join(BASE, t.category, t.slug, t.file);
    if (!fs.existsSync(oldPath)) { console.log(`SKIP: ${t.slug}/${t.file} not found`); continue; }

    const imgBuf = fs.readFileSync(oldPath);
    const imgBase64 = imgBuf.toString('base64');
    console.log(`--- ${t.slug}/${t.file} (${(imgBuf.length/1024).toFixed(0)}KB) ---`);

    try {
      const result = await callNimVision(imgBase64, getColorPrompt());
      const jsonMatch = result.match(/\{[^}]+\}/);
      if (!jsonMatch) { console.log('FAIL: no JSON'); continue; }

      const parsed = JSON.parse(jsonMatch[0]);
      const colorObj = MANGO_COLORS.find(c => c.code === parsed.code);
      if (!colorObj) { console.log('FAIL: unknown code ' + parsed.code); continue; }

      const ext = t.file.match(/\.(\w+)$/)[1];
      const newName = `${t.slug}_${colorObj.filename}.${ext}`;
      const newPath = path.join(BASE, t.category, t.slug, newName);

      fs.renameSync(oldPath, newPath);
      console.log(`RENAMED: ${t.file} -> ${newName} (${colorObj.name}, conf: ${parsed.confidence})`);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
    await sleep(2000);
  }

  // Show results
  console.log('\n=== VERIFYING RESULTS ===\n');
  for (const t of TESTS) {
    const dir = path.join(BASE, t.category, t.slug);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|png)$/i.test(f)).sort();
    console.log(`${t.slug}/ (${files.length} images):`);
    files.forEach(f => console.log(`  ${f}`));
    console.log('');
  }
})();
