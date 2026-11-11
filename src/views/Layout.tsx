import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Child } from "hono/jsx";
import { raw } from "hono/html";
import type { User } from "../types";

const styles = readFileSync(join(import.meta.dir, "styles.css"), "utf8");

type LayoutProps = {
    title: string;
    user: User | null;
    children: Child;
};

export default function Layout(props: LayoutProps) {
    return (
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{props.title} - Weight Tracker</title>
                <link rel="icon" href="/logo.png" />
                <style>{raw(styles)}</style>
            </head>
            <body>
                <header>
                    <nav>
                        <a class="brand" href="/">
                            <img src="/logo.png" alt="" width="28" height="28" />
                            Weight Tracker
                        </a>
                        {props.user ? (
                            <>
                                <a href="/goal">Goal</a>
                                <form method="post" action="/logout">
                                    <button class="nav-button" type="submit">
                                        Log out
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <a href="/login">Log in</a>
                                <a href="/signup">Sign up</a>
                            </>
                        )}
                    </nav>
                </header>
                <main>{props.children}</main>
            </body>
        </html>
    );
}
