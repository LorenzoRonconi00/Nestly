"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { todayLocal } from "@/lib/date";
import { CoverViewer } from "@/components/cover/CoverViewer";
import { DeleteAgendaPanel } from "@/components/DeleteAgendaPanel";
import { parseCoverTheme } from "@/lib/coverTheme";
import { Button, buttonClassName } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";

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
    const [agenda, setAgenda] = useState<Agenda | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        authFetch(`/api/agendas/${params.id}`)
            .catch(ignoreSessionExpired)
            .then((res) => (res?.ok ? res.json() : null))
            .then(setAgenda)
            .finally(() => setLoading(false));
    }, [params.id]);

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

    if (loading) return null;
    if (!agenda) return <p className="p-8">Agenda not found</p>;

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-5 px-4 py-8">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-3xl font-extrabold">{agenda.name}</h1>
                <span className="rounded-full border bg-sheet px-3 py-0.5 text-xs text-ink-soft">
                    {agenda.baseTemplate}
                </span>
            </div>
            <CoverViewer theme={parseCoverTheme(agenda.coverTheme)} />
            <Link
                href={
                    agenda.baseTemplate === "notebook"
                        ? `/agendas/${agenda.id}/pages/number/1`
                        : `/agendas/${agenda.id}/pages/date/${todayLocal()}`
                }
                className={buttonClassName("primary")}
            >
                {agenda.baseTemplate === "notebook" ? "Open page 1" : "Open today's page"}
            </Link>
            <div className="flex items-center gap-4 text-sm">
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