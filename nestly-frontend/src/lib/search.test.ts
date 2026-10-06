import { beforeEach, describe, expect, it, vi } from "vitest";
import { authFetch } from "./api";
import { searchAgenda } from "./search";

vi.mock("./api", () => ({ authFetch: vi.fn() }));

const hits = [{ pageId: "p1", date: "2026-10-04", pageNumber: null, snippets: [] }];

describe("searchAgenda", () => {
    beforeEach(() => {
        vi.mocked(authFetch).mockReset();
    });

    it("sends the encoded query to the agenda search endpoint and returns the hits", async () => {
        vi.mocked(authFetch).mockResolvedValue(new Response(JSON.stringify(hits), { status: 200 }));

        const outcome = await searchAgenda("agenda-1", "caffè & latte?");

        expect(outcome).toEqual({ hits, error: null });
        expect(vi.mocked(authFetch).mock.calls[0][0]).toBe(
            `/api/agendas/agenda-1/search?q=${encodeURIComponent("caffè & latte?")}`,
        );
    });

    it("reports an unavailable search service", async () => {
        vi.mocked(authFetch).mockResolvedValue(new Response(null, { status: 503 }));

        expect(await searchAgenda("a", "x")).toEqual({ hits: [], error: "Search is temporarily unavailable" });
    });

    it("reports other failures with a generic message", async () => {
        vi.mocked(authFetch).mockResolvedValue(new Response(null, { status: 500 }));

        expect(await searchAgenda("a", "x")).toEqual({ hits: [], error: "Search failed" });
    });

    it("reports network errors", async () => {
        vi.mocked(authFetch).mockRejectedValue(new TypeError("network"));

        expect(await searchAgenda("a", "x")).toEqual({ hits: [], error: "Search failed" });
    });

    it("stays silent when the request was cancelled on purpose", async () => {
        const controller = new AbortController();
        controller.abort();
        vi.mocked(authFetch).mockRejectedValue(new DOMException("aborted", "AbortError"));

        expect(await searchAgenda("a", "x", controller.signal)).toEqual({ hits: [], error: null });
    });
});