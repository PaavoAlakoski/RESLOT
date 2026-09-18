# Slush Rematch

A speed-matchmaking demo for Slush: when a scheduled 1:1 slot falls through, the freed-up meeting gets refilled from a live pool. Two mirrored iOS-style device mockups — **Founder** and **Investor** — show both sides of the flow in real time, matched by a small Node backend that scores investor↔startup fit with OpenAI (with a deterministic fallback when no API key is set).

## Architecture

- **Frontend** — Vite + React + TypeScript SPA (`src/`), rendered as two iPhone-style device frames side by side.
- **Backend** — a dependency-free Node HTTP server (`backend/server.mjs`) that owns matchmaking state (pool availability, invites, confirmed meetings) in memory and exposes a small REST API under `/api/*`. It also serves the built frontend, so the whole app can run as a single process.
- **Data** — fictional mock datasets in `mockdata/` (`mock_startups.json`, `mock_investor.json`) are the source of truth for candidate/investor profiles.
- **Scoring** — `backend/ai.mjs` calls OpenAI to rank candidates and draft meeting briefs; without `OPENAI_API_KEY` set it falls back to a deterministic heuristic, so the app works fully offline.

See [`LIVE_MATCH_BACKEND.md`](./LIVE_MATCH_BACKEND.md) for the full API reference, environment variables, and deployment details.

## Getting Started

Local development runs the frontend and backend as two separate processes:

```bash
npm install

# Terminal 1 — frontend (Vite dev server, port 5173)
npm run dev

# Terminal 2 — backend (port 8787)
node backend/server.mjs
```

Then open `http://127.0.0.1:5173/`.

An OpenAI key is optional — without one, scoring uses the deterministic fallback. To enable real scoring:

```bash
cp .env.example .env
# then add your key to .env
```

## Building & Running as One Service

```bash
npm run build   # compiles TypeScript and builds the frontend into dist/
npm start        # runs the backend, which now also serves dist/
```

This single-process mode is what a platform like Railway runs in production — see [`LIVE_MATCH_BACKEND.md`](./LIVE_MATCH_BACKEND.md#deploy-on-railway) for deployment steps.

## Testing

```bash
node --test backend/engine.test.mjs
node --test backend/ai.test.mjs
```

## Project Structure

```
backend/            Node HTTP server, matchmaking engine, OpenAI scoring, tests
mockdata/            Fictional startup and investor datasets
src/
  api/               Frontend client for the backend API
  components/        UI, organized by feature (founder, investor, overlays, ios)
  hooks/             useMatchmakingDemo — state machine driving both device views
  styles/            Global styles and the vendored Nocturne design system
  types/             Shared TypeScript types
LIVE_MATCH_BACKEND.md  Full API reference, env vars, and deployment guide
```

## Development

The app is organized into founder and investor interfaces, each rendered in an iOS-like device frame. Use the reset button in the top-right to restart the demo.
