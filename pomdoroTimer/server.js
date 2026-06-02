// Simple HTTP Server for local testing
// Run with: node server.js
// Then visit: http://localhost:8000

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown'
};

const server = http.createServer((req, res) => {
  // Default to index.html for root
  let filePath = req.url === '/' ? 'index.html' : req.url;
  
  // Remove query string
  filePath = filePath.split('?')[0];
  
  // Construct full path
  filePath = path.join(__dirname, filePath);
  
  // Security: prevent directory traversal
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(path.normalize(__dirname))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║   Pomodoro Timer Server Started                   ║
╠════════════════════════════════════════════════════╣
║   🌐 http://localhost:${PORT}                     ║
║                                                    ║
║   Features to Test:                               ║
║   ✅ Start/Pause/Reset buttons                    ║
║   ✅ Circular progress animation                  ║
║   ✅ Switch tabs - timer continues in background  ║
║   ✅ Refresh page - session resumes from storage  ║
║   ✅ Settings - customize durations              ║
║   ✅ Sound notifications                         ║
║   ✅ Page title updates                          ║
║                                                    ║
║   Press Ctrl+C to stop                           ║
╚════════════════════════════════════════════════════╝
  `);
});
