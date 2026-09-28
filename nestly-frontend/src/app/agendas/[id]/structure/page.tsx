"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

const SECTION_TYPES = [
    { value: "expenses", label: "Expenses" },
    { value: "checklist", label: "Checklist" },
    { value: "mood", label: "Mood" },
    { value: "freetext", label: "Free text" },
    { value: "appointments", label: "Appointments" },
];

type SectionItem = { type: string; order: number };

export default function StructurePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        apiFetch(`/api/agendas/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.sections) setSections(data.sections);
            })
            .finally(() => setLoading(false));
    }, [params.id, router]);

    function addSection(type: string) {
        if (sections.some((s) => s.type === type)) return;
        setSections([...sections, { type, order: sections.length + 1 }]);
    }

    function removeSection(type: string) {
        const filtered = sections.filter((s) => s.type !== type);
        setSections(filtered.map((s, i) => ({ ...s, order: i + 1 })));
    }

    function moveSection(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= sections.length) return;
        const reordered = [...sections];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        setSections(reordered.map((s, i) => ({ ...s, order: i + 1 })));
    }

    async function handleConfirm() {
        setError(null);
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        const res = await apiFetch(`/api/agendas/${params.id}/structure-template`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ sections }),
        });
        if (!res.ok) {
            setError("Could not save structure");
            return;
        }
        router.push(`/agendas/${params.id}`);
    }

    if (loading) return null;

    const activeTypes = new Set(sections.map((s) => s.type));

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6">
            <h1 className="text-2xl font-semibold">Page structure</h1>
            {error && <p className="text-red-600">{error}</p>}

            <div className="flex w-full max-w-sm flex-col gap-2">
                <h2 className="text-sm font-medium">Available sections</h2>
                <div className="flex flex-wrap gap-2">
                    {SECTION_TYPES.filter((t) => !activeTypes.has(t.value)).map((t) => (
                        <button
                            key={t.value}
                            onClick={() => addSection(t.value)}
                            className="rounded border px-3 py-1"
                        >
                            + {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-2">
                <h2 className="text-sm font-medium">Active sections</h2>
                {sections.length === 0 && <p className="text-sm text-gray-500">No sections yet</p>}
                <ul className="flex flex-col gap-2">
                    {sections.map((s, i) => (
                        <li key={s.type} className="flex items-center justify-between rounded border px-3 py-2">
                            <span>{SECTION_TYPES.find((t) => t.value === s.type)?.label ?? s.type}</span>
                            <div className="flex gap-1">
                                <button onClick={() => moveSection(i, -1)} disabled={i === 0}>↑</button>
                                <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}>↓</button>
                                <button onClick={() => removeSection(s.type)}>✕</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                onClick={handleConfirm}
                disabled={sections.length === 0}
                className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
            >
                Confirm
            </button>
        </main>
    );
}