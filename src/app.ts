import type { Database } from "bun:sqlite";
import { join } from "node:path";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { loadUser } from "./middleware/session";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import entryRoutes from "./routes/entries";
import goalRoutes from "./routes/goal";
import type { AppEnv } from "./types";

const logo = Bun.file(join(import.meta.dir, "public/logo.png"));

// passed so tests can use an in memory DB
export function createApp(db: Database) {
    const app = new Hono<AppEnv>();

    if (process.env.NODE_ENV !== "test") app.use(logger());

    app.use(async (c, next) => {
        c.set("db", db);
        await next();
    });
    app.use(loadUser);

    app.get("/logo.png", () => new Response(logo));

    app.route("/", authRoutes);
    app.route("/", goalRoutes);
    app.route("/", dashboardRoutes);
    app.route("/", entryRoutes);

    app.notFound((c) => {
        return c.text("Page not found", 404);
    });

    // for errors thrown in middleware
    app.onError((error, c) => {
        console.error("Something went wrong, couldn't handle the request: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    });

    return app;
}
