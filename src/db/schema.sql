CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users (id),
    expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
    user_id      INTEGER PRIMARY KEY REFERENCES users (id),
    start_weight REAL NOT NULL CHECK (start_weight > 0),
    goal_weight  REAL NOT NULL CHECK (goal_weight > 0)
);

CREATE TABLE IF NOT EXISTS weight_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users (id),
    weight      REAL NOT NULL CHECK (weight > 0),
    recorded_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS entries_by_user_and_time ON weight_entries (user_id, recorded_at);
