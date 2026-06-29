# AKSCI Morningstar — Aerospace Supply Chain Intelligence

Production-grade supply chain command center for aerospace and defense.

## Quick Start

### Option A: Pure Demo (no backend needed)

Open `capabilities.html` directly in your browser. All data is hardcoded mock data. Works offline.

### Option B: Full Stack (recommended)

```bash
# 1. Configure
cp backend/.env.example backend/.env
# Edit backend/.env with your LLM API key (optional, builtin fallback works without)

# 2. Start backend
cd backend
npm install
node server.js

# 3. Open dashboard
# Visit http://localhost:3456/dashboard.html
# Or use deploymorningstar.html to configure the URL
```

### Option C: Docker (production)

```bash
docker compose up -d
# API:   http://localhost:3456
# WS:    ws://localhost:3456/ws
```

## Files

| File | Purpose |
|---|---|
| `capabilities.html` | **Demo** — self-contained static page with mock data, works offline |
| `dashboard.html` | **Production app** — dynamic, calls backend APIs via configurable URL |
| `deploymorningstar.html` | **Deployment config** — sets backend URL in localStorage → launches dashboard |
| `backend/server.js` | Express API server with all REST + WebSocket endpoints |
| `backend/src/` | Modular architecture: routes, services, models, db, utils |
| `backend/data-store.js` | JSON file persistence (fallback when PostgreSQL unavailable) |
| `backend/simulation/` | Python FastAPI microservice for NetworkX multi-echelon simulation |
| `docker-compose.yml` | PostgreSQL + Redis + Node.js API + Python simulation |

## Architecture

```
deploymorningstar.html  →  sets backend URL in localStorage
                                ↓
dashboard.html  →  getBackendUrl()  →  fetch(apiUrl('/api/nlq'))
                                ↓
backend/server.js  →  /api/nlq (RAG), /api/actions/*, /api/simulation/run,
                     /api/feeds/*, /api/feedback/*, /api/graph/*
                     /ws (WebSocket live updates)
                                ↓
backend/src/  →  routes/ → services/  →  models/ (db or data-store.js)
                                ↓
data-store.js  →  data-store.json  (or PostgreSQL + pgvector)
simulation/    →  Python FastAPI + NetworkX  (or JS fallback)
```

## Frontend URLs

- `deploymorningstar.html` — configure backend URL, launch dashboard
- `dashboard.html` — real dashboard, reads URL from localStorage
- `capabilities.html` — static demo, works without any server
