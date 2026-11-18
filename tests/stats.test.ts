import { describe, expect, test } from "bun:test";
import { findFirstIndexFrom, getMovingAverages, getProjectedGoalDate, getWeeklyTrend } from "../src/lib/stats";
import type { WeightEntry } from "../src/types";

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

// [day, weight] pairs -> entries
function makeEntries(points: [number, number][]): WeightEntry[] {
    return points.map(([day, weight], i) => ({ id: i + 1, weight, recordedAt: day * DAY }));
}

describe("getMovingAverages", () => {
    test("averages everything while there's less than 7 days", () => {
        const entries = makeEntries([
            [0, 100],
            [1, 98],
            [2, 96],
        ]);
        expect(getMovingAverages(entries)).toEqual([100, 99, 98]);
    });

    test("drops entries once they're 7 days old", () => {
        const entries = makeEntries([
            [0, 100],
            [3, 90],
            [7, 80], // day 0 leaves the window here
        ]);
        expect(getMovingAverages(entries)).toEqual([100, 95, 85]);
    });

    test("multiple entries on the same day", () => {
        const entries = makeEntries([
            [0, 100],
            [0, 102],
            [8, 90],
        ]);
        expect(getMovingAverages(entries)).toEqual([100, 101, 90]);
    });

    test("no entries", () => {
        expect(getMovingAverages([])).toEqual([]);
    });
});

describe("findFirstIndexFrom", () => {
    const entries = makeEntries([
        [0, 100],
        [5, 99],
        [5, 98],
        [10, 97],
    ]);

    test("finds the first entry at or after the time", () => {
        expect(findFirstIndexFrom(entries, 5 * DAY)).toBe(1);
        expect(findFirstIndexFrom(entries, 6 * DAY)).toBe(3);
    });

    test("before the first and after the last entry", () => {
        expect(findFirstIndexFrom(entries, -DAY)).toBe(0);
        expect(findFirstIndexFrom(entries, 11 * DAY)).toBe(4);
    });
});

describe("getWeeklyTrend", () => {
    test("1 a day down is -7 a week", () => {
        const entries = makeEntries([
            [0, 100],
            [7, 93],
            [14, 86],
        ]);
        expect(getWeeklyTrend(entries)).toBeCloseTo(-7);
    });

    test("only uses the last 4 weeks", () => {
        const entries = makeEntries([
            [0, 150], // more than 4 weeks before the latest, ignored
            [30, 100],
            [37, 101],
            [44, 102],
        ]);
        expect(getWeeklyTrend(entries)).toBeCloseTo(1);
    });

    test("null with less than a week of data", () => {
        const entries = makeEntries([
            [0, 100],
            [0, 98],
            [3, 97],
        ]);
        expect(getWeeklyTrend(entries)).toBeNull();
        expect(getWeeklyTrend([])).toBeNull();
    });
});

describe("getProjectedGoalDate", () => {
    test("losing 2 a week with 10 left is 5 weeks away", () => {
        expect(getProjectedGoalDate(90, 80, -2, 0)).toBe(5 * WEEK);
    });

    test("no date for a flat trend or going the wrong way", () => {
        expect(getProjectedGoalDate(90, 80, 0, 0)).toBeNull();
        expect(getProjectedGoalDate(90, 80, 1, 0)).toBeNull();
        expect(getProjectedGoalDate(90, 80, null, 0)).toBeNull();
    });
});
