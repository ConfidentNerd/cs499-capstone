import type { WeightEntry } from "../types";

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

// Everything in here expects entries are sorted oldest first

// sliding window, O(n) instead of O(n*k)
export function getMovingAverages(entries: WeightEntry[], windowDays = 7): number[] {
    const averages: number[] = [];
    let left = 0;
    let windowSum = 0;

    for (const [right, entry] of entries.entries()) {
        windowSum += entry.weight;

        let oldest = entries[left]!;
        while (oldest.recordedAt <= entry.recordedAt - windowDays * DAY) {
            windowSum -= oldest.weight;
            left++;
            oldest = entries[left]!;
        }

        averages.push(windowSum / (right - left + 1));
    }

    return averages;
}

// binary search, entries are sorted by time
export function findFirstIndexFrom(entries: WeightEntry[], time: number): number {
    let low = 0;
    let high = entries.length;

    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (entries[middle]!.recordedAt < time) low = middle + 1;
        else high = middle;
    }

    return low;
}

// linear regression so one weird reading won't throw the trend off
export function getWeeklyTrend(entries: WeightEntry[], weeks = 4): number | null {
    const latestEntry = entries.at(-1);
    if (!latestEntry) return null;

    const start = findFirstIndexFrom(entries, latestEntry.recordedAt - weeks * WEEK);
    const recent = entries.slice(start);

    // a few entries on the same day would give a crazy slope, so wait until
    // there's a week of data
    const firstEntry = recent[0]!;
    if (latestEntry.recordedAt - firstEntry.recordedAt < WEEK) return null;

    // x in days so the slope comes out per day
    const xs = recent.map((entry) => (entry.recordedAt - firstEntry.recordedAt) / DAY);
    const ys = recent.map((entry) => entry.weight);
    const meanX = xs.reduce((sum, x) => sum + x, 0) / xs.length;
    const meanY = ys.reduce((sum, y) => sum + y, 0) / ys.length;

    let top = 0;
    let bottom = 0;
    for (const [i, x] of xs.entries()) {
        top += (x - meanX) * (ys[i]! - meanY);
        bottom += (x - meanX) * (x - meanX);
    }

    const slopePerDay = top / bottom;
    return slopePerDay * 7;
}

// null when the trend is flat or going the wrong way as a date would make no sense
export function getProjectedGoalDate(
    currentWeight: number,
    goalWeight: number,
    weeklyTrend: number | null,
    from: number,
): number | null {
    if (weeklyTrend === null || weeklyTrend === 0) return null;

    const weeksLeft = (goalWeight - currentWeight) / weeklyTrend;
    if (weeksLeft <= 0) return null;

    return from + weeksLeft * WEEK;
}
