"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadError } from "@/components/LoadError";
import { RiseIn } from "@/components/auth/RiseIn";
import { PageComposer } from "@/components/structure/PageComposer";
import { SectionPalette } from "@/components/structure/SectionPalette";
import { DataLossNotice, LeaveNotice } from "@/components/structure/StructureNotices";
import { sectionInfo } from "@/components/structure/sectionTypes";
import { BookSpread } from "@/components/ui/BookSpread";
import { CrayonButton } from "@/components/ui/CrayonButton";
import { FormMessage } from "@/components/ui/FormMessage";
import { authFetch } from "@/lib/api";
import { DEFAULT_COVER_THEME, parseCoverTheme } from "@/lib/coverTheme";
import { loadJson, type LoadStatus } from "@/lib/loadJson";
import { useSubmit } from "@/lib/useSubmit";

type SectionItem = { type: string; order: number };
type DataLoss = { type: string; pageCount: number };
type AgendaData = { name: string; coverTheme: string | null; sections: SectionItem[] };

function keyOf(sections: SectionItem[]) {
    return sections.map((section) => section.type).join(",");
}

export default function StructurePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [initialKey, setInitialKey] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [coverColor, setCoverColor] = useState(DEFAULT_COVER_THEME.color);
    const [status, setStatus] = useState<LoadStatus>("loading");
    const [attempt, setAttempt] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { pending, submit } = useSubmit(setError);
    const [pendingLoss, setPendingLoss] = useState<DataLoss[] | null>(null);
    const [confirmingLeave, setConfirmingLeave] = useState(false);

    const dirty = initialKey !== null && keyOf(sections) !== initialKey;
    const firstSetup = initialKey === "";
    const agendaHref = `/agendas/${params.id}`;

    useEffect(() => {
        let cancelled = false;
        loadJson<AgendaData>(`/api/agendas/${params.id}`).then((result) => {
            if (cancelled) return;
            if (result.kind === "ok") {
                setSections(result.data.sections);
                setInitialKey(keyOf(result.data.sections));
                setName(result.data.name);
                setCoverColor(parseCoverTheme(result.data.coverTheme).color);
            }
            setStatus(result.kind);
        });
        return () => {
            cancelled = true;
        };
    }, [params.id, attempt]);

    useEffect(() => {
        if (!dirty) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty]);

    function retryLoading() {
        setStatus("loading");
        setAttempt((current) => current + 1);
    }

    function changeSections(next: SectionItem[]) {
        setSections(next);
        setPendingLoss(null);
        setConfirmingLeave(false);
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

    function save(confirmDataLoss: boolean) {
        setError(null);
        void submit(async () => {
            const res = await authFetch(`/api/agendas/${params.id}/structure-template`, {
                method: "PATCH",
                body: JSON.stringify({ sections, confirmDataLoss }),
            });
            if (res.status === 409) {
                const body = await res.json();
                setPendingLoss(body.sections);
                return false;
            }
            if (!res.ok) {
                setError("Could not save the layout. Try again in a moment.");
                return false;
            }
            router.push(agendaHref);
            return true;
        });
    }

    if (status === "loading" || status === "expired") return null;
    if (status === "error") {
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <LoadError onRetry={retryLoading} />
            </main>
        );
    }
    if (status === "not-found") return <p className="p-8">Agenda not found</p>;

    const activeTypes = sections.map((section) => section.type);
    const intro = (
        <div className="flex flex-col gap-3">
            <h1 className="font-hand text-4xl leading-tight text-ink">{firstSetup ? "Set up your pages" : "Edit your pages"}</h1>
            <p className="text-ink-soft">
                This layout is used for every page of <strong className="font-semibold text-ink">{name}</strong>.
            </p>
        </div>
    );

    return (
        <BookSpread
            backHref={agendaHref}
            backLabel="Back to the agenda"
            bindingColor={coverColor}
            onBack={(event) => {
                if (!dirty) return;
                event.preventDefault();
                setConfirmingLeave(true);
            }}
            left={
                <div className="flex w-full max-w-sm flex-col gap-6 md:sticky md:top-10">
                    {intro}
                    <SectionPalette layout="stack" activeTypes={activeTypes} onAdd={addSection} />
                </div>
            }
            mobileIntro={
                <div className="flex flex-col gap-6">
                    {intro}
                    <SectionPalette layout="row" activeTypes={activeTypes} onAdd={addSection} />
                </div>
            }
        >
            <RiseIn index={0}>
                <h2 className="font-hand text-2xl leading-8 text-ink">Sample page</h2>
            </RiseIn>
            <PageComposer sections={sections} onMove={moveSection} onRemove={removeSection} />
            <div className="flex flex-col gap-3">
                {pendingLoss && (
                    <DataLossNotice
                        losses={pendingLoss.map((loss) => ({ label: sectionInfo(loss.type).label, pageCount: loss.pageCount }))}
                        pending={pending}
                        onKeep={() => setPendingLoss(null)}
                        onConfirm={() => save(true)}
                    />
                )}
                {confirmingLeave && <LeaveNotice leaveHref={agendaHref} onKeep={() => setConfirmingLeave(false)} />}
                <FormMessage message={error} />
                <CrayonButton type="button" pending={pending} disabled={sections.length === 0} onClick={() => save(false)}>
                    {pending ? "Saving…" : firstSetup ? "Start writing" : "Save layout"}
                </CrayonButton>
            </div>
        </BookSpread>
    );
}