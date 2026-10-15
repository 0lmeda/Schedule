const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data', 'calendar');

fs.mkdirSync(DATA_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function noCacheHeaders(contentType) {
  return {
    'Content-Type': contentType,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };
}

function sendJson(res, status, value) {
  res.writeHead(status, noCacheHeaders('application/json; charset=utf-8'));
  res.end(JSON.stringify(value));
}

function validDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function dayFile(date) {
  return path.join(DATA_DIR, `${date}.json`);
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error('Request body too large');
  }
  return body ? JSON.parse(body) : null;
}

function readDay(date) {
  const file = dayFile(date);
  if (!fs.existsSync(file)) return [];
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeDay(date, events) {
  const file = dayFile(date);
  if (!events.length) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return;
  }
  fs.writeFileSync(file, JSON.stringify(events, null, 2) + '\n', 'utf8');
}

function readMonth(month) {
  const result = {};
  if (!/^\d{4}-\d{2}$/.test(month)) return result;
  for (const name of fs.readdirSync(DATA_DIR)) {
    if (!name.startsWith(`${month}-`) || !name.endsWith('.json')) continue;
    const date = name.slice(0, -5);
    result[date] = readDay(date);
  }
  return result;
}

function serveStatic(reqPath, res) {
  const requested = reqPath === '/' ? '/index.html' : reqPath;
  const decoded = decodeURIComponent(requested);
  const safePath = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const file = path.join(ROOT, safePath);

  if (file.startsWith(path.join(ROOT, 'data')) || file === path.join(ROOT, 'server.js')) {
    res.writeHead(404, noCacheHeaders('text/plain; charset=utf-8'));
    res.end('Not found');
    return;
  }
  if (!file.startsWith(ROOT)) {
    res.writeHead(403, noCacheHeaders('text/plain; charset=utf-8'));
    res.end('Forbidden');
    return;
  }

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, noCacheHeaders('text/plain; charset=utf-8'));
      res.end('Not found');
      return;
    }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, noCacheHeaders(type));
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    if (url.pathname === '/api/calendar' && req.method === 'GET') {
      const month = url.searchParams.get('month') || '';
      return sendJson(res, 200, readMonth(month));
    }

    const match = url.pathname.match(/^\/api\/calendar\/(\d{4}-\d{2}-\d{2})$/);
    if (match) {
      const date = match[1];
      if (!validDateKey(date)) return sendJson(res, 400, { error: 'Invalid date' });

      if (req.method === 'GET') return sendJson(res, 200, readDay(date));

      if (req.method === 'PUT') {
        const events = await readBody(req);
        if (!Array.isArray(events)) return sendJson(res, 400, { error: 'Expected an array of events' });
        writeDay(date, events);
        return sendJson(res, 200, { ok: true, date, events });
      }
    }

    if (url.pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'API route not found' });
    serveStatic(url.pathname, res);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Focus Dashboard running at http://localhost:${PORT}`);
});
