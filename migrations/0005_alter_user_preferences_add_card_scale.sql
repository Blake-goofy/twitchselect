-- Add scalable channel card preference
ALTER TABLE user_preferences ADD COLUMN card_scale REAL DEFAULT 1.0;
