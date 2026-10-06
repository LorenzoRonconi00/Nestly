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

export function monthOf(dateStr: string): string {
    return dateStr.slice(0, 7);
}

export function addMonths(month: string, delta: number): string {
    const [year, monthNumber] = month.split("-").map(Number);
    const date = new Date(year, monthNumber - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLong(month: string): string {
    return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
        new Date(`${month}-01T00:00:00`),
    );
}

export function buildMonthGrid(month: string): { date: string; inMonth: boolean }[] {
    const first = `${month}-01`;
    const offset = (new Date(`${first}T00:00:00`).getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
        const date = addDays(first, index - offset);
        return { date, inMonth: date.startsWith(month) };
    });
}