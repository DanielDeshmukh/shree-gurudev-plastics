const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const MANGO_COLORS = [
  { name: 'Red', filename: 'red', hex: [227, 30, 36] },
  { name: 'Mango Yellow', filename: 'mango_yellow', hex: [255, 199, 44] },
  { name: 'Orange', filename: 'orange', hex: [255, 107, 43] },
  { name: 'Citrus Green', filename: 'citrus_green', hex: [200, 216, 52] },
  { name: 'Mist Blue', filename: 'mist_blue', hex: [123, 164, 199] },
  { name: 'Black', filename: 'black', hex: [26, 26, 26] },
  { name: 'Dark Grey', filename: 'dark_grey', hex: [74, 74, 74] },
  { name: 'Milky White', filename: 'milky_white', hex: [240, 237, 229] },
  { name: 'Brick Red', filename: 'brick_red', hex: [139, 58, 47] },
  { name: 'Rattan Dark Beige', filename: 'rattan_dark_beige', hex: [139, 111, 71] },
  { name: 'Sandal Yellow', filename: 'sandal_yellow', hex: [201, 169, 110] },
  { name: 'Olive Green', filename: 'olive_green', hex: [91, 117, 83] },
  { name: 'Light Peach', filename: 'light_peach', hex: [245, 200, 168] },
  { name: 'Dark Blue', filename: 'dark_blue', hex: [26, 58, 107] },
  { name: 'Blue', filename: 'blue', hex: [46, 109, 199] },
  { name: 'Globus Brown', filename: 'globus_brown', hex: [107, 66, 38] },
  { name: 'Cherry', filename: 'cherry', hex: [196, 30, 58] },
  { name: 'Sandal Wood', filename: 'sandal_wood', hex: [184, 134, 11] },
  { name: 'Teak Wood', filename: 'teak_wood', hex: [139, 94, 60] },
  { name: 'Marble Beige', filename: 'marble_beige', hex: [212, 196, 168] },
  { name: 'Pink', filename: 'pink', hex: [231, 84, 128] },
  { name: 'Purple', filename: 'purple', hex: [107, 45, 139] },
  { name: 'New Blue', filename: 'new_blue', hex: [30, 144, 255] },
  { name: 'Eagle Brown', filename: 'eagle_brown', hex: [92, 64, 51] },
  { name: 'Weather Brown', filename: 'weather_brown', hex: [123, 91, 58] },
  { name: 'Neo Blue', filename: 'neo_blue', hex: [0, 163, 224] },
  { name: 'Flask Maroon', filename: 'flask_maroon', hex: [123, 45, 66] },
  { name: 'Green', filename: 'green', hex: [46, 139, 87] },
  { name: 'Ivory', filename: 'ivory', hex: [255, 255, 240] },
  { name: 'Marble Gray', filename: 'marble_gray', hex: [184, 184, 176] },
  { name: 'Plaza Top', filename: 'plaza_top', hex: [196, 168, 130] },
  { name: 'Forest Green', filename: 'forest_green', hex: [34, 139, 34] },
  { name: 'Navy Blue', filename: 'navy_blue', hex: [0, 0, 128] },
  { name: 'Marina Blue', filename: 'marina_blue', hex: [0, 119, 200] },
  { name: 'Rose Red', filename: 'rose_red', hex: [194, 30, 86] },
  { name: 'Dark Peach', filename: 'dark_peach', hex: [212, 132, 90] },
  { name: 'Siesta Brown', filename: 'siesta_brown', hex: [107, 68, 35] },
  { name: 'Neo Yellow', filename: 'neo_yellow', hex: [255, 208, 0] },
  { name: 'Lush Green', filename: 'lush_green', hex: [45, 184, 77] },
  { name: 'Gold', filename: 'gold', hex: [218, 165, 32] },
];

function colorDist(c1, c2) {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
}

function findClosest(r, g, b) {
  let best = null, bestD = Infinity;
  for (const c of MANGO_COLORS) {
    const d = colorDist([r, g, b], c.hex);
    if (d < bestD) { bestD = d; best = c; }
  }
  return { color: best, distance: bestD };
}

async function getDominantColor(imgPath) {
  try {
    // Resize to 30x30, crop center, get raw pixel data
    const { data, info } = await sharp(imgPath)
      .resize(30, 30, { fit: 'cover', position: 'centre' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Sample center region (skip 5px border = ~17%)
    const margin = 5;
    const w = info.width;
    const rVals = [], gVals = [], bVals = [];

    for (let y = margin; y < w - margin; y++) {
      for (let x = margin; x < w - margin; x++) {
        const idx = (y * w + x) * 3;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const brightness = (r + g + b) / 3;
        // Skip near-white and near-black (background)
        if (brightness > 25 && brightness < 235) {
          rVals.push(r);
          gVals.push(g);
          bVals.push(b);
        }
      }
    }

    if (rVals.length < 5) {
      // Fallback: use all pixels
      for (let y = 0; y < w; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 3;
          rVals.push(data[idx]);
          gVals.push(data[idx + 1]);
          bVals.push(data[idx + 2]);
        }
      }
    }

    // Median
    rVals.sort((a, b) => a - b);
    gVals.sort((a, b) => a - b);
    bVals.sort((a, b) => a - b);
    const mid = Math.floor(rVals.length / 2);

    return { r: rVals[mid], g: gVals[mid], b: bVals[mid] };
  } catch(e) {
    return null;
  }
}

const BASE = path.join(__dirname, '..', 'mango-images');

function findRemaining() {
  const results = [];
  const cats = fs.readdirSync(BASE).filter(d => fs.statSync(path.join(BASE, d)).isDirectory());
  for (const cat of cats) {
    const prods = fs.readdirSync(path.join(BASE, cat)).filter(d => fs.statSync(path.join(BASE, cat, d)).isDirectory());
    for (const prod of prods) {
      const dir = path.join(BASE, cat, prod);
      const generic = fs.readdirSync(dir).filter(f => /^img\d+\.(png|jpg|jpeg)$/i.test(f));
      if (generic.length > 0) results.push({ category: cat, slug: prod, dir, files: generic });
    }
  }
  return results;
}

(async () => {
  const logFile = path.join(BASE, 'rename-pixel.log');
  const log = (msg) => { console.log(msg); fs.appendFileSync(logFile, msg + '\n'); };
  fs.writeFileSync(logFile, 'PIXEL COLOR RENAMER v1\nStarted: ' + new Date().toISOString() + '\n\n');

  const products = findRemaining();
  const totalFiles = products.reduce((s, p) => s + p.files.length, 0);
  console.log(`Found ${products.length} products with ${totalFiles} files\n`);
  log(`Found ${products.length} products with ${totalFiles} files`);

  let totalRenamed = 0, totalFailed = 0;

  for (const prod of products) {
    log(`\n=== ${prod.category}/${prod.slug} (${prod.files.length}) ===`);

    for (let i = 0; i < prod.files.length; i++) {
      const oldName = prod.files[i];
      const ext = oldName.match(/\.(\w+)$/)[1];
      const oldPath = path.join(prod.dir, oldName);

      if (!fs.existsSync(oldPath)) continue;

      const pixel = await getDominantColor(oldPath);
      if (!pixel) {
        console.log(`  [${i+1}/${prod.files.length}] FAILED ${oldName}`);
        totalFailed++;
        continue;
      }

      const { color, distance } = findClosest(pixel.r, pixel.g, pixel.b);

      const newName = `${prod.slug}_${color.filename}.${ext}`;
      let finalPath = path.join(prod.dir, newName);

      if (fs.existsSync(finalPath)) {
        let n = 2;
        while (fs.existsSync(path.join(prod.dir, `${prod.slug}_${color.filename}_${n}.${ext}`))) n++;
        finalPath = path.join(prod.dir, `${prod.slug}_${color.filename}_${n}.${ext}`);
      }

      fs.renameSync(oldPath, finalPath);
      const finalName = path.basename(finalPath);
      const distStr = distance.toFixed(0);
      const confTag = distance > 80 ? ' LOW' : '';
      console.log(`  [${i+1}/${prod.files.length}] ${oldName} -> ${finalName} (${color.name} d=${distStr}${confTag})`);
      log(`  ${oldName} -> ${finalName} (${color.name} d=${distStr})`);
      totalRenamed++;
    }
  }

  console.log(`\n=== DONE === Renamed: ${totalRenamed}, Failed: ${totalFailed}`);
  log(`\n=== DONE === Renamed: ${totalRenamed}, Failed: ${totalFailed}`);
  log(`Finished: ${new Date().toISOString()}`);
})();
