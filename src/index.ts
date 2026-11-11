import { createApp } from "./app";
import { createDatabase } from "./db/database";

const port = Number(process.env.PORT ?? 3000);
const databasePath = process.env.DATABASE_PATH ?? "data/tracker.db";

const app = createApp(createDatabase(databasePath));

Bun.serve({ port, fetch: app.fetch });

console.log(`Weight Tracker is running on http://localhost:${port}`);
