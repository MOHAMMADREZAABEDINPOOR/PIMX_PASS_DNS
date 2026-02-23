CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  ts INTEGER NOT NULL,
  location TEXT NOT NULL,
  device TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_client_bucket
ON visits (client_id, bucket);

CREATE INDEX IF NOT EXISTS idx_visits_ts
ON visits (ts);

CREATE TABLE IF NOT EXISTS tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id TEXT NOT NULL,
  ts INTEGER NOT NULL,
  dns_count INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tests_ts
ON tests (ts);

