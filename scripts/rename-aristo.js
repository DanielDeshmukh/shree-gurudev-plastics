const https = require('https');
const fs = require('fs');
const path = require('path');

const NIM_API_KEY = process.env.NIM_API_KEY;
const NIM_MODEL = 'meta/llama-3.2-11b-vision-instruct';
const NIM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const ARISTO_DIR = path.join(__dirname, '..', 'aristo-images');
const LOG_FILE = path.join(ARISTO_DIR, 'rename.log');
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
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            },
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
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .substring(0, 60);
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

async function main() {
  fs.writeFileSync(LOG_FILE, '');
  log('=== ARISTO RENAME START ===');

  const categories = fs.readdirSync(ARISTO_DIR).filter(d => {
    const full = path.join(ARISTO_DIR, d);
    return fs.statSync(full).isDirectory() && !d.startsWith('.');
  });

  log(`Categories: ${categories.join(', ')}`);

  let totalRenamed = 0;
  let totalFailed = 0;
  const categoryProductCounts = {};

  for (const cat of categories) {
    const catDir = path.join(ARISTO_DIR, cat);
    const files = fs.readdirSync(catDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

    log(`\n--- ${cat}: ${files.length} images ---`);
    categoryProductCounts[cat] = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file);
      const filepath = path.join(catDir, file);

      try {
        const imgBuffer = fs.readFileSync(filepath);
        if (imgBuffer.length < 1000) {
          log(`  SKIP ${file} (too small: ${imgBuffer.length} bytes)`);
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
        const newFilename = getUniqueFilename(catDir, newName, ext);
        const newPath = path.join(catDir, newFilename);

        fs.renameSync(filepath, newPath);
        totalRenamed++;

        if (!categoryProductCounts[cat][productName]) categoryProductCounts[cat][productName] = 0;
        categoryProductCounts[cat][productName]++;

        log(`  [${i + 1}/${files.length}] ${file} -> ${newFilename}  ("${response}")`);

      } catch (e) {
        totalFailed++;
        log(`  [${i + 1}/${files.length}] ERR ${file}: ${e.message}`);
      }

      await sleep(DELAY_MS);
    }
  }

  log(`\n=== FILE RENAME DONE === Renamed: ${totalRenamed}, Failed: ${totalFailed}`);

  log('\n=== DIRECTORY RENAME PLAN ===');
  for (const [cat, products] of Object.entries(categoryProductCounts)) {
    const sorted = Object.entries(products).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 3).map(([name, count]) => `${name}(${count})`).join(', ');
    const dominant = sorted[0] ? sorted[0][0] : cat;
    const newCatName = sanitize(dominant);
    log(`  ${cat} -> ${newCatName} [dominant: ${top}]`);
  }

  log('\n=== DONE ===');
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
