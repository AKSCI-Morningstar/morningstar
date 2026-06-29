CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS nodes (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL CHECK (type IN ('supplier','program','assembly','component','port','warehouse','tier')),
  attributes JSONB NOT NULL DEFAULT '{}',
  embedding  vector(1536),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
