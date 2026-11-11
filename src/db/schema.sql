-- constraints and indexes come with the database enhancement

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT,
    password_hash TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER,
    expires_at INTEGER
);

CREATE TABLE IF NOT EXISTS goals (
    user_id      INTEGER PRIMARY KEY,
    start_weight REAL,
    goal_weight  REAL
);

CREATE TABLE IF NOT EXISTS weight_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    weight      REAL,
    recorded_at INTEGER
);
