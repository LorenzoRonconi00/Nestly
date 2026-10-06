import { authFetch, SessionExpiredError } from "./api";
import { saveDraft } from "./drafts";

export type SaveResult = "saved" | "stale" | "failed" | "expired";

export async function patchSection(
    agendaId: string,
    pageId: string,
    sectionId: string,
    data: Record<string, unknown>,
): Promise<SaveResult> {
    try {
        const res = await authFetch(`/api/agendas/${agendaId}/pages/${pageId}/sections/${sectionId}`, {
            method: "PATCH",
            body: JSON.stringify({ data }),
        });
        if (res.ok) return "saved";
        return res.status === 404 ? "stale" : "failed";
    } catch (err) {
        if (err instanceof SessionExpiredError) {
            saveDraft({ agendaId, pageId, sectionId, data });
            return "expired";
        }
        return "failed";
    }
}