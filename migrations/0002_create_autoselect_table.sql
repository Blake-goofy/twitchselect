-- Migration: create autoselect preferences table
-- Provides storage for which streamer usernames a given user wants auto-selected.
-- Idempotent guards: only creates table / indexes if they don't exist.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS autoselect_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  streamer_username TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  -- Optional: last_used_at for future analytics
  last_used_at TEXT,
  UNIQUE(user_id, streamer_username)
);

-- Helpful index to query by user quickly
CREATE INDEX IF NOT EXISTS idx_autoselect_user ON autoselect_preferences(user_id);
-- Helpful index if you need reverse lookup (who auto-selects this streamer)
CREATE INDEX IF NOT EXISTS idx_autoselect_streamer ON autoselect_preferences(streamer_username);
