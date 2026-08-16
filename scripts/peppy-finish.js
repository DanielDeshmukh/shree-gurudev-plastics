const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

const dir = path.join(__dirname, '..', 'mango-images', 'premium-chairs', 'peppy');

// The 18 images found in RSC data, we have 15 (img1-img15)
// Missing are the last 3: img16, img17, img18
const remaining = [
  { fn: 'Adobe_Express_-_file_7_GuNATwF.png', idx: 16 },
  { fn: '391_rHZgAom.png', idx: 17 },
  { fn: 'Adobe_Express_-_file_34.png', idx: 18 }
];

// Actually let me check what we have and what's missing
const existing = fs.readdirSync(dir);
console.log('Current files in peppy:', existing.length);
existing.forEach(f => {
  const s = fs.statSync(path.join(dir, f));
  console.log('  ' + f + ' (' + (s.size / 1024).toFixed(0) + 'KB)');
});

// The 18 filenames from RSC in order
const all18 = [
  'Adobe_Express_-_file_xqGk8ur.png',
  'Adobe_Express_-_file_1_BZWUcZ5.png',
  'Adobe_Express_-_file_4_arRmvME.png',
  'Adobe_Express_-_file_2_4zIRc6b.png',
  'Adobe_Express_-_file_3_P2mRCpC.png',
  '333_C0cswNQ.png',
  'Adobe_Express_-_file_34.png',
  'Adobe_Express_-_file_35.png',
  'Adobe_Express_-_file_37.png',
  'Adobe_Express_-_file_36.png',
  '402_EurjSh9.png',
  '341_jx9TVj7.png',
  '380_kTOcFeE.png',
  '344_pQlQ7oL.png',
  '7678_ujKghhY.png',
  '7130_1VpIwLq.png',
  'Adobe_Express_-_file_7_GuNATwF.png',
  '391_rHZgAom.png'
];

(async () => {
  for (let i = 0; i < all18.length; i++) {
    const fn = all18[i];
    const dest = path.join(dir, 'img' + (i + 1) + '.png');
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
      console.log('[' + (i+1) + '/18] SKIP  img' + (i+1) + '.png');
      continue;
    }
    const url = 'https://mcpbe.mangochairs.com/media/product_variant/' + fn;
    process.stdout.write('[' + (i+1) + '/18] GET   ' + fn + ' -> img' + (i+1) + '.png ... ');
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      console.log('OK (' + (size / 1024).toFixed(0) + 'KB)');
    } catch (e) {
      console.log('FAIL (' + e.message + ')');
    }
    await sleep(2000);
  }

  const final = fs.readdirSync(dir).filter(f => /\.(png|jpg)$/i.test(f));
  console.log('');
  console.log('FINAL: ' + final.length + ' files on disk');
})();
