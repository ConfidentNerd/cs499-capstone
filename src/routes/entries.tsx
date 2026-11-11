import { Hono } from "hono";
import * as v from "valibot";
import type { Context } from "hono";
import { deleteEntry, getEntry, updateEntry } from "../db/database";
import { getCurrentUser, requireUser } from "../middleware/session";
import type { AppEnv, User, WeightEntry } from "../types";
import { entryIdSchema, entrySchema, getFieldErrors, getFormText } from "../validation/schemas";
import EditEntryPage from "../views/EditEntryPage";

const entryRoutes = new Hono<AppEnv>();

// only finds entries that belong to this user
function findUsersEntry(c: Context<AppEnv>, user: User): WeightEntry | null {
    const entryIdString = c.req.param("id");

    const validation = v.safeParse(entryIdSchema, entryIdString);
    if (!validation.success) return null;

    const entryId = validation.output;
    return getEntry(c.get("db"), user.id, entryId);
}

entryRoutes.get("/entries/:id/edit", requireUser, (c) => {
    try {
        const user = getCurrentUser(c);

        const foundEntry = findUsersEntry(c, user);
        if (!foundEntry) return c.text("Entry not found", 404);

        return c.html(<EditEntryPage user={user} entry={foundEntry} weight={String(foundEntry.weight)} />, 200);
    } catch (error) {
        console.error("Something went wrong, couldn't load the entry: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

entryRoutes.post("/entries/:id", requireUser, async (c) => {
    try {
        const user = getCurrentUser(c);

        const foundEntry = findUsersEntry(c, user);
        if (!foundEntry) return c.text("Entry not found", 404);

        const form = await c.req.parseBody();

        const result = v.safeParse(entrySchema, form);
        if (!result.success) {
            const weight = getFormText(form, "weight");
            const errors = getFieldErrors(result.issues);
            return c.html(<EditEntryPage user={user} entry={foundEntry} weight={weight} errors={errors} />, 400);
        }

        updateEntry(c.get("db"), user.id, foundEntry.id, result.output.weight);

        return c.redirect("/", 302);
    } catch (error) {
        console.error("Something went wrong, couldn't update the entry: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

entryRoutes.post("/entries/:id/delete", requireUser, (c) => {
    try {
        const user = getCurrentUser(c);

        const foundEntry = findUsersEntry(c, user);
        if (!foundEntry) return c.text("Entry not found", 404);

        deleteEntry(c.get("db"), user.id, foundEntry.id);

        return c.redirect("/", 302);
    } catch (error) {
        console.error("Something went wrong, couldn't delete the entry: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

export default entryRoutes;
