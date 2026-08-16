const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

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
  { name: 'Light Peach', filename: 'light_peach', hex: [245, 200, 168] },
];

function colorDist(c1, c2) {
  return Math.sqrt(Math.pow(c1[0]-c2[0],2) + Math.pow(c1[1]-c2[1],2) + Math.pow(c1[2]-c2[2],2));
}

function findClosest(r, g, b) {
  let best = null, bestD = Infinity;
  for (const c of MANGO_COLORS) {
    const d = colorDist([r, g, b], c.hex);
    if (d < bestD) { bestD = d; best = c; }
  }
  return { color: best, distance: bestD };
}

async function retry() {
  const base = path.join(__dirname, '..', 'mango-images');
  const remaining = [
    'armless-chairs/bistro/img11.png',
    'armless-chairs/shalimar/img19.png',
    'baby-chairs/peppy/img15.png',
    'baby-chairs/peppy/img9.png',
    'cabinets/spencer-small/img38.png',
    'horeca-chairs/conwood/img48.png'
  ];

  for (const rel of remaining) {
    const filePath = path.join(base, rel);
    if (!fs.existsSync(filePath)) { console.log('SKIP: ' + rel); continue; }
    
    const parts = rel.split('/');
    const slug = parts[parts.length - 2];
    const ext = rel.match(/\.(\w+)$/)[1];
    
    try {
      const { data, info } = await sharp(filePath)
        .resize(30, 30, { fit: 'cover', position: 'centre' })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const w = info.width;
      const margin = 5;
      const rVals = [], gVals = [], bVals = [];
      
      for (let y = margin; y < w - margin; y++) {
        for (let x = margin; x < w - margin; x++) {
          const idx = (y * w + x) * 3;
          const r = data[idx], g = data[idx+1], b = data[idx+2];
          const br = (r + g + b) / 3;
          if (br > 25 && br < 235) { rVals.push(r); gVals.push(g); bVals.push(b); }
        }
      }

      if (rVals.length < 3) {
        // Use all pixels as fallback
        for (let y = 0; y < w; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 3;
            rVals.push(data[idx]); gVals.push(data[idx+1]); bVals.push(data[idx+2]);
          }
        }
      }

      rVals.sort((a,b) => a-b); gVals.sort((a,b) => a-b); bVals.sort((a,b) => a-b);
      const mid = Math.floor(rVals.length / 2);
      const { color, distance } = findClosest(rVals[mid], gVals[mid], bVals[mid]);
      
      const newName = `${slug}_${color.filename}.${ext}`;
      let finalPath = path.join(path.dirname(filePath), newName);
      if (fs.existsSync(finalPath)) {
        let n = 2;
        while (fs.existsSync(path.join(path.dirname(filePath), `${slug}_${color.filename}_${n}.${ext}`))) n++;
        finalPath = path.join(path.dirname(filePath), `${slug}_${color.filename}_${n}.${ext}`);
      }
      
      fs.renameSync(filePath, finalPath);
      console.log(`${rel} -> ${path.basename(finalPath)} (${color.name} d=${distance.toFixed(0)})`);
    } catch(e) {
      console.log(`FAILED ${rel}: ${e.message}`);
    }
  }
}

retry();
