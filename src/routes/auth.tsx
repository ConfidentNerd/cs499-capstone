import { Hono } from "hono";
import * as v from "valibot";
import { createUser, findUserByUsername } from "../db/database";
import { endSession, startSession } from "../middleware/session";
import type { AppEnv } from "../types";
import { getFieldErrors, getFormText, logInSchema, signUpSchema } from "../validation/schemas";
import AuthPage from "../views/AuthPage";

const authRoutes = new Hono<AppEnv>();

authRoutes.get("/signup", (c) => {
    return c.html(<AuthPage mode="signup" />, 200);
});

authRoutes.post("/signup", async (c) => {
    try {
        const form = await c.req.parseBody();

        const result = v.safeParse(signUpSchema, form);
        if (!result.success) {
            const errors = getFieldErrors(result.issues);
            return c.html(<AuthPage mode="signup" username={getFormText(form, "username")} errors={errors} />, 400);
        }

        const { username, password } = result.output;
        const db = c.get("db");

        const foundUser = findUserByUsername(db, username);
        if (foundUser) {
            const errors = { username: "That username is taken" };
            return c.html(<AuthPage mode="signup" username={username} errors={errors} />, 400);
        }

        const passwordHash = await Bun.password.hash(password);

        const user = createUser(db, username, passwordHash);
        startSession(c, user.id);

        return c.redirect("/goal", 302);
    } catch (error) {
        console.error("Something went wrong, couldn't sign up the user: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

authRoutes.get("/login", (c) => {
    return c.html(<AuthPage mode="login" />, 200);
});

authRoutes.post("/login", async (c) => {
    try {
        const form = await c.req.parseBody();

        const result = v.safeParse(logInSchema, form);
        if (!result.success) {
            const errors = getFieldErrors(result.issues);
            return c.html(<AuthPage mode="login" username={getFormText(form, "username")} errors={errors} />, 400);
        }

        const { username, password } = result.output;
        const foundUser = findUserByUsername(c.get("db"), username);

        if (!foundUser) {
            const errors = { username: "No account with that username" };
            return c.html(<AuthPage mode="login" username={username} errors={errors} />, 401);
        }

        const passwordIsCorrect = await Bun.password.verify(password, foundUser.passwordHash);
        if (!passwordIsCorrect) {
            const errors = { password: "Wrong password" };
            return c.html(<AuthPage mode="login" username={username} errors={errors} />, 401);
        }

        startSession(c, foundUser.id);

        return c.redirect("/", 302);
    } catch (error) {
        console.error("Something went wrong, couldn't log in the user: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

authRoutes.post("/logout", (c) => {
    try {
        endSession(c);
        return c.redirect("/login", 302);
    } catch (error) {
        console.error("Something went wrong, couldn't log out the user: " + error);
        return c.text("Something went wrong. Please try again.", 500);
    }
});

export default authRoutes;
