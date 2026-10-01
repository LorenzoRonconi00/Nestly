import { authFetch } from "./api";

const DRAFTS_KEY = "nestly_section_drafts";

type Draft = {
    agendaId: string;
    pageId: string;
    sectionId: string;
    data: Record<string, unknown>;
};

function readDrafts(): Record<string, Draft> {
    try {
        return JSON.parse(sessionStorage.getItem(DRAFTS_KEY) ?? "{}");
    } catch {
        return {};
    }
}

function writeDrafts(drafts: Record<string, Draft>) {
    try {
        sessionStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    } catch {
        // storage unavailable or full: the draft is lost, nothing else we can do
    }
}

export function saveDraft(draft: Draft) {
    writeDrafts({ ...readDrafts(), [draft.sectionId]: draft });
}

export async function flushDrafts() {
    const drafts = readDrafts();
    for (const draft of Object.values(drafts)) {
        try {
            const res = await authFetch(
                `/api/agendas/${draft.agendaId}/pages/${draft.pageId}/sections/${draft.sectionId}`,
                { method: "PATCH", body: JSON.stringify({ data: draft.data }) },
            );
            // 4xx means the draft can never succeed (e.g. section deleted): drop it; 5xx keeps it for the next login
            if (res.status < 500) delete drafts[draft.sectionId];
        } catch {
            continue;
        }
    }
    writeDrafts(drafts);
}