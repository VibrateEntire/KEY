const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const RESOURCE_DIR = path.join(__dirname, 'resource');
const ACCESS_KEY = 'bluecloudKEY@3';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
};

const server = http.createServer((req, res) => {
  // Check access key
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.searchParams.get('key') !== ACCESS_KEY) {
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }

  // Normalize URL and prevent directory traversal
  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(RESOURCE_DIR, safePath);

  // Ensure the resolved path is within RESOURCE_DIR
  if (!filePath.startsWith(RESOURCE_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${RESOURCE_DIR}`);
});
