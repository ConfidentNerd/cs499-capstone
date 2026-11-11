import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createSession, findUserBySession } from "../db/database";
import type { AppEnv, User } from "../types";

const COOKIE_NAME = "session";
const SESSION_LENGTH_MS = 8 * 60 * 60 * 1000; // 8 hours

export function startSession(c: Context<AppEnv>, userId: number): void {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + SESSION_LENGTH_MS;
    createSession(c.get("db"), token, userId, expiresAt);

    setCookie(c, COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production", // no https in localhost
        path: "/",
        maxAge: SESSION_LENGTH_MS / 1000, // in seconds
    });
}

export function endSession(c: Context<AppEnv>): void {
    deleteCookie(c, COOKIE_NAME, { path: "/" });
}

export const loadUser: MiddlewareHandler<AppEnv> = async (c, next) => {
    const token = getCookie(c, COOKIE_NAME);
    let user: User | null = null;
    if (token) user = findUserBySession(c.get("db"), token, Date.now());

    c.set("user", user);
    await next();
};

export const requireUser: MiddlewareHandler<AppEnv> = async (c, next) => {
    if (c.get("user") === null) {
        return c.redirect("/login");
    }
    await next();
};

// only use after requireUser
export function getCurrentUser(c: Context<AppEnv>): User {
    const user = c.get("user");
    if (!user) throw new Error("getCurrentUser was used on a route without requireUser");

    return user;
}
