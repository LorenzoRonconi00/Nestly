"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { PageSections, type Section } from "@/components/PageSections";
import { patchSection } from "@/lib/sections";

type PageData = { id: string; date: string | null; pageNumber: number | null; sections: Section[] };

export default function NumberPageView() {
    const params = useParams<{ id: string; number: string }>();
    const router = useRouter();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authFetch(`/api/agendas/${params.id}/pages/by-number/${params.number}`)
            .catch(ignoreSessionExpired)
            .then((res) => (res?.ok ? res.json() : null))
            .then(setPage)
            .finally(() => setLoading(false));
    }, [params.id, params.number]);

    async function saveSectionData(sectionId: string, data: Record<string, unknown>) {
        if (!page) return;
        await patchSection(params.id, page.id, sectionId, data);
    }

    if (loading) return null;
    if (!page) return <p className="p-8">Page not found</p>;

    const currentNumber = Number(params.number);

    return (
        <main className="flex min-h-screen flex-col items-center gap-6 py-12">
            <h1 className="text-2xl font-semibold">Page {page.pageNumber}</h1>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push(`/agendas/${params.id}/pages/number/${Math.max(1, currentNumber - 1)}`)}
                    disabled={currentNumber <= 1}
                    className="rounded border px-3 py-1 disabled:opacity-50"
                >
                    ← Previous page
                </button>
                <button
                    onClick={() => router.push(`/agendas/${params.id}/pages/number/${currentNumber + 1}`)}
                    className="rounded border px-3 py-1"
                >
                    Next page →
                </button>
            </div>
            <PageSections sections={page.sections} onSaveSection={saveSectionData} />
        </main>
    );
}