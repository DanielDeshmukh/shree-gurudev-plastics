const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'mango-images');

const CATEGORY_MAP = {
  // Chairs > Premium
  'premium-chairs': [
    'amazing', 'bella', 'ginger', 'honey', 'magic', 'majestic', 'maple',
    'melody', 'milan', 'mint', 'miracle', 'neo', 'nirali', 'nivan', 'nixon',
    'nova', 'olive', 'paris', 'sahara', 'savanna', 'sigma', 'storm', 'style',
    'sugar', 'symphony', 'testa', 'vanilla', 'venice'
  ],
  // Chairs > Medium
  'medium-chairs': [
    'ace', 'audio', 'benzo', 'diva', 'fazo', 'mango-1003', 'mango-1004',
    'mango-1005', 'mango-1006', 'mango-9021', 'mango-9022', 'mango-9023',
    'mango-9024', 'mango-9025', 'mezzo', 'opera', 'remo', 'santosa', 'satin',
    'seoni', 'shine', 'silk', 'silver', 'solo', 'star', 'sun', 'super',
    'swizz', 'sydney', 'ventura'
  ],
  // Chairs > Armless
  'armless-chairs': [
    'bidai', 'bistro', 'blossom', 'charlie', 'power', 'prestige', 'pride',
    'sangeet', 'shagun', 'shahnai', 'shalimar', 'shangrilla', 'snow',
    'spring', 'summer'
  ],
  // Chairs > HORECA/Cafe
  'horeca-chairs': [
    'carnival', 'cocktail', 'conwood', 'irani', 'lipstick', 'martini',
    'meloni', 'salsa', 'sandra', 'scoop', 'sizzler', 'spice', 'stanly',
    'sushi', 'taqilla', 'tiffany'
  ],
  // Chairs > Economical
  'economical-chairs': [
    'mango-1008', 'mango-1009', 'mango-1010', 'mango-1060', 'mango-1061',
    'mango-1062', 'mango-1063', 'mango-1064'
  ],
  // Chairs > Baby
  'baby-chairs': [
    'abcd', 'chimpu', 'genius', 'little-heart', 'maggy', 'panda', 'peppy',
    'pony', 'santa', 'smiley'
  ],
  // Tables
  'tables': [
    'buffet', 'buffet-fruit', 'buffet-juice', 'chit-chat', 'oreoz', 'party',
    'party-fruit', 'party-juice', 'safari', 'saffron', 'sapphire',
    'sapphire-flora', 'sapphire-pine', 'tokyo'
  ],
  // Stools
  'stools': [
    'alpha', 'anchor', 'champion', 'cube-10', 'cube-14', 'cube-18', 'gem',
    'i-con', 'insta', 'king', 'kremlin', 'monty', 'murfi', 'nawab',
    'nepolean', 'oscar', 'pepper', 'prince', 'rocky', 'salt', 'sikandar',
    'striker', 'sultan', 'sunday', 'tango', 'tik-tok', 'topass', 'wazir'
  ],
  // Cabinets
  'cabinets': [
    'checkmate', 'checkmate-decor-big', 'checkmate-delight-big',
    'checkmate-delight-big-1', 'checkmate-devine-big', 'checkmate-devine-small',
    'spark-big', 'spark-smal', 'spencer-big', 'spencer-small'
  ],
  // Dustbins
  'dustbins': ['pedal-bin'],
  // Household
  'household': [
    'big-multi-purpose-rack', 'big-shoe-rack', 'kinder', 'marina',
    'small-multi-purpose-rack', 'small-shoe-rack', 'store-it-drawer-4'
  ]
};

// Verify all 167 slugs are accounted for
const allSlugs = Object.values(CATEGORY_MAP).flat();
console.log('Mapped slugs: ' + allSlugs.length);

const sourceDir = path.join(BASE, 'premium-chairs');
const existingDirs = fs.readdirSync(sourceDir).filter(d => fs.statSync(path.join(sourceDir, d)).isDirectory());
console.log('Directories in premium-chairs: ' + existingDirs.length);

// Check for unmapped
const mappedSet = new Set(allSlugs);
const unmapped = existingDirs.filter(d => !mappedSet.has(d));
if (unmapped.length > 0) {
  console.log('WARNING: Unmapped slugs: ' + unmapped.join(', '));
}

// Check for missing
const existingSet = new Set(existingDirs);
const missing = allSlugs.filter(s => !existingSet.has(s));
if (missing.length > 0) {
  console.log('WARNING: Missing from disk: ' + missing.join(', '));
}

// Move directories
let moved = 0;
let skipped = 0;

for (const [category, slugs] of Object.entries(CATEGORY_MAP)) {
  const targetDir = path.join(BASE, category);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('Created: ' + category + '/');
  }

  for (const slug of slugs) {
    const src = path.join(sourceDir, slug);
    const dst = path.join(targetDir, slug);

    if (!fs.existsSync(src)) {
      console.log('  SKIP (not found): ' + slug);
      skipped++;
      continue;
    }

    if (fs.existsSync(dst)) {
      console.log('  SKIP (already exists): ' + slug + ' -> ' + category);
      skipped++;
      continue;
    }

    fs.renameSync(src, dst);
    const fileCount = fs.readdirSync(dst).filter(f => /\.(jpg|png)$/i.test(f)).length;
    console.log('  MOVED: ' + slug + ' -> ' + category + '/ (' + fileCount + ' images)');
    moved++;
  }
}

console.log('');
console.log('=== DONE ===');
console.log('Moved: ' + moved);
console.log('Skipped: ' + skipped);

// Final summary
console.log('');
console.log('Final directory structure:');
for (const [category, slugs] of Object.entries(CATEGORY_MAP)) {
  const catDir = path.join(BASE, category);
  const count = fs.existsSync(catDir) ? fs.readdirSync(catDir).filter(d => fs.statSync(path.join(catDir, d)).isDirectory()).length : 0;
  console.log('  ' + category + '/: ' + count + ' products');
}

// Total files remaining in premium-chairs
const remaining = fs.readdirSync(sourceDir).filter(d => fs.statSync(path.join(sourceDir, d)).isDirectory());
console.log('');
console.log('premium-chairs/ remaining: ' + remaining.length + ' products');
if (remaining.length > 0) {
  console.log('  ' + remaining.join(', '));
}
