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

## Verify

```bash
node --test backend/engine.test.mjs
npm run build
```
