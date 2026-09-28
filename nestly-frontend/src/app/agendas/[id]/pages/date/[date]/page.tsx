"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { FreetextSection } from "@/components/sections/FreetextSection";
import { ExpensesSection } from "@/components/sections/ExpensesSection";
import { ChecklistSection } from "@/components/sections/ChecklistSection";
import { MoodSection } from "@/components/sections/MoodSection";
import { AppointmentsSection } from "@/components/sections/AppointmentsSection";

type Section = { id: string; type: string; order: number; data: Record<string, unknown> };
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
            <div className="flex w-full max-w-md flex-col gap-4">
                {page.sections
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                        <SectionRenderer
                            key={section.id}
                            section={section}
                            onSave={(data) => saveSectionData(section.id, data)}
                        />
                    ))}
            </div>
        </main>
    );
}

function SectionRenderer({
    section,
    onSave,
}: {
    section: Section;
    onSave: (data: Record<string, unknown>) => void;
}) {
    switch (section.type) {
        case "freetext":
            return <FreetextSection initialData={section.data} onSave={onSave} />;
        case "expenses":
            return <ExpensesSection initialData={section.data} onSave={onSave} />;
        case "checklist":
            return <ChecklistSection initialData={section.data} onSave={onSave} />;
        case "mood":
            return <MoodSection initialData={section.data} onSave={onSave} />;
        case "appointments":
            return <AppointmentsSection initialData={section.data} onSave={onSave} />;
        default:
            return <p className="rounded border p-3 text-sm text-gray-500">Unknown section type: {section.type}</p>;
    }
}