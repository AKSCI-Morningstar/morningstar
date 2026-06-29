CREATE TABLE IF NOT EXISTS recommendations (
  id             SERIAL PRIMARY KEY,
  query          TEXT NOT NULL,
  answer         TEXT NOT NULL,
  confidence     FLOAT NOT NULL DEFAULT 0,
  relevant_nodes TEXT[] NOT NULL DEFAULT '{}',
  provider       TEXT NOT NULL DEFAULT 'builtin',
  user_followed  BOOLEAN,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outcomes (
  id                SERIAL PRIMARY KEY,
  recommendation_id INTEGER REFERENCES recommendations(id) ON DELETE SET NULL,
  on_time_delivery  BOOLEAN,
  cost_variance     FLOAT,
  quality_score     INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  notes             TEXT,
  recorded_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS actions (
  id           SERIAL PRIMARY KEY,
  action_type  TEXT NOT NULL,
  payload      JSONB NOT NULL DEFAULT '{}',
  result       JSONB NOT NULL DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'completed',
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_tokens (
  id         SERIAL PRIMARY KEY,
  token      TEXT NOT NULL UNIQUE,
  platform   TEXT NOT NULL DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
