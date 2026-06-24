export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    stadium TEXT NOT NULL,
    my_team TEXT NOT NULL,
    result TEXT NOT NULL CHECK(result IN ('승', '패', '무')),
    comment TEXT,
    mood TEXT CHECK(mood IN ('최고', '신남', '보통', '아쉬움', '슬픔', '멘붕')),
    seat TEXT,
    companion TEXT,
    food TEXT,
    memo TEXT,
    weather TEXT,
    mvp_player TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
  );
`;

export const MIGRATE_COLUMNS = `
  ALTER TABLE records ADD COLUMN food TEXT;
  ALTER TABLE records ADD COLUMN memo TEXT;
  ALTER TABLE records ADD COLUMN mvp_player TEXT;
`;
