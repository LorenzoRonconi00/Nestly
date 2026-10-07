import { beforeEach, describe, expect, it, vi } from "vitest";
import { authFetch, SessionExpiredError } from "./api";
import { loadJson } from "./loadJson";

vi.mock("./api", () => ({
    authFetch: vi.fn(),
    SessionExpiredError: class SessionExpiredError extends Error { },
}));

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("loadJson", () => {
    beforeEach(() => {
        vi.mocked(authFetch).mockReset();
    });

    it("returns the parsed body on success", async () => {
        vi.mocked(authFetch).mockResolvedValueOnce(jsonResponse({ id: "a" }));

        expect(await loadJson("/api/agendas/a")).toEqual({ kind: "ok", data: { id: "a" } });
    });

    it("reports 404 and 400 as not found", async () => {
        vi.mocked(authFetch).mockResolvedValueOnce(jsonResponse({}, 404)).mockResolvedValueOnce(jsonResponse({}, 400));

        expect(await loadJson("/a")).toEqual({ kind: "not-found" });
        expect(await loadJson("/b")).toEqual({ kind: "not-found" });
    });

    it("reports server errors and network failures as errors", async () => {
        vi.mocked(authFetch).mockResolvedValueOnce(jsonResponse({}, 503)).mockRejectedValueOnce(new TypeError("Failed to fetch"));

        expect(await loadJson("/a")).toEqual({ kind: "error" });
        expect(await loadJson("/b")).toEqual({ kind: "error" });
    });

    it("reports an unreadable body as an error", async () => {
        vi.mocked(authFetch).mockResolvedValueOnce(new Response("<html>", { status: 200 }));

        expect(await loadJson("/a")).toEqual({ kind: "error" });
    });

    it("lets the caller opt out of the redirect to the login page", async () => {
        vi.mocked(authFetch).mockResolvedValueOnce(jsonResponse({}));

        await loadJson("/a", false);

        expect(authFetch).toHaveBeenCalledWith("/a", {}, false);
    });


    it("reports an expired session separately", async () => {
        vi.mocked(authFetch).mockRejectedValueOnce(new SessionExpiredError());

        expect(await loadJson("/a")).toEqual({ kind: "expired" });
    });
});