import { authFetch } from "./api";

export type SearchSegment = { text: string; match: boolean };
export type SearchSnippet = { section: string; segments: SearchSegment[] };
export type SearchHit = {
    pageId: string;
    date: string | null;
    pageNumber: number | null;
    snippets: SearchSnippet[];
};

export type SearchOutcome = { hits: SearchHit[]; error: string | null };

export async function searchAgenda(agendaId: string, query: string, signal?: AbortSignal): Promise<SearchOutcome> {
    try {
        const res = await authFetch(`/api/agendas/${agendaId}/search?q=${encodeURIComponent(query)}`, { signal });
        if (res.ok) return { hits: await res.json(), error: null };
        const error = res.status === 503 ? "Search is temporarily unavailable" : "Search failed";
        return { hits: [], error };
    } catch {
        return { hits: [], error: signal?.aborted ? null : "Search failed" };
    }
}