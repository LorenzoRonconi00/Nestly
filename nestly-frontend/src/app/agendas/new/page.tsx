"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

const TEMPLATES = [
    { value: "notebook", label: "Notebook" },
    { value: "standard", label: "Standard" },
    { value: "diary", label: "Diary" },
];

export default function NewAgendaPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [baseTemplate, setBaseTemplate] = useState("standard");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        const res = await apiFetch("/api/agendas", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, baseTemplate }),
        });
        if (!res.ok) {
            setError("Could not create agenda");
            return;
        }
        const data = await res.json();
        router.push(`/agendas/${data.id}/structure`);
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
                <h1 className="text-2xl font-semibold">New Agenda</h1>
                {error && <p className="text-red-600">{error}</p>}
                <input
                    type="text"
                    placeholder="Agenda name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded border px-3 py-2"
                />
                <fieldset className="flex flex-col gap-2">
                    <legend className="text-sm font-medium">Template</legend>
                    {TEMPLATES.map((template) => (
                        <label key={template.value} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="baseTemplate"
                                value={template.value}
                                checked={baseTemplate === template.value}
                                onChange={() => setBaseTemplate(template.value)}
                            />
                            {template.label}
                        </label>
                    ))}
                </fieldset>
                <button type="submit" className="rounded bg-black px-3 py-2 text-white">
                    Continue
                </button>
            </form>
        </main>
    );
}