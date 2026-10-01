import { authFetch, SessionExpiredError } from "./api";
import { saveDraft } from "./drafts";

export async function patchSection(
    agendaId: string,
    pageId: string,
    sectionId: string,
    data: Record<string, unknown>,
) {
    try {
        await authFetch(`/api/agendas/${agendaId}/pages/${pageId}/sections/${sectionId}`, {
            method: "PATCH",
            body: JSON.stringify({ data }),
        });
    } catch (err) {
        if (!(err instanceof SessionExpiredError)) throw err;
        saveDraft({ agendaId, pageId, sectionId, data });
    }
}