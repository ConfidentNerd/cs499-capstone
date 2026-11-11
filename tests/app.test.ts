import type { Database } from "bun:sqlite";
import { beforeEach, describe, expect, test } from "bun:test";
import { createApp } from "../src/app";
import { createDatabase } from "../src/db/database";

let db: Database;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
    db = createDatabase(":memory:");
    app = createApp(db);
});

function get(path: string, cookie = "") {
    return app.request(path, { headers: { Cookie: cookie } });
}

function post(path: string, fields: Record<string, string>, cookie = "") {
    return app.request(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookie,
        },
        body: new URLSearchParams(fields).toString(),
    });
}

// sign up and set a 100 -> 80 goal, returns the session cookie
async function signUp(username: string): Promise<string> {
    const response = await post("/signup", { username, password: "password123" });
    const setCookie = response.headers.get("set-cookie") ?? "";
    const cookie = setCookie.split(";")[0] ?? ""; // just the session=... part
    await post("/goal", { startWeight: "100", goalWeight: "80" }, cookie);
    return cookie;
}

describe("accounts and sessions", () => {
    test("logged out users go to login", async () => {
        const response = await get("/");
        expect(response.status).toBe(302);
        expect(response.headers.get("location")).toBe("/login");
    });

    test("new users set a goal first", async () => {
        const response = await post("/signup", { username: "new_user", password: "password123" });
        expect(response.headers.get("location")).toBe("/goal");
    });

    test("passwords are hashed", async () => {
        await signUp("alice");
        const row = db.query("SELECT password_hash FROM users").get() as { password_hash: string };
        expect(row.password_hash).not.toBe("password123");
    });

    test("a wrong password shows an error", async () => {
        await signUp("alice");
        const response = await post("/login", { username: "alice", password: "wrong-password" });
        expect(response.status).toBe(401);
        expect(await response.text()).toContain("Wrong password");
    });

    test("logout clears the session cookie", async () => {
        const cookie = await signUp("alice");
        const response = await post("/logout", {}, cookie);
        expect(response.headers.get("location")).toBe("/login");
        expect(response.headers.get("set-cookie")).toContain("session=;");
    });
});

describe("entries and dashboard", () => {
    test("invalid weight shows an error", async () => {
        const cookie = await signUp("alice");
        const response = await post("/entries", { weight: "5" }, cookie);
        expect(response.status).toBe(400);
        expect(await response.text()).toContain("Weight must be at least 20");
    });

    test("add, edit and delete an entry", async () => {
        const cookie = await signUp("alice");

        await post("/entries", { weight: "95" }, cookie);
        expect(await (await get("/", cookie)).text()).toContain("95.0");

        await post("/entries/1", { weight: "94.5" }, cookie);
        expect(await (await get("/", cookie)).text()).toContain("94.5");

        await post("/entries/1/delete", {}, cookie);
        expect(await (await get("/", cookie)).text()).toContain("No entries yet");
    });

    test("can't edit or delete another user's entry", async () => {
        const alice = await signUp("alice");
        const bob = await signUp("bob");
        await post("/entries", { weight: "95" }, alice); // Entry 1 belongs to alice

        expect((await get("/entries/1/edit", bob)).status).toBe(404);
        expect((await post("/entries/1", { weight: "50" }, bob)).status).toBe(404);
        expect((await post("/entries/1/delete", {}, bob)).status).toBe(404);
        expect(await (await get("/", alice)).text()).toContain("95.0");
    });

    test("progress resets after deleting every entry", async () => {
        const cookie = await signUp("alice");
        await post("/entries", { weight: "90" }, cookie);
        expect(await (await get("/", cookie)).text()).toContain("50% of the way");

        await post("/entries/1/delete", {}, cookie);
        expect(await (await get("/", cookie)).text()).toContain("0% of the way");
    });

    test("reaching the goal shows a banner", async () => {
        const cookie = await signUp("alice");
        await post("/entries", { weight: "85" }, cookie);
        expect(await (await get("/", cookie)).text()).not.toContain("You reached your goal");

        await post("/entries", { weight: "79.5" }, cookie);
        expect(await (await get("/", cookie)).text()).toContain("You reached your goal of 80.0!");
    });
});
