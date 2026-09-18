# Slush Rematch

A speed-matchmaking demo app built with React, TypeScript, and Vite. This application simulates a matching experience between founders and investors.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

To build for production:

```bash
npm run build
```

## Project Structure

- **`src/`** — The main React application
  - `components/` — React components organized by feature (founder, investor, overlays, ios)
  - `hooks/` — Custom React hooks
  - `data/` — Application data
  - `styles/` — Global styles and the vendored Nocturne design system
  - `types/` — TypeScript type definitions

- **`data/`** — Mock data files (currently unused; kept for potential future integration)

- **`legacy-prototype/`** — Archived original prototype (interactive HTML/DC format, not part of the build; kept for historical reference)

## Development

The app is organized into founder and investor interfaces, each rendered in an iOS-like device frame. Use the reset button in the top-right to restart the demo.
