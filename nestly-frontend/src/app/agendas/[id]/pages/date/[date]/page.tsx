"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { addDays } from "@/lib/date";
import { PageSections, type Section } from "@/components/PageSections";

type PageData = { id: string; date: string | null; pageNumber: number | null; sections: Section[] };

export default function DatePageView() {
    const params = useParams<{ id: string; date: string }>();
    const router = useRouter();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        apiFetch(`/api/agendas/${params.id}/pages/by-date/${params.date}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then(setPage)
            .finally(() => setLoading(false));
    }, [params.id, params.date, router]);

    async function saveSectionData(sectionId: string, data: Record<string, unknown>) {
        const token = getToken();
        if (!token || !page) return;
        await apiFetch(`/api/agendas/${params.id}/pages/${page.id}/sections/${sectionId}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ data }),
        });
    }

    if (loading) return null;
    if (!page) return <p className="p-8">Page not found</p>;

    return (
        <main className="flex min-h-screen flex-col items-center gap-6 py-12">
            <h1 className="text-2xl font-semibold">{page.date}</h1>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push(`/agendas/${params.id}/pages/date/${addDays(params.date, -1)}`)}
                    className="rounded border px-3 py-1"
                >
                    ← Previous day
                </button>
                <button
                    onClick={() => router.push(`/agendas/${params.id}/pages/date/${addDays(params.date, 1)}`)}
                    className="rounded border px-3 py-1"
                >
                    Next day →
                </button>
            </div>
            <PageSections sections={page.sections} onSaveSection={saveSectionData} />
        </main>
    );
}