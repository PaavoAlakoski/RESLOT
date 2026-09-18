import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from './env.mjs';
import { MatchmakingEngine } from './engine.mjs';

loadEnvFile(new URL('../.env', import.meta.url));

const port = Number(process.env.PORT || 8787);
const engine = new MatchmakingEngine();

// Static file serving setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json; charset=utf-8',
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function serveStaticFile(response, filePath) {
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return null;

    const content = fs.readFileSync(filePath);
    response.writeHead(200, {
      'Content-Type': getContentType(filePath),
      'Content-Length': content.length,
      'Cache-Control': filePath.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-store',
      'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*',
    });
    response.end(content);
    return true;
  } catch {
    return null;
  }
}

function send(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

async function body(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON'), { status: 400 });
  }
}

async function route(request, response) {
  if (request.method === 'OPTIONS') return send(response, 204, {});
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (request.method === 'GET' && pathname === '/api/health') {
    return send(response, 200, { ok: true, aiMode: engine.ai.mode, aiStats: engine.ai.stats });
  }
  if (request.method === 'GET' && pathname === '/api/state') {
    return send(response, 200, engine.snapshot());
  }
  if (request.method === 'POST' && pathname === '/api/demo/reset') {
    return send(response, 200, engine.reset());
  }
  if (request.method === 'POST' && pathname === '/api/pool/join') {
    const input = await body(request);
    return send(response, 200, engine.joinPool(input.startupId));
  }
  const leaveMatch = pathname.match(/^\/api\/pool\/([^/]+)$/);
  if (request.method === 'DELETE' && leaveMatch) {
    return send(response, 200, engine.leavePool(decodeURIComponent(leaveMatch[1])));
  }
  const candidateMatch = pathname.match(/^\/api\/vcs\/([^/]+)\/candidates$/);
  if (request.method === 'GET' && candidateMatch) {
    const candidates = await engine.candidates(decodeURIComponent(candidateMatch[1]));
    return send(response, 200, { candidates, aiMode: engine.ai.mode });
  }
  const vcMatch = pathname.match(/^\/api\/vcs\/([^/]+)$/);
  if (request.method === 'GET' && vcMatch) {
    return send(response, 200, engine.findVc(decodeURIComponent(vcMatch[1])));
  }
  const startupMatch = pathname.match(/^\/api\/startups\/([^/]+)$/);
  if (request.method === 'GET' && startupMatch) {
    return send(response, 200, engine.findStartup(decodeURIComponent(startupMatch[1])));
  }
  if (request.method === 'POST' && pathname === '/api/invites') {
    return send(response, 201, engine.createInvite(await body(request)));
  }
  const startupInvitesMatch = pathname.match(/^\/api\/startups\/([^/]+)\/invites$/);
  if (request.method === 'GET' && startupInvitesMatch) {
    return send(response, 200, { invites: engine.pendingInvites(decodeURIComponent(startupInvitesMatch[1])) });
  }
  const inviteMatch = pathname.match(/^\/api\/invites\/([^/]+)$/);
  if (request.method === 'GET' && inviteMatch) {
    return send(response, 200, engine.getInvite(decodeURIComponent(inviteMatch[1])));
  }
  const respondMatch = pathname.match(/^\/api\/invites\/([^/]+)\/respond$/);
  if (request.method === 'POST' && respondMatch) {
    const input = await body(request);
    return send(response, 200, await engine.respondToInvite(decodeURIComponent(respondMatch[1]), input.decision));
  }
  const cancelMatch = pathname.match(/^\/api\/invites\/([^/]+)\/cancel$/);
  if (request.method === 'POST' && cancelMatch) {
    return send(response, 200, engine.cancelInvite(decodeURIComponent(cancelMatch[1])));
  }
  const meetingMatch = pathname.match(/^\/api\/meetings\/([^/]+)$/);
  if (request.method === 'GET' && meetingMatch) {
    return send(response, 200, engine.getMeeting(decodeURIComponent(meetingMatch[1])));
  }

  // Static file serving
  if (request.method === 'GET') {
    // Try to serve static file from dist/
    let filePath = pathname === '/' ? '/index.html' : pathname;
    const fullPath = path.join(distDir, filePath);

    // Prevent directory traversal attacks
    if (!path.resolve(fullPath).startsWith(path.resolve(distDir))) {
      return send(response, 404, { error: 'Route not found' });
    }

    if (serveStaticFile(response, fullPath)) return;

    // For SPA, serve index.html on non-file paths (no dot in last segment)
    if (!filePath.includes('.')) {
      if (serveStaticFile(response, path.join(distDir, 'index.html'))) return;
    }
  }

  return send(response, 404, { error: 'Route not found' });
}

const server = http.createServer((request, response) => {
  route(request, response).catch((error) => {
    console.error(error);
    send(response, error.status || 500, { error: error.message || 'Internal server error' });
  });
});

server.listen(port, () => {
  console.log(`Live Match API listening on http://localhost:${port}`);
  console.log(`AI mode: ${engine.ai.mode}`);
});
