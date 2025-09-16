-- User preferences for UI settings (sort, darkmode flag, default filter preset)
-- One row per user; last_write_wins on upsert.
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  sort_field TEXT,           -- 'viewers' | 'alphabetical' | 'uptime'
  sort_direction TEXT,       -- 'asc' | 'desc' | NULL
  darkmode_url INTEGER,      -- 0 or 1
  default_filter_preset_id INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at ON user_preferences(updated_at);
