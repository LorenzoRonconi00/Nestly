import { describe, expect, it } from "vitest";
import { DEFAULT_COVER_THEME, parseCoverTheme, serializeCoverTheme } from "./coverTheme";

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