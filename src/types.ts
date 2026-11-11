import type { Database } from "bun:sqlite";

export interface User {
    id: number;
    username: string;
}

export interface Goal {
    startWeight: number;
    goalWeight: number;
}

export interface WeightEntry {
    id: number;
    weight: number;
    recordedAt: number;
}

export type AppEnv = {
    Variables: {
        db: Database;
        user: User | null;
    };
};
