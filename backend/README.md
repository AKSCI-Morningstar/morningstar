# AKSCI Morningstar — Backend

Production-grade supply chain intelligence backend for aerospace and defense.

## Architecture

```
Node.js + Express API (port 3456)
  ├── REST endpoints: /api/nlq, /api/actions/*, /api/simulation/run, /api/feedback/*
  ├── WebSocket server at /ws for live updates
  ├── PostgreSQL + pgvector for graph persistence & RAG
  ├── Redis for caching & job scheduling
  └── Python FastAPI microservice (port 8000) for OR-Tools simulation
```

## Quick Start

### Option 1: Docker (recommended)

```bash
cp backend/.env.example backend/.env
# Edit .env with your API keys

docker compose up -d
# API:    http://localhost:3456
# WS:     ws://localhost:3456/ws
# Health: http://localhost:3456/api/health
```

### Option 2: Local development

```bash
# 1. PostgreSQL (with pgvector)
docker run -d --name morningstar-db -e POSTGRES_DB=morningstar -e POSTGRES_USER=morningstar -e POSTGRES_PASSWORD=morningstar -p 5432:5432 pgvector/pgvector:pg16
cat backend/db/schema.sql | docker exec -i morningstar-db psql -U morningstar

# 2. Redis
docker run -d --name morningstar-redis -p 6379:6379 redis:7-alpine

# 3. Node.js API
cd backend
cp .env.example .env  # edit with your keys
npm install
node db/seed.js       # load graph data into PostgreSQL
node server.js

# 4. Python simulation (optional)
cd simulation
pip install -r requirements.txt
python main.py
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | For RAG | GPT-4o + embeddings |
| `DATABASE_URL` | For persistence | PostgreSQL with pgvector |
| `SESSION_SECRET` | Yes | Session encryption key |
| `GOOGLE_CLIENT_ID` | For Google | OAuth for Calendar/Gmail |
| `GOOGLE_CLIENT_SECRET` | For Google | OAuth secret |
| `SMTP_HOST` | For email | SMTP fallback |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | For push | Firebase admin SDK |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check with all subsystem status |
| POST | `/api/nlq` | Natural language query (LLM + RAG) |
| POST | `/api/actions/bridge-buy` | Create bridge buy PO |
| POST | `/api/actions/escalation-memo` | Generate escalation memo |
| POST | `/api/actions/supplier-email` | Send supplier email |
| POST | `/api/actions/update-ims` | Update IMS milestone |
| POST | `/api/actions/approve` | Approve workflow |
| GET | `/api/actions/log` | Action history |
| POST | `/api/simulation/run` | Monte Carlo simulation (10K iter) with Bayesian risk models + predictionAccuracy |
| POST | `/api/simulation/run/deterministic` | Fast single-pass Bellman-Ford simulation |
| GET | `/api/simulation/history` | Past simulation results |
| POST | `/api/simulation/backtest/:eventId` | Replay historical disruption through model → compare predicted vs actual |
| GET | `/api/simulation/backtest/all` | Run backtest on all historical disruptions (5 seeded) |
| GET | `/api/simulation/accuracy` | Historical accuracy summary (avg 93% across 5 events) |
| POST | `/api/simulation/calibrate` | Calibrate confidence for a scenario against similar historical events |
| POST | `/api/simulation/risk-profile/node` | Bayesian P(failure) for a single node |
| POST | `/api/simulation/risk-profile/network` | Bayesian P(failure) for all nodes |
| POST | `/api/simulation/propagation` | Bellman-Ford blast radius from any trigger node |
| POST | `/api/simulation/python-run` | Proxy to Python microservice |
| POST | `/api/feedback/recommendation` | Log recommendation |
| POST | `/api/feedback/outcome` | Log outcome |
| GET | `/api/feedback/recommendations` | Get personalized recommendations |
| GET | `/api/graph/state` | Full graph data (nodes + edges) |
| GET | `/api/graph/data` | Raw graph from data-store |
| POST | `/api/feeds/spire` | Ingest SPIRE contracts |
| POST | `/api/feeds/sam` | Ingest SAM.gov entities |
| POST | `/api/feeds/dnb` | Ingest D&B reports |
| GET | `/api/feeds/status` | Feed ingestion status |
| POST | `/api/feeds/ingest-demo` | Ingest demo feed data |
| POST | `/api/webhook/feed` | Generic feed webhook |
| GET | `/api/integrations/status` | Google OAuth status |
| GET | `/api/auth/google` | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | OAuth callback |
| POST | `/api/feeds/sam` | Ingest SAM.gov entities |
| POST | `/api/feeds/dnb` | Ingest D&B reports |
| GET | `/api/feeds/status` | Feed ingestion status |
| POST | `/api/notifications/register` | Register device token |
| POST | `/api/notifications/alert` | Send push notification + WebSocket alert |
| WS | `/ws` | Real-time updates |

## Project Structure

```
backend/
├── server.js              # Express main server
├── package.json
├── .env.example
├── Dockerfile
├── src/
│   ├── routes/            # Route handlers (nlq, actions, simulation, feedback, graph, ingestion, webhook, websocket)
│   ├── services/          # Business logic (rag, embeddings, email, ingestion, queue, notifications)
│   ├── models/            # Data access layer (nodes, edges, feedback)
│   ├── db/                # Database pool + migrations
│   │   └── migrations/    # SQL migration files (001-004)
│   └── utils/             # config, logger
├── simulation/
│   ├── main.py            # FastAPI microservice (v2 — Bayesian + Monte Carlo)
│   ├── engine.py          # Bellman-Ford propagation + NetworkX simulation
│   ├── bayesian.py        # Bayesian logistic risk models (NumPy)
│   ├── monte_carlo.py     # 10K+ iteration Monte Carlo engine
│   ├── models.py          # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
├── data-store.js           # JSON file fallback store
├── data-store.json          # Persistent data (auto-created)
└── simulation.js           # JS simulation engine (fallback)
```
