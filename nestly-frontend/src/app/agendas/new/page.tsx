"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";
import { CoverViewer } from "@/components/cover/CoverViewer";
import { CoverColorPicker } from "@/components/cover/CoverColorPicker";
import { DEFAULT_COVER_THEME, serializeCoverTheme } from "@/lib/coverTheme";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { useSubmit } from "@/lib/useSubmit";

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
    const { pending, submit } = useSubmit(setError);

    const coverTheme = { kind: "solid" as const, color: coverColor };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        void submit(async () => {
            const res = await authFetch("/api/agendas", {
                method: "POST",
                body: JSON.stringify({ name, baseTemplate, coverTheme: serializeCoverTheme(coverTheme) }),
            });
            if (!res.ok) {
                setError("Could not create agenda");
                return false;
            }
            const data = await res.json();
            router.push(`/agendas/${data.id}/structure`);
            return true;
        });
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-8">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <h1 className="text-2xl font-bold">New agenda</h1>
                    {error && (
                        <p role="alert" className="text-sm text-danger">
                            {error}
                        </p>
                    )}
                    <CoverViewer theme={coverTheme} className="h-56 w-full" />
                    <CoverColorPicker value={coverColor} onChange={setCoverColor} />
                    <TextInput
                        type="text"
                        placeholder="Agenda name"
                        aria-label="Agenda name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <fieldset className="flex flex-col gap-2">
                        <legend className="mb-1 text-sm font-bold">Template</legend>
                        {TEMPLATES.map((template) => (
                            <label key={template.value} className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="radio"
                                    name="baseTemplate"
                                    value={template.value}
                                    checked={baseTemplate === template.value}
                                    onChange={() => setBaseTemplate(template.value)}
                                    className="accent-focus"
                                />
                                {template.label}
                            </label>
                        ))}
                    </fieldset>
                    <Button type="submit" disabled={pending}>
                        Continue
                    </Button>
                </form>
            </Card>
        </main>
    );
}