function formatLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, delta: number): string {
    const date = new Date(`${dateStr}T00:00:00`);
    date.setDate(date.getDate() + delta);
    return formatLocal(date);
}

export function todayLocal(): string {
    return formatLocal(new Date());
}

export function formatDateLong(dateStr: string): string {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(`${dateStr}T00:00:00`));
}