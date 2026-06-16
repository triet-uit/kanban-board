/**
 * AetherBoard - Lightweight Node.js server
 * Serves static files and reads/writes state to data.json
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Helper to fetch data from JSONBin.io
function fetchFromJSONBin(callback) {
  const options = {
    hostname: 'api.jsonbin.io',
    path: `/v3/b/${process.env.JSONBIN_BIN_ID}/latest`,
    method: 'GET',
    headers: {
      'X-Master-Key': process.env.JSONBIN_KEY,
      'X-Bin-Meta': 'false'
    }
  };
  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode !== 200) {
        callback(new Error(`JSONBin error status ${res.statusCode}: ${data}`));
      } else {
        callback(null, data);
      }
    });
  });
  req.on('error', err => callback(err));
  req.end();
}

// Helper to save data to JSONBin.io
function saveToJSONBin(body, callback) {
  const options = {
    hostname: 'api.jsonbin.io',
    path: `/v3/b/${process.env.JSONBIN_BIN_ID}`,
    method: 'PUT',
    headers: {
      'X-Master-Key': process.env.JSONBIN_KEY,
      'Content-Type': 'application/json'
    }
  };
  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode !== 200) {
        callback(new Error(`JSONBin error status ${res.statusCode}: ${data}`));
      } else {
        callback(null);
      }
    });
  });
  req.on('error', err => callback(err));
  req.write(body);
  req.end();
}

const PORT = process.env.PORT || 8089;
let DATA_FILE = process.env.DATA_PATH || path.join(__dirname, 'data.json');

// Ensure parent directory for database file exists (useful for persistent disks on Render/Railway)
const dataDir = path.dirname(DATA_FILE);
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (err) {
  console.warn(`Could not create directory ${dataDir} due to permissions. Falling back to local data.json.`);
  DATA_FILE = path.join(__dirname, 'data.json');
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  // CORS Headers (just in case)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // HTTP Basic Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="AetherBoard Secure Workspace"');
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized - Password Required');
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = Buffer.from(token, 'base64').toString('utf8');
  const [username, password] = decoded.split(':');

  // Configure Credentials (Default: admin / 123456)
  if (username !== 'Kydethuong' || password !== '123456') {
    res.setHeader('WWW-Authenticate', 'Basic realm="AetherBoard Secure Workspace"');
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized - Invalid Username or Password');
    return;
  }

  // 1. API: Get Data
  if (req.method === 'GET' && req.url === '/api/data') {
    if (process.env.JSONBIN_KEY && process.env.JSONBIN_BIN_ID) {
      fetchFromJSONBin((err, data) => {
        if (err) {
          console.error('Error fetching from JSONBin:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to read database from JSONBin' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(data);
        }
      });
    } else {
      fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
          // If file doesn't exist, return empty object so app uses defaults
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({}));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(data);
        }
      });
    }
    return;
  }

  // 2. API: Save Data
  if (req.method === 'POST' && req.url === '/api/data') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        // Validate JSON before saving
        JSON.parse(body);
        
        if (process.env.JSONBIN_KEY && process.env.JSONBIN_BIN_ID) {
          saveToJSONBin(body, (err) => {
            if (err) {
              console.error('Error saving to JSONBin:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to write database to JSONBin' }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            }
          });
        } else {
          fs.writeFile(DATA_FILE, body, 'utf8', (err) => {
            if (err) {
              console.error('Error saving data.json:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to write data file' }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            }
          });
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 3. Static File Server
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Prevent path traversal escape
  const relative = path.relative(__dirname, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`AetherBoard server running at http://localhost:${PORT}/`);
  console.log(`Database stored at: ${DATA_FILE}`);
});
