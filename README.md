# cs499-capstone
CS 499 capstone project for my CS degree at SNHU

Other coursework: [cs-degree-portfolio](https://github.com/ConfidentNerd/cs-degree-portfolio)

## Weight Tracker

A responsive web app inspired by the Android weight tracking app I built in CS 360 (Mobile Architecture and Programming). Users create an account, set an initial weight and a target weight, and log their weight to track their progress. Works in any browser, desktop or mobile with nothing to download.

## Run it

Requires [Bun](https://bun.sh) 1.2 or newer.

```bash
bun install
bun run dev # http://localhost:3000
bun test
bun run typecheck
```

The SQLite database is created at `data/tracker.db` first time the app runs.