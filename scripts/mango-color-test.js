const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Mango's official color palette with hex codes
const MANGO_COLORS = [
  { name: 'Red', code: 'RED', hex: '#E31E24' },
  { name: 'Mango Yellow', code: 'MY', hex: '#FFC72C' },
  { name: 'Orange', code: 'ORG', hex: '#FF6B2B' },
  { name: 'Citrus Green', code: 'CG', hex: '#C8D834' },
  { name: 'Mist Blue', code: 'MB', hex: '#7BA4C7' },
  { name: 'Black', code: 'BLK', hex: '#1A1A1A' },
  { name: 'Dark Grey', code: 'DG', hex: '#4A4A4A' },
  { name: 'Milky White', code: 'MW', hex: '#F0EDE5' },
  { name: 'Brick Red', code: 'BRD', hex: '#8B3A2F' },
  { name: 'Rattan Dark Beige', code: 'RDB', hex: '#8B6F47' },
  { name: 'Sandal Yellow', code: 'SY', hex: '#C9A96E' },
  { name: 'Olive Green', code: 'OG', hex: '#5B7553' },
  { name: 'Light Peach', code: 'LP', hex: '#F5C8A8' },
  { name: 'Dark Blue', code: 'DB', hex: '#1A3A6B' },
  { name: 'Blue', code: 'BL', hex: '#2E6DC7' },
  { name: 'Globus Brown', code: 'GB', hex: '#6B4226' },
  { name: 'Cherry', code: 'CHR', hex: '#C41E3A' },
  { name: 'Sandal Wood', code: 'SW', hex: '#B8860B' },
  { name: 'Teak Wood', code: 'TW', hex: '#8B5E3C' },
  { name: 'Marble Beige', code: 'MBG', hex: '#D4C4A8' },
  { name: 'Pink', code: 'PNK', hex: '#E75480' },
  { name: 'Purple', code: 'PRPL', hex: '#6B2D8B' },
  { name: 'New Blue', code: 'NBL', hex: '#1E90FF' },
  { name: 'Eagle Brown', code: 'EB', hex: '#5C4033' },
  { name: 'Weather Brown', code: 'WB', hex: '#7B5B3A' },
  { name: 'Neo Blue', code: 'NB', hex: '#00A3E0' },
  { name: 'Flask Maroon', code: 'FM', hex: '#7B2D42' },
  { name: 'Green', code: 'GRN', hex: '#2E8B57' },
  { name: 'Ivory', code: 'IVR', hex: '#FFFFF0' },
  { name: 'Marble Gray', code: 'MGR', hex: '#B8B8B0' },
  { name: 'Plaza Top', code: 'PT', hex: '#C4A882' },
  { name: 'Forest Green', code: 'FG', hex: '#228B22' },
  { name: 'Navy Blue', code: 'NVB', hex: '#000080' },
  { name: 'Marina Blue', code: 'MBL', hex: '#0077C8' },
  { name: 'Rose Red', code: 'RR', hex: '#C21E56' },
  { name: 'Dark Peach', code: 'DP', hex: '#D4845A' },
  { name: 'Siesta Brown', code: 'SB', hex: '#6B4423' },
  { name: 'Neo Yellow', code: 'NY', hex: '#FFD000' },
  { name: 'Lush Green', code: 'LG', hex: '#2DB84D' },
  { name: 'Gold', code: 'GLD', hex: '#DAA520' },
];

const NIM_KEY = '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';
const NIM_MODEL = 'meta/llama-3.2-11b-vision-instruct';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function colorDistance(hex1, hex2) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

function getColorPrompt() {
  const colorList = MANGO_COLORS.map(c =>
    `- ${c.name} (${c.code}): hex ${c.hex}`
  ).join('\n');

  return `You are analyzing a plastic chair/furniture product image. Your task is to identify the PRIMARY color of the product.

Here are the official Mango Chairs color definitions you MUST use:

${colorList}

Analyze the image and determine:
1. The PRIMARY color of the product (not background)
2. Match it to the CLOSEST color from the list above
3. Consider lighting conditions - the product color may appear slightly different due to studio lighting

Reply with ONLY a JSON object in this exact format:
{"color": "Color Name", "code": "CODE", "confidence": 0.95}

If no color matches well, use the closest one. Do NOT invent new colors.`;
}

function callNimVision(imageBase64, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: NIM_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
            }
          ]
        }
      ],
      max_tokens: 200,
      temperature: 0.1
    });

    const options = {
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NIM_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const content = json.choices[0].message.content;
          resolve(content);
        } catch (e) {
          reject(new Error('Parse error: ' + data.slice(0, 200)));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log('MANGO COLOR RENAMER - TEST RUN');
  console.log('Colors defined: ' + MANGO_COLORS.length);
  console.log('');

  // Pick 5 test images from different categories
  const testImages = [
    { slug: 'bella', category: 'premium-chairs', file: null },
    { slug: 'carnival', category: 'horeca-chairs', file: null },
    { slug: 'monty', category: 'stools', file: null },
    { slug: 'peppy', category: 'baby-chairs', file: null },
    { slug: 'marina', category: 'household', file: null },
  ];

  const base = path.join(__dirname, '..', 'mango-images');

  for (const test of testImages) {
    const dir = path.join(base, test.category, test.slug);
    if (!fs.existsSync(dir)) {
      console.log('SKIP: ' + test.slug + ' (dir not found)');
      continue;
    }
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|png)$/i.test(f));
    if (files.length === 0) {
      console.log('SKIP: ' + test.slug + ' (no images)');
      continue;
    }
    // Pick the first image (main product image)
    test.file = files[0];
    test.filePath = path.join(dir, test.file);
    test.totalImages = files.length;
  }

  const validTests = testImages.filter(t => t.file);
  console.log('Testing ' + validTests.length + ' products:\n');

  for (const test of validTests) {
    console.log('---');
    console.log('Product: ' + test.slug);
    console.log('Category: ' + test.category);
    console.log('Total images: ' + test.totalImages);
    console.log('Testing: ' + test.file);

    // Read image as base64
    const imgBuffer = fs.readFileSync(test.filePath);
    const imgBase64 = imgBuffer.toString('base64');
    console.log('Image size: ' + (imgBuffer.length / 1024).toFixed(0) + 'KB');

    // Call NIM vision
    const prompt = getColorPrompt();
    console.log('Calling NIM vision API...');
    try {
      const result = await callNimVision(imgBase64, prompt);
      console.log('AI Response: ' + result);

      // Parse the JSON response
      const jsonMatch = result.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Identified color: ' + parsed.color + ' (' + parsed.code + ')');
        console.log('Confidence: ' + parsed.confidence);

        // Show the hex distance to verify
        const matchedColor = MANGO_COLORS.find(c => c.code === parsed.code);
        if (matchedColor) {
          console.log('Color hex: ' + matchedColor.hex);
        }

        // Suggest new filename
        const ext = test.file.match(/\.(jpg|png)$/i)[0];
        const newName = test.slug + '_' + parsed.code + ext;
        console.log('Suggested name: ' + newName);
      }
    } catch (e) {
      console.log('ERROR: ' + e.message);
    }

    console.log('');
    await sleep(2000); // Rate limit
  }

  console.log('=== TEST COMPLETE ===');
})();
