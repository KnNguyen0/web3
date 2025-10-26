import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Set CORS headers to allow localhost connections
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/' || req.url === '/test-ui.html') {
    const html = fs.readFileSync('./test-ui.html', 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Test UI server running at: http://localhost:${PORT}`);
  console.log(`\n📖 Open this URL in your browser: http://localhost:${PORT}\n`);
});
