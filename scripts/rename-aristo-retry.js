const https = require('https');
const fs = require('fs');
const path = require('path');

const NIM_API_KEY = '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';
const NIM_MODEL = 'meta/llama-3.2-11b-vision-instruct';
const NIM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const ARISTO_DIR = path.join(__dirname, '..', 'aristo-images');
const LOG_FILE = path.join(ARISTO_DIR, 'rename-retry.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const FAILED_FILES = [
  'furniture/cabinets/img_2.jpg',
  'furniture/drawers/img_2.jpg',
  'furniture/drawers/img_3.jpg',
  'houseware/storage-containers/img_8.jpg',
  'houseware/storage-containers/img_9.jpg',
  'houseware/twist-o-lock/img_5.jpg',
  'houseware/twist-o-lock/img_6.jpg',
];

function callVisionAPI(base64Image) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('API timeout')), 45000);
    const body = JSON.stringify({
      model: NIM_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            {
              type: 'text',
              text: 'Identify the single most dominant plastic product in this image and its color. If multiple products, pick the one that takes the most space. Reply ONLY in this exact format, nothing else:\nproduct_name, color\n\nDo not add any extra text, explanation, or punctuation.'
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

async function main() {
  fs.writeFileSync(LOG_FILE, '');
  log('=== ARISTO RENAME RETRY START ===');
  log(`Retrying ${FAILED_FILES.length} failed files`);

  let renamed = 0;
  let failed = 0;

  for (let i = 0; i < FAILED_FILES.length; i++) {
    const relPath = FAILED_FILES[i];
    const filepath = path.join(ARISTO_DIR, relPath);
    const dir = path.dirname(filepath);
    const ext = path.extname(filepath);
    const file = path.basename(filepath);

    log(`\n[${i + 1}/${FAILED_FILES.length}] ${relPath}`);

    if (!fs.existsSync(filepath)) {
      log(`  FILE NOT FOUND - skipping`);
      failed++;
      continue;
    }

    try {
      const imgBuffer = fs.readFileSync(filepath);
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
      renamed++;
      log(`  RENAMED -> ${newFilename}  ("${response}")`);
    } catch (e) {
      failed++;
      log(`  ERR: ${e.message}`);
    }

    await sleep(3000);
  }

  log(`\n=== DONE === Renamed: ${renamed}, Failed: ${failed}`);
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
