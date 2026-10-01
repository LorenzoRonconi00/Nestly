"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { todayLocal } from "@/lib/date";

type Agenda = {
    id: string;
    name: string;
    baseTemplate: string;
    sections: { type: string; order: number }[];
};

export default function AgendaSummaryPage() {
    const params = useParams<{ id: string }>();
    const [agenda, setAgenda] = useState<Agenda | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authFetch(`/api/agendas/${params.id}`)
            .catch(ignoreSessionExpired)
            .then((res) => (res?.ok ? res.json() : null))
            .then(setAgenda)
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) return null;
    if (!agenda) return <p className="p-8">Agenda not found</p>;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-semibold">{agenda.name}</h1>
            <p className="text-sm text-gray-500">Template: {agenda.baseTemplate}</p>
            <ul className="flex flex-col gap-1">
                {agenda.sections
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((s) => (
                        <li key={s.type}>{s.type}</li>
                    ))}
            </ul>
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
            <Link href="/" className="underline">Back to home</Link>
        </main>
    );
}