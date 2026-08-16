const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'reego-images');
const LOG_FILE = path.join(OUTPUT_DIR, 'scrape.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('download timeout')), 30000);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        clearTimeout(timer);
        return downloadFile(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { clearTimeout(timer); return reject(new Error(`HTTP ${res.statusCode}`)); }
      const stream = fs.createWriteStream(filepath);
      res.pipe(stream);
      stream.on('finish', () => { clearTimeout(timer); stream.close(); resolve(); });
      stream.on('error', (e) => { clearTimeout(timer); reject(e); });
    }).on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}

function sanitize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_').substring(0, 60);
}

// All products scraped from IndiaMART K.J.Plast page
const PRODUCTS = [
  {
    name: 'Designer Plastic Chair With Armrest',
    category: 'plastic-arm-chair',
    price: 950,
    color: 'Mustard',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364863924/PG/QT/CY/18623977/office-table-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/PDFImage/2023/12/368756401/DP/ND/GU/18623977/designer-plastic-chair-with-armrest-500x500.png',
      'https://5.imimg.com/data5/SELLER/PDFImage/2023/12/368756416/UK/EJ/UD/18623977/designer-plastic-chair-with-armrest-500x500.png',
      'https://5.imimg.com/data5/SELLER/PDFImage/2023/12/368756430/FM/TL/PA/18623977/designer-plastic-chair-with-armrest-500x500.png',
      'https://5.imimg.com/data5/SELLER/PDFImage/2023/12/368756431/YD/XQ/KH/18623977/designer-plastic-chair-with-armrest-500x500.png',
      'https://5.imimg.com/data5/SELLER/PDFImage/2023/12/368756437/LU/CX/YA/18623977/designer-plastic-chair-with-armrest-500x500.png',
    ]
  },
  {
    name: 'Reego Plastic Executive Chair',
    category: 'plastic-arm-chair',
    price: 550,
    color: 'Maroon And Black',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364865779/KW/KF/PB/18623977/office-chair-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364865898/CJ/SG/TK/18623977/office-chair-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364865902/NX/RC/ZN/18623977/office-chair-500x500.jpeg',
    ]
  },
  {
    name: 'Reego Black Plastic Chair',
    category: 'plastic-arm-chair',
    price: 550,
    color: 'Black',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364869889/QR/ZO/AF/18623977/whatsapp-image-2023-11-29-at-14-32-52-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364869892/NP/KP/ER/18623977/whatsapp-image-2023-11-29-at-14-32-53-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364894909/JJ/RG/GM/18623977/reego-black-pastic-cuisin-chair-500x500.jpg',
    ]
  },
  {
    name: 'Reego Medium Back Plastic Chair',
    category: 'plastic-arm-chair',
    price: 670,
    color: 'Maroon',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364869179/VQ/MA/OO/18623977/whatsapp-image-2023-11-29-at-14-17-55-1-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364869183/PF/EL/CG/18623977/whatsapp-image-2023-11-29-at-14-17-55-2-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364869249/DU/LB/ZU/18623977/whatsapp-image-2023-11-29-at-14-17-55-500x500.jpeg',
    ]
  },
  {
    name: 'Reego Armrest Chair',
    category: 'plastic-arm-chair',
    price: 900,
    color: 'Brown',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364865349/HM/VH/RP/18623977/blue-stackable-banquet-hall-chair-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/PDFImage/2023/12/368761240/KO/UY/DK/18623977/reego-plastic-majestic-chair-500x500.png',
    ]
  },
  {
    name: 'Reego Beige Plastic Spine Chair',
    category: 'plastic-arm-chair',
    price: 1200,
    color: 'Beige',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364865569/EZ/AK/VQ/18623977/modular-office-chair-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364865572/WK/PL/YY/18623977/modular-office-chair-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364865574/ZC/QX/ZY/18623977/modular-office-chair-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/PDFImage/2023/12/368761795/HX/AD/KJ/18623977/reego-beige-plastic-spine-chair-500x500.png',
    ]
  },
  {
    name: 'Reego Plastic Chair',
    category: 'plastic-arm-chair',
    price: 550,
    color: 'Maroon',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364870245/AB/ZU/UK/18623977/whatsapp-image-2023-11-29-at-14-32-53-3-500x500.jpeg',
    ]
  },
  {
    name: 'Reego Maroon Plastic Chair',
    category: 'plastic-arm-chair',
    price: 550,
    color: 'Maroon',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364870047/OL/AM/TN/18623977/whatsapp-image-2023-11-29-at-14-32-53-2-500x500.jpeg',
    ]
  },
  {
    name: 'Reego Medium Back Chair',
    category: 'plastic-arm-chair',
    price: 560,
    color: 'Black',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364868708/TK/XM/FT/18623977/whatsapp-image-2023-11-29-at-14-12-30-500x500.jpeg',
    ]
  },
  {
    name: 'Reego Plastic Jordan Chairs',
    category: 'plastic-arm-chair',
    price: 800,
    color: 'Brown',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364869547/DZ/PI/PG/18623977/whatsapp-image-2023-11-29-at-14-19-42-500x500.jpeg',
    ]
  },
  {
    name: 'Reego Plastic Majestic Chair',
    category: 'plastic-arm-chair',
    price: 650,
    color: 'Brown',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364896026/AJ/FP/CF/18623977/stool-500x500.jpg',
    ]
  },
  {
    name: 'Reego Medium Back Black Plastic Chair',
    category: 'plastic-arm-chair',
    price: 700,
    color: 'Black',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364868846/BA/XO/LL/18623977/whatsapp-image-2023-11-29-at-14-17-54-500x500.jpeg',
    ]
  },
  {
    name: 'Reego White Plastic Armless Chair',
    category: 'plastic-armless-chair',
    price: null,
    color: 'White',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364868212/FL/BI/GF/18623977/whatsapp-image-2023-11-29-at-14-06-18-1-500x500.jpeg',
    ]
  },
  {
    name: 'Armless Plastic Chair',
    category: 'plastic-armless-chair',
    price: null,
    color: null,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364868393/CA/OF/NI/18623977/whatsapp-image-2023-11-29-at-14-06-17-1-500x500.jpeg',
    ]
  },
  {
    name: 'Plastic Round Stool',
    category: 'office-table',
    price: null,
    color: null,
    images: [
      'https://5.imimg.com/data5/ANDROID/Default/2023/12/367063280/DF/SB/KR/18623977/product-jpeg-500x500.jpg',
    ]
  },
  {
    name: 'Plastic Baby Chair',
    category: 'plastic-baby-chairs',
    price: null,
    color: null,
    images: [
      'https://5.imimg.com/data5/ANDROID/Default/2023/12/367062334/LG/ZF/WR/18623977/product-jpeg-500x500.jpeg',
    ]
  },
  {
    name: 'Nilkamal Plastic Chairs',
    category: 'office-chair',
    price: null,
    color: null,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364870183/AU/VA/DT/18623977/whatsapp-image-2023-11-29-at-14-32-53-500x500.jpeg',
    ]
  },
  {
    name: 'Reego Light Brown Plastic Majestic Chair',
    category: 'plastic-chair',
    price: null,
    color: 'Light Brown',
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/12/364895885/AZ/NK/KC/18623977/dining-table-set-500x500.jpg',
    ]
  },
];

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(LOG_FILE, '');

  log('=== REEGO/KJ PLAST INDIAMART SCRAPE START ===');
  log(`Total products: ${PRODUCTS.length}`);

  let totalDownloaded = 0;
  let totalFailed = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const dirName = sanitize(p.name);
    const dir = path.join(OUTPUT_DIR, dirName);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    log(`\n[${i + 1}/${PRODUCTS.length}] ${p.name} (${p.images.length} images, ₹${p.price || '?'}, ${p.color || 'various'})`);

    for (let j = 0; j < p.images.length; j++) {
      const imgUrl = p.images[j];
      const ext = imgUrl.match(/\.(jpeg|jpg|png)$/i)?.[0] || '.jpg';
      const filename = `${dirName}_${j + 1}${ext}`;
      const filepath = path.join(dir, filename);

      if (fs.existsSync(filepath)) {
        log(`  SKIP ${filename} (exists)`);
        continue;
      }

      try {
        await downloadFile(imgUrl, filepath);
        totalDownloaded++;
        log(`  +${filename}`);
      } catch (e) {
        totalFailed++;
        log(`  ERR ${filename}: ${e.message}`);
      }
      await sleep(500);
    }
  }

  log(`\n=== DONE === Downloaded: ${totalDownloaded}, Failed: ${totalFailed}, Products: ${PRODUCTS.length}`);
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
