import { describe, expect, it } from "vitest";
import { firstValidationMessage } from "./errors";

function jsonResponse(body: unknown, status = 400) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("firstValidationMessage", () => {
    it("returns the message of the first violation", async () => {
        const res = jsonResponse({
            errors: [
                { field: "password", message: "Password is too long" },
                { field: "email", message: "Enter a valid email address" },
            ],
        });

        expect(await firstValidationMessage(res)).toBe("Password is too long");
    });

    it("returns null when the body has no violations", async () => {
        expect(await firstValidationMessage(jsonResponse({ errors: [] }))).toBeNull();
        expect(await firstValidationMessage(jsonResponse({}))).toBeNull();
    });

    it("returns null when the body is not JSON", async () => {
        expect(await firstValidationMessage(new Response("<html>", { status: 400 }))).toBeNull();
    });
});