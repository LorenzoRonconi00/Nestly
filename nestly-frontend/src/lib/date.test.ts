import { describe, expect, it, vi } from "vitest";
import { addDays, addMonths, buildMonthGrid, formatDateLong, monthOf, todayLocal } from "./date";

describe("addDays", () => {
    it("moves across month and year boundaries", () => {
        expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
        expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
        expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    });

    it("handles leap years", () => {
        expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
        expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
    });

    it("keeps whole days across the daylight saving changes", () => {
        expect(addDays("2026-03-28", 1)).toBe("2026-03-29");
        expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
        expect(addDays("2026-10-24", 1)).toBe("2026-10-25");
        expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
    });

    it("moves by several days in both directions", () => {
        expect(addDays("2026-10-04", 2)).toBe("2026-10-06");
        expect(addDays("2026-10-04", -4)).toBe("2026-09-30");
    });
});

describe("todayLocal", () => {
    it("uses the local calendar day, not the UTC one", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 15, 0, 30));

        expect(todayLocal()).toBe("2026-06-15");
    });
});

describe("formatDateLong", () => {
    it("writes the weekday, day, month and year", () => {
        expect(formatDateLong("2026-10-04")).toMatch(/Sunday,? 4 October 2026/);
    });
});

describe("month helpers", () => {
    it("extracts the month of a date", () => {
        expect(monthOf("2026-10-04")).toBe("2026-10");
    });

    it("adds and subtracts months across years", () => {
        expect(addMonths("2026-12", 1)).toBe("2027-01");
        expect(addMonths("2026-01", -1)).toBe("2025-12");
        expect(addMonths("2026-10", 0)).toBe("2026-10");
        expect(addMonths("2026-10", 14)).toBe("2027-12");
    });
});

describe("buildMonthGrid", () => {
    it("always has six weeks starting on Monday", () => {
        const grid = buildMonthGrid("2026-10");

        expect(grid).toHaveLength(42);
        expect(grid[0].date).toBe("2026-09-28");
        expect(new Date(`${grid[0].date}T00:00:00`).getDay()).toBe(1);
        expect(grid[41].date).toBe("2026-11-08");
    });

    it("flags only the days of the requested month", () => {
        const grid = buildMonthGrid("2026-10");
        const inMonth = grid.filter((cell) => cell.inMonth);

        expect(inMonth).toHaveLength(31);
        expect(inMonth[0].date).toBe("2026-10-01");
        expect(inMonth[30].date).toBe("2026-10-31");
    });

    it("starts the grid on the first when the month begins on a Monday", () => {
        const grid = buildMonthGrid("2026-06");

        expect(grid[0].date).toBe("2026-06-01");
        expect(grid[0].inMonth).toBe(true);
    });

    it("has unique dates", () => {
        const dates = buildMonthGrid("2026-02").map((cell) => cell.date);

        expect(new Set(dates).size).toBe(42);
    });
});