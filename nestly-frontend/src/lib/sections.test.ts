import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionExpiredError, authFetch } from "./api";
import { saveDraft } from "./drafts";
import { patchSection } from "./sections";

vi.mock("./api", async (importOriginal) => ({
    ...(await importOriginal<typeof import("./api")>()),
    authFetch: vi.fn(),
}));
vi.mock("./drafts", () => ({ saveDraft: vi.fn() }));

const data = { text: "hello" };

describe("patchSection", () => {
    beforeEach(() => {
        vi.mocked(authFetch).mockReset();
        vi.mocked(saveDraft).mockReset();
    });

    it("sends the section data to the section endpoint", async () => {
        vi.mocked(authFetch).mockResolvedValue(new Response(null, { status: 200 }));

        const result = await patchSection("agenda-1", "page-1", "section-1", data);

        expect(result).toBe("saved");
        const [path, options] = vi.mocked(authFetch).mock.calls[0];
        expect(path).toBe("/api/agendas/agenda-1/pages/page-1/sections/section-1");
        expect(options).toMatchObject({ method: "PATCH", body: JSON.stringify({ data }) });
    });

    it("reports a missing section as stale", async () => {
        vi.mocked(authFetch).mockResolvedValue(new Response(null, { status: 404 }));

        expect(await patchSection("a", "p", "s", data)).toBe("stale");
    });

    it("reports server errors as failed", async () => {
        vi.mocked(authFetch).mockResolvedValue(new Response(null, { status: 500 }));

        expect(await patchSection("a", "p", "s", data)).toBe("failed");
    });

    it("reports network errors as failed", async () => {
        vi.mocked(authFetch).mockRejectedValue(new TypeError("network"));

        expect(await patchSection("a", "p", "s", data)).toBe("failed");
        expect(saveDraft).not.toHaveBeenCalled();
    });

    it("keeps a draft when the session has expired", async () => {
        vi.mocked(authFetch).mockRejectedValue(new SessionExpiredError());

        const result = await patchSection("agenda-1", "page-1", "section-1", data);

        expect(result).toBe("expired");
        expect(saveDraft).toHaveBeenCalledWith({
            agendaId: "agenda-1",
            pageId: "page-1",
            sectionId: "section-1",
            data,
        });
    });
});