"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { PageSections, type Section } from "@/components/PageSections";
import { patchSection } from "@/lib/sections";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { usePageReady } from "@/components/opening/OpeningProvider";

type PageData = { id: string; date: string | null; pageNumber: number | null; sections: Section[] };

export default function NumberPageView() {
    const params = useParams<{ id: string; number: string }>();
    const router = useRouter();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    usePageReady(!loading);

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
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-8">
            <TextLink href={`/agendas/${params.id}`} className="text-sm">
                ← Back to agenda
            </TextLink>
            <h1 className="font-hand text-3xl">Page {page.pageNumber}</h1>
            <div className="flex items-center gap-3">
                <Button
                    variant="secondary"
                    onClick={() => router.push(`/agendas/${params.id}/pages/number/${Math.max(1, currentNumber - 1)}`)}
                    disabled={currentNumber <= 1}
                >
                    ← Previous page
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => router.push(`/agendas/${params.id}/pages/number/${currentNumber + 1}`)}
                >
                    Next page →
                </Button>
            </div>
            <PageSections sections={page.sections} onSaveSection={saveSectionData} />
        </main>
    );
}