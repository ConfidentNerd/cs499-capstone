import type { Database } from "bun:sqlite";
import { Hono } from "hono";
import * as v from "valibot";
import { addEntry, getGoal, listEntries } from "../db/database";
import { getProgressPercent, hasReachedGoal } from "../lib/progress";
import { getCurrentUser, requireUser } from "../middleware/session";
import type { AppEnv, Goal, User } from "../types";
import { entrySchema, type FieldErrors, getFieldErrors } from "../validation/schemas";
import DashboardPage from "../views/DashboardPage";

const dashboardRoutes = new Hono<AppEnv>();

function buildDashboard(db: Database, user: User, goal: Goal, errors?: FieldErrors) {
    const entries = listEntries(db, user.id); // newest first
    const latestEntry = entries[0];

    let currentWeight = goal.startWeight;
    if (latestEntry) currentWeight = latestEntry.weight;

    return (
        <DashboardPage
            user={user}
            goal={goal}
            entries={entries}
            currentWeight={currentWeight}
            progressPercent={getProgressPercent(goal.startWeight, currentWeight, goal.goalWeight)}
            goalReached={hasReachedGoal(goal.startWeight, currentWeight, goal.goalWeight)}
            errors={errors}
        />
    );
}

dashboardRoutes.get("/", requireUser, (c) => {
    try {
        const user = getCurrentUser(c);
        const db = c.get("db");

        const foundGoal = getGoal(db, user.id);
        if (!foundGoal) return c.redirect("/goal", 302);

        return c.html(buildDashboard(db, user, foundGoal), 200);
    } catch (error) {
        console.error("Something went wrong, couldn't load the dashboard: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

dashboardRoutes.post("/entries", requireUser, async (c) => {
    try {
        const user = getCurrentUser(c);
        const db = c.get("db");

        const foundGoal = getGoal(db, user.id);
        if (!foundGoal) return c.redirect("/goal", 302);

        const form = await c.req.parseBody();

        const result = v.safeParse(entrySchema, form);
        if (!result.success) return c.html(buildDashboard(db, user, foundGoal, getFieldErrors(result.issues)), 400);

        // user id comes from the session not the form
        addEntry(db, user.id, result.output.weight, Date.now());

        return c.redirect("/", 302);
    } catch (error) {
        console.error("Something went wrong, couldn't add the entry: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

export default dashboardRoutes;
