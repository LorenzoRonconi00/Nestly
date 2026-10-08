import { describe, expect, it } from "vitest";
import { firstViolation } from "./errors";

function jsonResponse(body: unknown, status = 400) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("firstViolation", () => {
    it("returns the field and message of the first violation", async () => {
        const res = jsonResponse({
            errors: [
                { field: "password", message: "Password is too long" },
                { field: "email", message: "Enter a valid email address" },
            ],
        });

        expect(await firstViolation(res)).toEqual({ field: "password", message: "Password is too long" });
    });

    it("returns null when the body has no violations", async () => {
        expect(await firstViolation(jsonResponse({ errors: [] }))).toBeNull();
        expect(await firstViolation(jsonResponse({}))).toBeNull();
    });

    it("returns null when the body is not JSON", async () => {
        expect(await firstViolation(new Response("<html>", { status: 400 }))).toBeNull();
    });
});