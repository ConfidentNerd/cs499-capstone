import { Database } from "bun:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Goal, User, WeightEntry } from "../types";

export function createDatabase(path: string): Database {
    // tests use :memory:
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });

    const db = new Database(path, { create: true });

    const schema = readFileSync(join(import.meta.dir, "schema.sql"), "utf8");
    db.exec(schema);
    return db;
}

interface UserWithPassword extends User {
    passwordHash: string;
}

export function findUserByUsername(db: Database, username: string): UserWithPassword | null {
    const query = db.query<UserWithPassword, [string]>(
        "SELECT id, username, password_hash AS passwordHash FROM users WHERE username = ?",
    );
    return query.get(username);
}

export function createUser(db: Database, username: string, passwordHash: string): User {
    const query = db.query<User, [string, string]>(
        "INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id, username",
    );
    // RETURNING always gives a row back
    return query.get(username, passwordHash)!;
}

export function createSession(db: Database, token: string, userId: number, expiresAt: number): void {
    db.query("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expiresAt);
}

export function findUserBySession(db: Database, token: string, now: number): User | null {
    const query = db.query<User, [string, number]>(
        `SELECT users.id, users.username
         FROM sessions
         JOIN users ON users.id = sessions.user_id
         WHERE sessions.token = ? AND sessions.expires_at > ?`,
    );
    return query.get(token, now);
}

export function getGoal(db: Database, userId: number): Goal | null {
    const query = db.query<Goal, [number]>(
        "SELECT start_weight AS startWeight, goal_weight AS goalWeight FROM goals WHERE user_id = ?",
    );
    return query.get(userId);
}

export function saveGoal(db: Database, userId: number, startWeight: number, goalWeight: number): void {
    // replaces the prev goal since user_id is the primary key
    db.query("INSERT OR REPLACE INTO goals (user_id, start_weight, goal_weight) VALUES (?, ?, ?)").run(
        userId,
        startWeight,
        goalWeight,
    );
}

// always filter by user_id

export function listEntries(db: Database, userId: number): WeightEntry[] {
    const query = db.query<WeightEntry, [number]>(
        `SELECT id, weight, recorded_at AS recordedAt
         FROM weight_entries
         WHERE user_id = ?
         ORDER BY recorded_at DESC, id DESC`,
    );
    return query.all(userId);
}

export function getEntry(db: Database, userId: number, entryId: number): WeightEntry | null {
    const query = db.query<WeightEntry, [number, number]>(
        "SELECT id, weight, recorded_at AS recordedAt FROM weight_entries WHERE id = ? AND user_id = ?",
    );
    return query.get(entryId, userId);
}

export function addEntry(db: Database, userId: number, weight: number, recordedAt: number): void {
    db.query("INSERT INTO weight_entries (user_id, weight, recorded_at) VALUES (?, ?, ?)").run(
        userId,
        weight,
        recordedAt,
    );
}

export function updateEntry(db: Database, userId: number, entryId: number, weight: number): void {
    db.query("UPDATE weight_entries SET weight = ? WHERE id = ? AND user_id = ?").run(weight, entryId, userId);
}

export function deleteEntry(db: Database, userId: number, entryId: number): void {
    db.query("DELETE FROM weight_entries WHERE id = ? AND user_id = ?").run(entryId, userId);
}
