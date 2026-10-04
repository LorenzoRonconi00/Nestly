"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { todayLocal } from "@/lib/date";
import { CoverViewer } from "@/components/cover/CoverViewer";
import { DeleteAgendaPanel } from "@/components/DeleteAgendaPanel";
import { parseCoverTheme } from "@/lib/coverTheme";

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
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-semibold">{agenda.name}</h1>
            <p className="text-sm text-gray-500">Template: {agenda.baseTemplate}</p>
            <CoverViewer theme={parseCoverTheme(agenda.coverTheme)} />
            <Link
                href={
                    agenda.baseTemplate === "notebook"
                        ? `/agendas/${agenda.id}/pages/number/1`
                        : `/agendas/${agenda.id}/pages/date/${todayLocal()}`
                }
                className="underline"
            >
                {agenda.baseTemplate === "notebook" ? "Open page 1" : "Open today's page"}
            </Link>
            <Link href={`/agendas/${agenda.id}/structure`} className="underline">
                Edit structure
            </Link>
            <Link href="/" className="underline">Back to home</Link>
            {error && <p className="text-red-600">{error}</p>}
            {confirmingDelete ? (
                <DeleteAgendaPanel
                    agendaName={agenda.name}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmingDelete(false)}
                />
            ) : (
                <button
                    onClick={() => setConfirmingDelete(true)}
                    className="cursor-pointer text-sm text-red-600 underline"
                >
                    Delete agenda
                </button>
            )}
        </main>
    );
}