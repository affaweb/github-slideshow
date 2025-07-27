const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const districts = Array.from({ length: 9 }, (_, i) => `district-${i+1}`);

function respondJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (req.method === 'GET' && parsedUrl.pathname.startsWith('/static/')) {
    const filePath = path.join(__dirname, '..', 'frontend', parsedUrl.pathname.replace('/static/', 'public/'));
    fs.readFile(filePath, (err, data) => {
      if (err) {
        respondJSON(res, 404, { error: 'File not found' });
      } else {
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  }
  if (parsedUrl.pathname === '/contracts' && req.method === 'GET') {
    const district = parsedUrl.query.district;
    respondJSON(res, 200, { message: `List contracts for ${district}` });
  } else if (parsedUrl.pathname === '/contracts' && req.method === 'POST') {
    const district = parsedUrl.query.district;
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      respondJSON(res, 200, { message: `Saved contract for ${district}`, data: body });
    });
  } else if (parsedUrl.pathname === '/dashboard' && req.method === 'GET') {
    const district = parsedUrl.query.district;
    if (district) {
      respondJSON(res, 200, { message: `Dashboard for ${district}` });
    } else {
      respondJSON(res, 200, { message: 'City-wide dashboard' });
    }
  } else if (req.method === 'GET' && parsedUrl.pathname === '/') {
    const filePath = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        respondJSON(res, 500, { error: 'Failed to load page' });
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    respondJSON(res, 404, { error: 'Not found' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
