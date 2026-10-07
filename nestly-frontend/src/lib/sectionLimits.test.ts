import { describe, expect, it } from "vitest";
import { clampAmount, MAX_AMOUNT } from "./sectionLimits";

describe("clampAmount", () => {
    it("keeps values inside the limits", () => {
        expect(clampAmount(12.5)).toBe(12.5);
        expect(clampAmount(-3)).toBe(-3);
    });

    it("clamps values beyond the limits", () => {
        expect(clampAmount(1e15)).toBe(MAX_AMOUNT);
        expect(clampAmount(-1e15)).toBe(-MAX_AMOUNT);
    });

    it("turns non-finite values into zero", () => {
        expect(clampAmount(Number.NaN)).toBe(0);
        expect(clampAmount(Number.POSITIVE_INFINITY)).toBe(0);
    });
});