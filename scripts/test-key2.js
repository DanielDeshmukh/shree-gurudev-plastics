const https = require('https');
const fs = require('fs');
const path = require('path');

const NIM_KEY = 'process.env.NIM_API_KEY';

// Test with known colorful images
const tests = [
  { name: 'carnival', file: 'carnival_citrus_green.png', cat: 'horeca-chairs' },
  { name: 'bella', file: 'red.png', cat: 'premium-chairs' },
];

const MANGO_COLORS = [
  { code: 'RED', name: 'Red' }, { code: 'MY', name: 'Mango Yellow' },
  { code: 'ORG', name: 'Orange' }, { code: 'CG', name: 'Citrus Green' },
  { code: 'MB', name: 'Mist Blue' }, { code: 'BLK', name: 'Black' },
  { code: 'DG', name: 'Dark Grey' }, { code: 'MW', name: 'Milky White' },
  { code: 'BRD', name: 'Brick Red' }, { code: 'RDB', name: 'Rattan Dark Beige' },
  { code: 'PNK', name: 'Pink' }, { code: 'PRPL', name: 'Purple' },
  { code: 'BL', name: 'Blue' }, { code: 'CHR', name: 'Cherry' },
  { code: 'SW', name: 'Sandal Wood' }, { code: 'WB', name: 'Weather Brown' },
  { code: 'GRN', name: 'Green' }, { code: 'GB', name: 'Globus Brown' },
];

async function test(name, imgPath) {
  const img = fs.readFileSync(imgPath);
  console.log('\n' + name + ' (' + (img.length/1024).toFixed(0) + 'KB)');

  const body = JSON.stringify({
    model: 'meta/llama-3.2-11b-vision-instruct',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Identify the primary color of this plastic chair. You MUST reply with exactly one of these codes: ' + MANGO_COLORS.map(c => c.code).join(',') + '. Reply ONLY JSON: {"code":"CODE"}' },
        { type: 'image_url', image_url: { url: 'data:image/png;base64,' + img.toString('base64') } }
      ]
    }],
    max_tokens: 50, temperature: 0.0
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + NIM_KEY, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const content = JSON.parse(data).choices[0].message.content;
          const code = JSON.parse(content.match(/\{[^}]+\}/)[0]).code;
          const match = MANGO_COLORS.find(c => c.code === code);
          console.log('  Raw: ' + content);
          console.log('  Code: ' + code + ' -> ' + (match ? match.name : 'UNKNOWN'));
        } catch(e) { console.log('  Error: ' + e.message + ' | ' + data.slice(0,200)); }
        resolve();
      });
    });
    req.on('error', e => { console.log('  Error: ' + e.message); resolve(); });
    req.setTimeout(30000, () => { req.destroy(); console.log('  TIMEOUT'); resolve(); });
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const t of tests) {
    const p = path.join(__dirname, '..', 'mango-images', t.cat, t.name, t.file);
    if (fs.existsSync(p)) await test(t.name + '/' + t.file, p);
    else console.log('SKIP: ' + p + ' not found');
  }
})();
