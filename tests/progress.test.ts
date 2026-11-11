import { describe, expect, test } from "bun:test";
import { getProgressPercent, hasReachedGoal } from "../src/lib/progress";

describe("getProgressPercent", () => {
    test("starts at 0%, (the android app showed 80%)", () => {
        expect(getProgressPercent(100, 100, 80)).toBe(0);
    });

    test("halfway is 50% for losing and gaining", () => {
        expect(getProgressPercent(100, 90, 80)).toBe(50);
        expect(getProgressPercent(60, 65, 70)).toBe(50);
    });

    test("stays between 0 and 100", () => {
        expect(getProgressPercent(100, 105, 80)).toBe(0);
        expect(getProgressPercent(100, 75, 80)).toBe(100);
    });
});

describe("hasReachedGoal", () => {
    test("losing: reached at or below the goal", () => {
        expect(hasReachedGoal(100, 81, 80)).toBe(false);
        expect(hasReachedGoal(100, 80, 80)).toBe(true);
        expect(hasReachedGoal(100, 79, 80)).toBe(true);
    });

    test("gaining: reached at or above the goal", () => {
        expect(hasReachedGoal(60, 69, 70)).toBe(false);
        expect(hasReachedGoal(60, 70, 70)).toBe(true);
    });
});
