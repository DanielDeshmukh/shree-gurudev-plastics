const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'mango-images');

// Only patterns that are DEFINITELY wrong (not valid Mango colors)
const invalidPatterns = [
  /^_[a-z]/,        // __olive_green
  /___/,            // ivory___weather_brown
  /brown\.png$/,   // bare "brown" (not weather_brown, eagle_brown, etc.)
  /wood\.png$/,     // bare "wood" (not sandal_wood, teak_wood)
  /^yellow\.png$/,
  /^white\.png$/,
  /^grey\.png$/,
  /^maroon\.png$/,
  /^oranage/,
  /^back\.png/,
  /mable_beige/,
  /marble_white/,
  /take_wood/,
  /flush_maroon/,
  /pearl_/,
  /sadal_wood/,
  /plaza_brown/,
  /plaza_top_red/,
  /cherry_back/,
  /dark_beige\.png$/,  // not rattan_dark_beige
  /marble_grey/,
  /sandalwood/,
  /yellow_black/,
  /flora_weather/,
  /ivory___/,
];

const filesToFix = [];
function scanDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) { scanDir(fp); continue; }
    for (const pat of invalidPatterns) {
      if (pat.test(f)) { filesToFix.push(fp); break; }
    }
  }
}
scanDir(base);

console.log(`Found ${filesToFix.length} files to revert`);

let reverted = 0;
for (const fp of filesToFix) {
  const dir = path.dirname(fp);
  const ext = path.extname(fp);
  const baseName = path.basename(fp, ext);
  
  // Find highest existing img number
  const existing = fs.readdirSync(dir).filter(f => /^img\d+\.(png|jpg|jpeg)$/i.test(f));
  let maxNum = 0;
  for (const f of existing) {
    const m = f.match(/img(\d+)/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1]));
  }
  
  const newName = `img${maxNum + 1}${ext}`;
  const newPath = path.join(dir, newName);
  
  if (!fs.existsSync(fp)) continue;
  fs.renameSync(fp, newPath);
  reverted++;
  const rel = fp.replace(base, '').replace(/\\/g, '/');
  console.log(`  ${rel} -> ${newName}`);
}

console.log(`\nReverted: ${reverted}`);
