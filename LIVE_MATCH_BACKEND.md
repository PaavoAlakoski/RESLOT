# Live Match backend prototype

The existing two-phone frontend is connected to this API without changing its overall design. It uses the backend for pool availability, candidate ranking, invites, confirmations, room assignment, and participant-specific meeting briefs.

The backend reads the repository's existing fictional datasets directly:

- `mockdata/mock_startups.json`
- `mockdata/mock_investor.json`

Emergency availability, invites, and confirmed meetings are kept in memory.

## Run

```bash
node backend/server.mjs
```

The API starts at `http://localhost:8787`.

In a second terminal, start the frontend:

```bash
npm run dev
```

Then open `http://127.0.0.1:5173/`.

An OpenAI key is optional. Without one, scoring and briefs use the deterministic fallback; this is a normal supported mode and does not produce an API fetch error.

```bash
cp .env.example .env
```

Then add the key to `.env`:

```dotenv
OPENAI_API_KEY=your_project_key_here
OPENAI_MODEL=gpt-4.1-mini
```

`node backend/server.mjs` loads this file automatically. `OPENAI_API_KEY` selects OpenAI mode, and `OPENAI_MODEL` can override the default model. The secret is server-side only and is never sent to the React frontend.

## API

- `GET /api/health`
- `GET /api/state`
- `POST /api/demo/reset`
- `POST /api/pool/join`
- `DELETE /api/pool/:startupId`
- `GET /api/vcs/tundra-peak/candidates`
- `POST /api/invites`
- `GET /api/startups/:startupId/invites`
- `GET /api/invites/:inviteId`
- `POST /api/invites/:inviteId/respond`
- `POST /api/invites/:inviteId/cancel`
- `GET /api/meetings/:meetingId`

Example candidate request:

```bash
curl http://localhost:8787/api/vcs/tundra-peak/candidates
```

## Deploy on Railway

This app can be deployed as a **single service** to Railway, combining the frontend and backend into one Node process.

### Setup

1. Create a new Railway project at https://railway.app
2. Connect this GitHub repository to the project
3. In the Railway dashboard, add these environment variables:
   - `OPENAI_API_KEY` — your OpenAI project API key (optional; app works without it)
   - `OPENAI_MODEL` — defaults to `gpt-4.1-mini`, can override if desired
   - `PORT` — set by Railway automatically (typically 8080), do NOT set manually

### How it works

Railway will automatically:
1. Run `npm install` to install dependencies
2. Run `npm run build` to compile TypeScript and build the frontend with Vite (produces `dist/`)
3. Run `npm start` to start the Node server (`node backend/server.mjs`)

The server then:
- Serves the compiled frontend from `dist/` for `/` and other non-API routes
- Handles all `/api/*` routes via the existing backend logic
- Keeps matchmaking state in memory (pool, invites, meetings) as a persistent single-process service

### Frontend API routing

On Railway, the frontend defaults to `/api` (relative path to same origin). The backend serves both the SPA and the API from a single URL. To override during local development if needed, set:

```bash
VITE_LIVE_MATCH_API_URL=http://localhost:8787/api
```

### Local two-terminal dev (unchanged)

The existing local development flow still works exactly as before:

```bash
# Terminal 1: frontend (Vite dev server on 5173)
npm run dev

# Terminal 2: backend (on 8787)
node backend/server.mjs
```

To use local two-process dev with separate origins, set the override:

```bash
# Terminal 2: with env var
VITE_LIVE_MATCH_API_URL=http://localhost:8787/api npm run dev
```

## Verify

```bash
node --test backend/engine.test.mjs
npm run build
```
