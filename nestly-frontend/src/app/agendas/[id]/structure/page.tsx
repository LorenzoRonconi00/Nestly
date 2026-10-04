"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authFetch, ignoreSessionExpired } from "@/lib/api";

const SECTION_TYPES = [
    { value: "expenses", label: "Expenses" },
    { value: "checklist", label: "Checklist" },
    { value: "mood", label: "Mood" },
    { value: "freetext", label: "Free text" },
    { value: "appointments", label: "Appointments" },
];

type SectionItem = { type: string; order: number };
type DataLoss = { type: string; pageCount: number };

function labelFor(type: string) {
    return SECTION_TYPES.find((t) => t.value === type)?.label ?? type;
}

export default function StructurePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingLoss, setPendingLoss] = useState<DataLoss[] | null>(null);

    useEffect(() => {
        authFetch(`/api/agendas/${params.id}`)
            .catch(ignoreSessionExpired)
            .then((res) => (res?.ok ? res.json() : null))
            .then((data) => {
                if (data?.sections) setSections(data.sections);
            })
            .finally(() => setLoading(false));
    }, [params.id]);

    function changeSections(next: SectionItem[]) {
        setSections(next);
        setPendingLoss(null);
    }

    function addSection(type: string) {
        if (sections.some((s) => s.type === type)) return;
        changeSections([...sections, { type, order: sections.length + 1 }]);
    }

    function removeSection(type: string) {
        const filtered = sections.filter((s) => s.type !== type);
        changeSections(filtered.map((s, i) => ({ ...s, order: i + 1 })));
    }

    function moveSection(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= sections.length) return;
        const reordered = [...sections];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        changeSections(reordered.map((s, i) => ({ ...s, order: i + 1 })));
    }

    async function save(confirmDataLoss: boolean) {
        setError(null);
        const res = await authFetch(`/api/agendas/${params.id}/structure-template`, {
            method: "PATCH",
            body: JSON.stringify({ sections, confirmDataLoss }),
        }).catch(ignoreSessionExpired);
        if (!res) return;
        if (res.status === 409) {
            const body = await res.json();
            setPendingLoss(body.sections);
            return;
        }
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
                            <span>{labelFor(s.type)}</span>
                            <div className="flex gap-1">
                                <button onClick={() => moveSection(i, -1)} disabled={i === 0}>↑</button>
                                <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}>↓</button>
                                <button onClick={() => removeSection(s.type)}>✕</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {pendingLoss && (
                <div role="alert" className="flex w-full max-w-sm flex-col gap-2 rounded border border-red-300 p-3">
                    <p className="text-sm font-medium">
                        These sections contain data that will be permanently deleted:
                    </p>
                    <ul className="text-sm">
                        {pendingLoss.map((loss) => (
                            <li key={loss.type}>
                                {labelFor(loss.type)}: {loss.pageCount} {loss.pageCount === 1 ? "page" : "pages"}
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2">
                        <button
                            onClick={() => save(true)}
                            className="cursor-pointer rounded bg-black px-3 py-1 text-white"
                        >
                            Delete and save
                        </button>
                        <button
                            onClick={() => setPendingLoss(null)}
                            className="cursor-pointer rounded border px-3 py-1"
                        >
                            Keep editing
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => save(false)}
                disabled={sections.length === 0}
                className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
            >
                Confirm
            </button>
            <Link href={`/agendas/${params.id}`} className="text-sm underline">
                Back to agenda
            </Link>
        </main>
    );
}