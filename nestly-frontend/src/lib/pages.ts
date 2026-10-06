import { authFetch } from "./api";
import type { Section } from "@/components/PageSections";

export type PageData = { id: string; date: string | null; pageNumber: number | null; sections: Section[] };

export async function fetchDateRange(agendaId: string, from: string, count: number): Promise<PageData[] | null> {
    const res = await authFetch(`/api/agendas/${agendaId}/pages/by-date-range?from=${from}&count=${count}`);
    return res.ok ? res.json() : null;
}

export async function fetchNumberRange(agendaId: string, from: number, count: number): Promise<PageData[] | null> {
    const res = await authFetch(`/api/agendas/${agendaId}/pages/by-number-range?from=${from}&count=${count}`);
    return res.ok ? res.json() : null;
}

export async function fetchDaysWithContent(agendaId: string, month: string): Promise<string[]> {
    try {
        const res = await authFetch(`/api/agendas/${agendaId}/pages/days-with-content?month=${month}`);
        return res.ok ? res.json() : [];
    } catch {
        return [];
    }
}