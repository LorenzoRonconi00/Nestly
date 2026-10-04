"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { CoverViewer } from "@/components/cover/CoverViewer";
import { COVER_COLOR_PRESETS, DEFAULT_COVER_THEME, serializeCoverTheme } from "@/lib/coverTheme";

const TEMPLATES = [
    { value: "notebook", label: "Notebook" },
    { value: "standard", label: "Standard" },
    { value: "diary", label: "Diary" },
];

export default function NewAgendaPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [baseTemplate, setBaseTemplate] = useState("standard");
    const [coverColor, setCoverColor] = useState(DEFAULT_COVER_THEME.color);
    const [error, setError] = useState<string | null>(null);

    const coverTheme = { kind: "solid" as const, color: coverColor };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const res = await authFetch("/api/agendas", {
            method: "POST",
            body: JSON.stringify({ name, baseTemplate, coverTheme: serializeCoverTheme(coverTheme) }),
        }).catch(ignoreSessionExpired);
        if (!res) return;
        if (!res.ok) {
            setError("Could not create agenda");
            return;
        }
        const data = await res.json();
        router.push(`/agendas/${data.id}/structure`);
    }

    return (
        <main className="flex min-h-screen items-center justify-center py-8">
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
                <h1 className="text-2xl font-semibold">New Agenda</h1>
                {error && <p className="text-red-600">{error}</p>}
                <CoverViewer theme={coverTheme} className="h-56 w-full" />
                <fieldset className="flex flex-col gap-2">
                    <legend className="text-sm font-medium">Cover color</legend>
                    <div className="flex flex-wrap items-center gap-2">
                        {COVER_COLOR_PRESETS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                aria-label={`Cover color ${color}`}
                                aria-pressed={coverColor === color}
                                onClick={() => setCoverColor(color)}
                                style={{ backgroundColor: color }}
                                className={`h-8 w-8 cursor-pointer rounded-full border ${coverColor === color ? "ring-2 ring-black ring-offset-2" : ""
                                    }`}
                            />
                        ))}
                        <input
                            type="color"
                            aria-label="Custom cover color"
                            value={coverColor}
                            onChange={(e) => setCoverColor(e.target.value)}
                            className="h-8 w-8 cursor-pointer"
                        />
                    </div>
                </fieldset>
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