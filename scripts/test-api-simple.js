const https = require('https');

const body = JSON.stringify({
  model: 'meta/llama-3.2-11b-vision-instruct',
  messages: [{
    role: 'user',
    content: 'Say hello in JSON: {"msg":"hello"}'
  }],
  max_tokens: 50
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
    console.log('Response:', data.slice(0, 500));
  });
});
req.on('error', e => console.log('Error:', e.message));
req.setTimeout(30000, () => { req.destroy(); console.log('Timeout after 30s'); });
req.write(body);
req.end();
