"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Agenda = {
    id: string;
    name: string;
    baseTemplate: string;
    sections: { type: string; order: number }[];
};

export default function AgendaSummaryPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [agenda, setAgenda] = useState<Agenda | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        apiFetch(`/api/agendas/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => (res.ok ? res.json() : null))
            .then(setAgenda)
            .finally(() => setLoading(false));
    }, [params.id, router]);

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
            <Link href="/" className="underline">Back to home</Link>
        </main>
    );
}