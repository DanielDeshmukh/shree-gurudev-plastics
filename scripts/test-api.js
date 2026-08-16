const https = require('https');
const fs = require('fs');
const path = require('path');

const img = fs.readFileSync(path.join(__dirname, '..', 'mango-images', 'armless-chairs', 'bistro', 'img11.png'));
console.log('Size:', img.length, 'bytes');

const body = JSON.stringify({
  model: 'meta/llama-3.2-11b-vision-instruct',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What color is this plastic chair? Reply ONLY with JSON: {"code":"RED"}' },
      { type: 'image_url', image_url: { url: 'data:image/png;base64,' + img.toString('base64') } }
    ]
  }],
  max_tokens: 100,
  temperature: 0.0
});

const req = https.request({
  hostname: 'integrate.api.nvidia.com',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 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',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});
req.on('error', e => console.log('Error:', e.message));
req.setTimeout(45000, () => { req.destroy(); console.log('Timeout'); });
req.write(body);
req.end();
