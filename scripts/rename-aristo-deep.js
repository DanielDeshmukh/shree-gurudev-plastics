const https = require('https');
const fs = require('fs');
const path = require('path');

const NIM_API_KEY = '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';
const NIM_MODEL = 'meta/llama-3.2-11b-vision-instruct';
const NIM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const ARISTO_DIR = path.join(__dirname, '..', 'aristo-images');
const LOG_FILE = path.join(ARISTO_DIR, 'rename-deep.log');
const DELAY_MS = 1500;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function callVisionAPI(base64Image) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('API timeout')), 30000);
    const body = JSON.stringify({
      model: NIM_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            {
              type: 'text',
              text: 'Identify the single most dominant plastic product in this image and its color. If multiple products, pick the one that takes the most space. Reply ONLY in this exact format, nothing else:\nproduct_name, color\n\nExamples:\nflexi bowl, blue\ndustbin, red\nchair, black\nstorage container, white\n\nDo not add any extra text, explanation, or punctuation.'
            }
          ]
        }
      ],
      max_tokens: 60,
      temperature: 0.1
    });

    const url = new URL(NIM_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NIM_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        clearTimeout(timer);
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices[0]) {
            resolve(parsed.choices[0].message.content.trim());
          } else if (parsed.error) {
            reject(new Error(`API error: ${parsed.error.message || JSON.stringify(parsed.error)}`));
          } else {
            reject(new Error('No response from API'));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    req.on('error', (e) => { clearTimeout(timer); reject(e); });
    req.write(body);
    req.end();
  });
}

function sanitize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_').substring(0, 60);
}

function getUniqueFilename(dir, baseName, ext) {
  let candidate = `${baseName}${ext}`;
  let counter = 2;
  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${baseName}_${counter}${ext}`;
    counter++;
  }
  return candidate;
}

function getAllDirs(dir) {
  let dirs = [dir];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      dirs = dirs.concat(getAllDirs(full));
    }
  }
  return dirs;
}

async function main() {
  fs.writeFileSync(LOG_FILE, '');
  log('=== ARISTO DEEP RENAME START ===');

  const allDirs = getAllDirs(ARISTO_DIR);
  let totalRenamed = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  const subDirProducts = {};

  for (const dir of allDirs) {
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    if (files.length === 0) continue;

    const relDir = path.relative(ARISTO_DIR, dir);
    log(`\n--- ${relDir}: ${files.length} images ---`);
    subDirProducts[relDir] = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file);
      const filepath = path.join(dir, file);

      if (/^[a-z]+_[a-z]/.test(path.basename(file, ext))) {
        totalSkipped++;
        log(`  [${i + 1}/${files.length}] SKIP ${file} (already renamed)`);
        continue;
      }

      try {
        const imgBuffer = fs.readFileSync(filepath);
        if (imgBuffer.length < 1000) {
          totalSkipped++;
          log(`  [${i + 1}/${files.length}] SKIP ${file} (too small: ${imgBuffer.length} bytes)`);
          continue;
        }
        const base64 = imgBuffer.toString('base64');

        const response = await callVisionAPI(base64);
        const parts = response.split(',').map(s => s.trim().toLowerCase());
        let productName = sanitize(parts[0] || 'unknown');
        let color = sanitize(parts[1] || 'various');

        if (productName === 'unknown' || productName.length < 2) {
          productName = sanitize(path.basename(file, ext));
        }

        const newName = `${color}_${productName}`;
        const newFilename = getUniqueFilename(dir, newName, ext);
        const newPath = path.join(dir, newFilename);

        fs.renameSync(filepath, newPath);
        totalRenamed++;

        if (!subDirProducts[relDir][productName]) subDirProducts[relDir][productName] = 0;
        subDirProducts[relDir][productName]++;

        log(`  [${i + 1}/${files.length}] ${file} -> ${newFilename}  ("${response}")`);

      } catch (e) {
        totalFailed++;
        log(`  [${i + 1}/${files.length}] ERR ${file}: ${e.message}`);
      }

      await sleep(DELAY_MS);
    }
  }

  log(`\n=== DONE === Renamed: ${totalRenamed}, Skipped: ${totalSkipped}, Failed: ${totalFailed}`);

  log('\n=== SUBDIRECTORY RENAME PLAN ===');
  for (const [dir, products] of Object.entries(subDirProducts)) {
    if (Object.keys(products).length === 0) continue;
    const sorted = Object.entries(products).sort((a, b) => b[1] - a[1]);
    const top3 = sorted.slice(0, 3).map(([n, c]) => `${n}(${c})`).join(', ');
    log(`  ${dir} [dominant: ${top3}]`);
  }
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
