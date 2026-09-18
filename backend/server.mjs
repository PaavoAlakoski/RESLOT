import http from 'node:http';
import { loadEnvFile } from './env.mjs';
import { MatchmakingEngine } from './engine.mjs';

loadEnvFile(new URL('../.env', import.meta.url));

const port = Number(process.env.PORT || 8787);
const engine = new MatchmakingEngine();

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
  const path = url.pathname;

  if (request.method === 'GET' && path === '/api/health') {
    return send(response, 200, { ok: true, aiMode: engine.ai.mode, aiStats: engine.ai.stats });
  }
  if (request.method === 'GET' && path === '/api/state') {
    return send(response, 200, engine.snapshot());
  }
  if (request.method === 'POST' && path === '/api/demo/reset') {
    return send(response, 200, engine.reset());
  }
  if (request.method === 'POST' && path === '/api/pool/join') {
    const input = await body(request);
    return send(response, 200, engine.joinPool(input.startupId));
  }
  const leaveMatch = path.match(/^\/api\/pool\/([^/]+)$/);
  if (request.method === 'DELETE' && leaveMatch) {
    return send(response, 200, engine.leavePool(decodeURIComponent(leaveMatch[1])));
  }
  const candidateMatch = path.match(/^\/api\/vcs\/([^/]+)\/candidates$/);
  if (request.method === 'GET' && candidateMatch) {
    const candidates = await engine.candidates(decodeURIComponent(candidateMatch[1]));
    return send(response, 200, { candidates, aiMode: engine.ai.mode });
  }
  const vcMatch = path.match(/^\/api\/vcs\/([^/]+)$/);
  if (request.method === 'GET' && vcMatch) {
    return send(response, 200, engine.findVc(decodeURIComponent(vcMatch[1])));
  }
  const startupMatch = path.match(/^\/api\/startups\/([^/]+)$/);
  if (request.method === 'GET' && startupMatch) {
    return send(response, 200, engine.findStartup(decodeURIComponent(startupMatch[1])));
  }
  if (request.method === 'POST' && path === '/api/invites') {
    return send(response, 201, engine.createInvite(await body(request)));
  }
  const startupInvitesMatch = path.match(/^\/api\/startups\/([^/]+)\/invites$/);
  if (request.method === 'GET' && startupInvitesMatch) {
    return send(response, 200, { invites: engine.pendingInvites(decodeURIComponent(startupInvitesMatch[1])) });
  }
  const inviteMatch = path.match(/^\/api\/invites\/([^/]+)$/);
  if (request.method === 'GET' && inviteMatch) {
    return send(response, 200, engine.getInvite(decodeURIComponent(inviteMatch[1])));
  }
  const respondMatch = path.match(/^\/api\/invites\/([^/]+)\/respond$/);
  if (request.method === 'POST' && respondMatch) {
    const input = await body(request);
    return send(response, 200, await engine.respondToInvite(decodeURIComponent(respondMatch[1]), input.decision));
  }
  const cancelMatch = path.match(/^\/api\/invites\/([^/]+)\/cancel$/);
  if (request.method === 'POST' && cancelMatch) {
    return send(response, 200, engine.cancelInvite(decodeURIComponent(cancelMatch[1])));
  }
  const meetingMatch = path.match(/^\/api\/meetings\/([^/]+)$/);
  if (request.method === 'GET' && meetingMatch) {
    return send(response, 200, engine.getMeeting(decodeURIComponent(meetingMatch[1])));
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
