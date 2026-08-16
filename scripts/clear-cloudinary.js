const https = require('https');

const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const AUTH = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

function apiCall(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}${path}`,
      method,
      headers: { 'Authorization': `Basic ${AUTH}` }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function deleteResources(publicIds) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ public_ids: publicIds });
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/resources/image/upload?public_ids[]=${publicIds.map(encodeURIComponent).join('&public_ids[]=')}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${AUTH}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Fetching all resources...');

  const allResources = [];
  let nextCursor = null;

  do {
    const cursorParam = nextCursor ? `&next_cursor=${nextCursor}` : '';
    const result = await apiCall('GET', `/resources/image/upload?max_results=100${cursorParam}`);
    if (result.resources) allResources.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`Found ${allResources.length} resources total`);

  const toDelete = allResources.map(r => r.public_id);
  console.log(`Deleting ${toDelete.length} resources...`);

  // Delete in batches of 100
  for (let i = 0; i < toDelete.length; i += 100) {
    const batch = toDelete.slice(i, i + 100);
    const path = `/resources/image/upload?public_ids[]=${batch.map(encodeURIComponent).join('&public_ids[]=')}`;
    const result = await apiCall('DELETE', path);
    console.log(`Batch ${Math.floor(i/100)+1}: deleted ${batch.length} - ${JSON.stringify(result).substring(0, 100)}`);
  }

  console.log('Done!');
}

main().catch(e => console.error(e));
