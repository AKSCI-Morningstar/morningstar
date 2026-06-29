-- =============================================================================
-- AKSCI Morningstar — PostgreSQL Schema
-- Requires: pgvector extension
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- Nodes (suppliers, programs, assemblies, components, ports, warehouses)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nodes (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '',
  type        TEXT NOT NULL CHECK (type IN ('supplier','program','assembly','component','port','warehouse','tier')),
  attributes  JSONB NOT NULL DEFAULT '{}',
  embedding   vector(1536),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_embedding ON nodes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ---------------------------------------------------------------------------
-- Edges (relationship links between nodes)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS edges (
  id            SERIAL PRIMARY KEY,
  source_id     TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id     TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relationship  TEXT NOT NULL DEFAULT 'supplies',
  weight        FLOAT NOT NULL DEFAULT 1.0,
  attributes    JSONB NOT NULL DEFAULT '{}',
  UNIQUE(source_id, target_id, relationship)
);

CREATE INDEX idx_edges_source ON edges(source_id);
CREATE INDEX idx_edges_target ON edges(target_id);

-- ---------------------------------------------------------------------------
-- Recommendations (self-learning feedback loop)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendations (
  id              SERIAL PRIMARY KEY,
  query           TEXT NOT NULL,
  answer          TEXT NOT NULL,
  confidence      FLOAT NOT NULL DEFAULT 0,
  relevant_nodes  TEXT[] NOT NULL DEFAULT '{}',
  provider        TEXT NOT NULL DEFAULT 'builtin',
  user_followed   BOOLEAN,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Outcomes (results of actions taken)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS outcomes (
  id                  SERIAL PRIMARY KEY,
  recommendation_id   INTEGER REFERENCES recommendations(id) ON DELETE SET NULL,
  on_time_delivery    BOOLEAN,
  cost_variance       FLOAT,
  quality_score       INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  notes               TEXT,
  recorded_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Actions (execution log)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS actions (
  id            SERIAL PRIMARY KEY,
  action_type   TEXT NOT NULL,
  params        JSONB NOT NULL DEFAULT '{}',
  result        JSONB NOT NULL DEFAULT '{}',
  success       BOOLEAN NOT NULL DEFAULT TRUE,
  performed_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Feed data (SPIRE, SAM.gov, D&B)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_data (
  id            SERIAL PRIMARY KEY,
  feed_source   TEXT NOT NULL,
  raw           JSONB NOT NULL DEFAULT '{}',
  ingested_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feed_source ON feed_data(feed_source);

-- ---------------------------------------------------------------------------
-- Device tokens (push notifications)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_tokens (
  id            SERIAL PRIMARY KEY,
  token         TEXT NOT NULL UNIQUE,
  platform      TEXT NOT NULL DEFAULT 'web',
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
