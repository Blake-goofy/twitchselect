-- Named filter presets per user
-- Stores text fields; game_name can store a game even if not live currently.
CREATE TABLE IF NOT EXISTS filter_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  streamer_query TEXT,        -- substring for channel
  title_query TEXT,           -- substring for title
  game_name TEXT,             -- exact game name (may or may not be live at time of apply)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_filter_presets_user ON filter_presets(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_filter_presets_user_name ON filter_presets(user_id, name);
