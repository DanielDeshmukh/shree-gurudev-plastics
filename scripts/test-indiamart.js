const https = require('https');
const url = 'https://www.indiamart.com/kjplastjalgaon/plastic-arm-chair.html';
https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html'
  }
}, (res) => {
  let d = '';
  res.on('data', (c) => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('HTML length:', d.length);
    const m = d.match(/imimg\.com[^"'\s]*/g);
    if (m) {
      const unique = [...new Set(m)];
      console.log('Total imimg URLs:', unique.length);
      unique.slice(0, 30).forEach(u => console.log(' ', u));
    } else {
      console.log('No imimg URLs found');
    }
    // Check for PDFImage or 500x500
    const pdf = d.match(/PDFImage[^"'\s]*/g);
    console.log('PDFImage URLs:', pdf ? pdf.length : 0);
    const big = d.match(/500x500[^"'\s]*/g);
    console.log('500x500 refs:', big ? big.length : 0);
  });
}).on('error', (e) => console.error(e.message));
