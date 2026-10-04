"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { addDays, formatDateLong } from "@/lib/date";
import { PageSections, type Section } from "@/components/PageSections";
import { patchSection } from "@/lib/sections";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";

type PageData = { id: string; date: string | null; pageNumber: number | null; sections: Section[] };

export default function DatePageView() {
    const params = useParams<{ id: string; date: string }>();
    const router = useRouter();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authFetch(`/api/agendas/${params.id}/pages/by-date/${params.date}`)
            .catch(ignoreSessionExpired)
            .then((res) => (res?.ok ? res.json() : null))
            .then(setPage)
            .finally(() => setLoading(false));
    }, [params.id, params.date]);

    async function saveSectionData(sectionId: string, data: Record<string, unknown>) {
        if (!page) return;
        await patchSection(params.id, page.id, sectionId, data);
    }

    if (loading) return null;
    if (!page) return <p className="p-8">Page not found</p>;

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-8">
            <TextLink href={`/agendas/${params.id}`} className="text-sm">
                ← Back to agenda
            </TextLink>
            <h1 className="font-hand text-3xl">{formatDateLong(params.date)}</h1>
            <div className="flex items-center gap-3">
                <Button
                    variant="secondary"
                    onClick={() => router.push(`/agendas/${params.id}/pages/date/${addDays(params.date, -1)}`)}
                >
                    ← Previous day
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => router.push(`/agendas/${params.id}/pages/date/${addDays(params.date, 1)}`)}
                >
                    Next day →
                </Button>
            </div>
            <PageSections sections={page.sections} onSaveSection={saveSectionData} />
        </main>
    );
}