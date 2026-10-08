"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CoverColorSwatches } from "@/components/agenda/CoverColorSwatches";
import { CoverPreview } from "@/components/agenda/CoverPreview";
import { TemplateCards } from "@/components/agenda/TemplateCards";
import type { AgendaTemplate } from "@/components/agenda/templates";
import { RiseIn } from "@/components/auth/RiseIn";
import { BookSpread } from "@/components/ui/BookSpread";
import { CrayonButton } from "@/components/ui/CrayonButton";
import { Field } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { PencilIcon } from "@/components/ui/icons";
import { authFetch } from "@/lib/api";
import { DEFAULT_COVER_THEME, serializeCoverTheme } from "@/lib/coverTheme";
import { firstViolation } from "@/lib/errors";
import { useSubmit } from "@/lib/useSubmit";

type FormError = { field: "name" | null; message: string };

export default function NewAgendaPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [baseTemplate, setBaseTemplate] = useState<AgendaTemplate>("standard");
    const [coverColor, setCoverColor] = useState(DEFAULT_COVER_THEME.color);
    const [error, setError] = useState<FormError | null>(null);
    const { pending, submit } = useSubmit((message) => setError({ field: null, message }));

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (name.trim() === "") {
            setError({ field: "name", message: "Give your agenda a name." });
            return;
        }
        void submit(async () => {
            const res = await authFetch("/api/agendas", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    baseTemplate,
                    coverTheme: serializeCoverTheme({ kind: "solid", color: coverColor }),
                }),
            });
            if (!res.ok) {
                const violation = res.status === 400 ? await firstViolation(res) : null;
                setError({
                    field: violation?.field === "name" ? "name" : null,
                    message: violation?.message ?? "Could not create the agenda. Try again in a moment.",
                });
                return false;
            }
            const data = await res.json();
            router.push(`/agendas/${data.id}/structure`);
            return true;
        });
    }

    return (
        <BookSpread
            left={<CoverPreview name={name} color={coverColor} baseTemplate={baseTemplate} className="w-56" />}
            mobileIntro={
                <CoverPreview name={name} color={coverColor} baseTemplate={baseTemplate} className="mx-auto w-32" />
            }
        >
            <RiseIn index={0}>
                <h1 className="font-hand text-4xl leading-tight text-ink">New agenda</h1>
            </RiseIn>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <RiseIn index={1}>
                    <Field
                        label="Name your agenda"
                        icon={PencilIcon}
                        type="text"
                        autoComplete="off"
                        maxLength={255}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={error?.field === "name" ? error.message : null}
                    />
                </RiseIn>
                <RiseIn index={2}>
                    <CoverColorSwatches value={coverColor} onChange={setCoverColor} />
                </RiseIn>
                <RiseIn index={3}>
                    <TemplateCards value={baseTemplate} onChange={setBaseTemplate} />
                </RiseIn>
                <FormMessage message={error?.field === null ? error.message : null} />
                <RiseIn index={4}>
                    <CrayonButton pending={pending}>{pending ? "Creating…" : "Choose the page layout"}</CrayonButton>
                </RiseIn>
            </form>
        </BookSpread>
    );
}