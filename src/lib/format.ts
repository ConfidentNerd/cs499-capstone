export function formatWeight(weight: number): string {
    return weight.toFixed(1);
}

function twoDigits(value: number): string {
    return String(value).padStart(2, "0");
}

// Uses the server's time zone
export function formatDateTime(milliseconds: number): string {
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = twoDigits(date.getMonth() + 1); // months start at 0
    const day = twoDigits(date.getDate());
    const hours = twoDigits(date.getHours());
    const minutes = twoDigits(date.getMinutes());
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
