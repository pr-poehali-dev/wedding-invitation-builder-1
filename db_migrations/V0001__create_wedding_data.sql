CREATE TABLE IF NOT EXISTS wedding_data (
  id SERIAL PRIMARY KEY,
  site_id TEXT NOT NULL DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS wedding_data_site_id_idx ON wedding_data(site_id);
