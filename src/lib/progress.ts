// works for both losing & gaining weight
export function getProgressPercent(startWeight: number, currentWeight: number, goalWeight: number): number {
    const totalDistance = startWeight - goalWeight;
    const distanceCovered = startWeight - currentWeight;
    const percent = (distanceCovered / totalDistance) * 100;

    if (percent < 0) return 0;
    if (percent > 100) return 100;
    return Math.round(percent);
}

export function hasReachedGoal(startWeight: number, currentWeight: number, goalWeight: number): boolean {
    const isLosingWeight = goalWeight < startWeight;

    if (isLosingWeight) return currentWeight <= goalWeight;

    return currentWeight >= goalWeight;
}
