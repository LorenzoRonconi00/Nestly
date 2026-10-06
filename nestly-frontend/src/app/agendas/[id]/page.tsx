"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { todayLocal } from "@/lib/date";
import { CoverColorPicker } from "@/components/cover/CoverColorPicker";
import { CoverViewer } from "@/components/cover/CoverViewer";
import type { CoverTimeline } from "@/components/cover/Cover3D";
import { DeleteAgendaPanel } from "@/components/DeleteAgendaPanel";
import { useOpening } from "@/components/opening/OpeningProvider";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { TextLink } from "@/components/ui/TextLink";
import { parseCoverTheme, serializeCoverTheme } from "@/lib/coverTheme";

type Agenda = {
    id: string;
    name: string;
    baseTemplate: string;
    sections: { type: string; order: number }[];
    coverTheme: string | null;
};

export default function AgendaSummaryPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { startOpening } = useOpening();
    const timelineRef = useRef<CoverTimeline | null>(null);
    const coverBoxRef = useRef<HTMLDivElement>(null);
    const [agenda, setAgenda] = useState<Agenda | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draftName, setDraftName] = useState("");
    const [draftColor, setDraftColor] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        authFetch(`/api/agendas/${params.id}`)
            .catch(ignoreSessionExpired)
            .then((res) => (res?.ok ? res.json() : null))
            .then(setAgenda)
            .finally(() => setLoading(false));
    }, [params.id]);

    function startEditing() {
        if (!agenda) return;
        setError(null);
        setDraftName(agenda.name);
        setDraftColor(parseCoverTheme(agenda.coverTheme).color);
        setEditing(true);
    }

    async function handleSave() {
        setError(null);
        const res = await authFetch(`/api/agendas/${params.id}`, {
            method: "PUT",
            body: JSON.stringify({
                name: draftName,
                coverTheme: serializeCoverTheme({ kind: "solid", color: draftColor }),
            }),
        }).catch(ignoreSessionExpired);
        if (!res) return;
        if (!res.ok) {
            setError("Could not save changes");
            return;
        }
        setAgenda(await res.json());
        setEditing(false);
    }

    async function handleDelete() {
        setError(null);
        const res = await authFetch(`/api/agendas/${params.id}`, { method: "DELETE" }).catch(ignoreSessionExpired);
        if (!res) return;
        if (!res.ok) {
            setError("Could not delete agenda");
            return;
        }
        router.push("/");
    }

    function handleOpenClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
        const timeline = timelineRef.current;
        const box = coverBoxRef.current;
        const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!timeline || !box || modified || reducedMotion) return;

        event.preventDefault();
        const rect = box.getBoundingClientRect();
        void startOpening({
            coverTimeline: timeline,
            href,
            origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        });
    }

    if (loading) return null;
    if (!agenda) return <p className="p-8">Agenda not found</p>;

    const openHref =
        agenda.baseTemplate === "notebook"
            ? `/agendas/${agenda.id}/book?page=1`
            : `/agendas/${agenda.id}/book?date=${todayLocal()}`;
    const coverTheme = editing ? { kind: "solid" as const, color: draftColor } : parseCoverTheme(agenda.coverTheme);

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-5 px-4 py-8">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-3xl font-extrabold">{agenda.name}</h1>
                <span className="rounded-full border bg-sheet px-3 py-0.5 text-xs text-ink-soft">
                    {agenda.baseTemplate}
                </span>
            </div>
            <div ref={coverBoxRef} className="w-full">
                <CoverViewer
                    theme={coverTheme}
                    onAnimationReady={(timeline) => {
                        timelineRef.current = timeline;
                    }}
                />
            </div>
            {editing && (
                <Card className="flex w-full flex-col gap-4">
                    <h2 className="text-lg font-bold">Edit details</h2>
                    <TextInput
                        aria-label="Agenda name"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        maxLength={255}
                    />
                    <CoverColorPicker value={draftColor} onChange={setDraftColor} />
                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={draftName.trim() === ""}>
                            Save
                        </Button>
                        <Button variant="secondary" onClick={() => setEditing(false)}>
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}
            <Link
                href={openHref}
                onClick={(event) => handleOpenClick(event, openHref)}
                className={buttonClassName("primary")}
            >
                {agenda.baseTemplate === "notebook" ? "Open page 1" : "Open today's page"}
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <button
                    type="button"
                    onClick={startEditing}
                    className="cursor-pointer text-ink underline decoration-accent-hover decoration-2 underline-offset-4 hover:text-ink-soft"
                >
                    Edit details
                </button>
                <TextLink href={`/agendas/${agenda.id}/structure`}>Edit structure</TextLink>
                <TextLink href="/">Back to home</TextLink>
            </div>
            {error && (
                <p role="alert" className="text-sm text-danger">
                    {error}
                </p>
            )}
            {confirmingDelete ? (
                <DeleteAgendaPanel
                    agendaName={agenda.name}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmingDelete(false)}
                />
            ) : (
                <Button variant="dangerGhost" size="sm" onClick={() => setConfirmingDelete(true)}>
                    Delete agenda
                </Button>
            )}
        </main>
    );
}