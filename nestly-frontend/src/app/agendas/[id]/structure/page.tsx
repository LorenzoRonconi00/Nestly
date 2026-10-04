"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextLink } from "@/components/ui/TextLink";

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
        <main className="flex min-h-screen items-center justify-center px-4 py-8">
            <Card className="flex w-full max-w-sm flex-col gap-5">
                <h1 className="text-2xl font-bold">Page structure</h1>
                {error && (
                    <p role="alert" className="text-sm text-danger">
                        {error}
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold">Available sections</h2>
                    <div className="flex flex-wrap gap-2">
                        {SECTION_TYPES.filter((t) => !activeTypes.has(t.value)).map((t) => (
                            <Button key={t.value} variant="secondary" size="sm" onClick={() => addSection(t.value)}>
                                + {t.label}
                            </Button>
                        ))}
                        {activeTypes.size === SECTION_TYPES.length && (
                            <p className="text-sm text-ink-soft">All sections are in use</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold">Active sections</h2>
                    {sections.length === 0 && <p className="text-sm text-ink-soft">No sections yet</p>}
                    <ul className="flex flex-col gap-2">
                        {sections.map((s, i) => (
                            <li
                                key={s.type}
                                className="flex items-center justify-between rounded-xl border bg-paper px-3 py-2"
                            >
                                <span className="font-semibold">{labelFor(s.type)}</span>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        aria-label={`Move ${labelFor(s.type)} up`}
                                        onClick={() => moveSection(i, -1)}
                                        disabled={i === 0}
                                    >
                                        ↑
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        aria-label={`Move ${labelFor(s.type)} down`}
                                        onClick={() => moveSection(i, 1)}
                                        disabled={i === sections.length - 1}
                                    >
                                        ↓
                                    </Button>
                                    <Button
                                        variant="dangerGhost"
                                        size="sm"
                                        aria-label={`Remove ${labelFor(s.type)}`}
                                        onClick={() => removeSection(s.type)}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {pendingLoss && (
                    <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-danger bg-sheet p-4">
                        <p className="text-sm font-semibold">
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
                            <Button variant="danger" onClick={() => save(true)}>
                                Delete and save
                            </Button>
                            <Button variant="secondary" onClick={() => setPendingLoss(null)}>
                                Keep editing
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <Button onClick={() => save(false)} disabled={sections.length === 0}>
                        Confirm
                    </Button>
                    <TextLink href={`/agendas/${params.id}`} className="text-sm">
                        Back to agenda
                    </TextLink>
                </div>
            </Card>
        </main>
    );
}