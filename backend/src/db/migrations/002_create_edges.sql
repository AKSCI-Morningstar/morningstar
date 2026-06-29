CREATE TABLE IF NOT EXISTS edges (
  id           SERIAL PRIMARY KEY,
  source_id    TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id    TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'supplies',
  weight       FLOAT NOT NULL DEFAULT 1.0,
  lag_days     INTEGER DEFAULT 0,
  probability  INTEGER DEFAULT 50,
  attributes   JSONB NOT NULL DEFAULT '{}',
  UNIQUE(source_id, target_id, relationship)
);

CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id);
