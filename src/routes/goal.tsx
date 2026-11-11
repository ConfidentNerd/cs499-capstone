import { Hono } from "hono";
import * as v from "valibot";
import { getGoal, saveGoal } from "../db/database";
import { getCurrentUser, requireUser } from "../middleware/session";
import type { AppEnv } from "../types";
import { getFieldErrors, getFormText, goalSchema } from "../validation/schemas";
import GoalPage from "../views/GoalPage";

const goalRoutes = new Hono<AppEnv>();

goalRoutes.get("/goal", requireUser, (c) => {
    try {
        const user = getCurrentUser(c);

        const foundGoal = getGoal(c.get("db"), user.id);
        if (!foundGoal) return c.html(<GoalPage user={user} isFirstGoal={true} />, 200);

        const startWeight = String(foundGoal.startWeight);
        const goalWeight = String(foundGoal.goalWeight);
        return c.html(
            <GoalPage user={user} isFirstGoal={false} startWeight={startWeight} goalWeight={goalWeight} />,
            200,
        );
    } catch (error) {
        console.error("Something went wrong, couldn't load the goal: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

goalRoutes.post("/goal", requireUser, async (c) => {
    try {
        const user = getCurrentUser(c);
        const db = c.get("db");
        const form = await c.req.parseBody();

        const result = v.safeParse(goalSchema, form);
        if (!result.success) {
            const isFirstGoal = getGoal(db, user.id) === null;
            return c.html(
                <GoalPage
                    user={user}
                    isFirstGoal={isFirstGoal}
                    startWeight={getFormText(form, "startWeight")}
                    goalWeight={getFormText(form, "goalWeight")}
                    errors={getFieldErrors(result.issues)}
                />,
                400,
            );
        }

        saveGoal(db, user.id, result.output.startWeight, result.output.goalWeight);

        return c.redirect("/", 302);
    } catch (error) {
        console.error("Something went wrong, couldn't save the goal: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

export default goalRoutes;
