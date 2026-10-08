import { describe, expect, it } from "vitest";
import { avatarColor, COVER_COLOR_PRESETS, DEFAULT_COVER_THEME, parseCoverTheme, serializeCoverTheme } from "./coverTheme";

describe("parseCoverTheme", () => {
    it("reads a valid solid theme", () => {
        expect(parseCoverTheme("solid:#a8d8ea")).toEqual({ kind: "solid", color: "#a8d8ea" });
        expect(parseCoverTheme("solid:#A8D8EA")).toEqual({ kind: "solid", color: "#A8D8EA" });
    });

    it("falls back to the default for missing or malformed values", () => {
        expect(parseCoverTheme(null)).toEqual(DEFAULT_COVER_THEME);
        expect(parseCoverTheme(undefined)).toEqual(DEFAULT_COVER_THEME);
        expect(parseCoverTheme("")).toEqual(DEFAULT_COVER_THEME);
        expect(parseCoverTheme("solid:red")).toEqual(DEFAULT_COVER_THEME);
        expect(parseCoverTheme("solid:#abc")).toEqual(DEFAULT_COVER_THEME);
        expect(parseCoverTheme("floral")).toEqual(DEFAULT_COVER_THEME);
    });
});

describe("serializeCoverTheme", () => {
    it("round trips with parseCoverTheme", () => {
        const theme = { kind: "solid" as const, color: "#c7e8c0" };

        expect(serializeCoverTheme(theme)).toBe("solid:#c7e8c0");
        expect(parseCoverTheme(serializeCoverTheme(theme))).toEqual(theme);
    });
});

describe("avatarColor", () => {
    it("always gives the same colour to the same seed", () => {
        expect(avatarColor("lollo@test.com")).toBe(avatarColor("lollo@test.com"));
    });

    it("picks one of the cover colours", () => {
        for (const seed of ["a@b.com", "lollo@test.com", "", "ünïcode@example.org"]) {
            expect(COVER_COLOR_PRESETS).toContain(avatarColor(seed));
        }
    });
});