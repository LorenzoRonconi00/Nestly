"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CoverColorSwatches } from "@/components/agenda/CoverColorSwatches";
import { DeleteAgendaNotice } from "@/components/agenda/DeleteAgendaNotice";
import { templateFor } from "@/components/agenda/templates";
import { RiseIn } from "@/components/auth/RiseIn";
import type { CoverTimeline } from "@/components/cover/Cover3D";
import { CoverViewer } from "@/components/cover/CoverViewer";
import { LoadError } from "@/components/LoadError";
import { useOpening } from "@/components/opening/OpeningProvider";
import { sectionInfo } from "@/components/structure/sectionTypes";
import { BookSpread } from "@/components/ui/BookSpread";
import { CrayonButton } from "@/components/ui/CrayonButton";
import { CrayonLink } from "@/components/ui/CrayonLink";
import { Field } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { LayoutIcon, PencilIcon, TrashIcon } from "@/components/ui/icons";
import { TextLink } from "@/components/ui/TextLink";
import { TEXT_BUTTON_CLASS } from "@/components/ui/textButton";
import { authFetch } from "@/lib/api";
import { parseCoverTheme, serializeCoverTheme } from "@/lib/coverTheme";
import { todayLocal } from "@/lib/date";
import { loadJson, type LoadStatus } from "@/lib/loadJson";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useRestoreFocus } from "@/lib/useRestoreFocus";
import { useSubmit } from "@/lib/useSubmit";

type Agenda = {
    id: string;
    name: string;
    baseTemplate: string;
    sections: { type: string; order: number }[];
    coverTheme: string | null;
};

const ACTION =
    "flex min-h-11 cursor-pointer items-center gap-2 font-hand text-xl text-ink transition-colors duration-150 hover:text-ink-soft motion-reduce:transition-none";

export default function AgendaSummaryPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { startOpening } = useOpening();
    const timelineRef = useRef<CoverTimeline | null>(null);
    const coverBoxRef = useRef<HTMLDivElement>(null);
    const editButtonRef = useRef<HTMLButtonElement>(null);
    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const wide = useMediaQuery("(min-width: 768px)", false);
    const [agenda, setAgenda] = useState<Agenda | null>(null);
    const [status, setStatus] = useState<LoadStatus>("loading");
    const [attempt, setAttempt] = useState(0);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draftName, setDraftName] = useState("");
    const [draftColor, setDraftColor] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { pending, submit } = useSubmit(setError);

    useRestoreFocus(editing, editButtonRef);
    useRestoreFocus(confirmingDelete, deleteButtonRef);

    useEffect(() => {
        let cancelled = false;
        loadJson<Agenda>(`/api/agendas/${params.id}`).then((result) => {
            if (cancelled) return;
            if (result.kind === "ok") setAgenda(result.data);
            setStatus(result.kind);
        });
        return () => {
            cancelled = true;
        };
    }, [params.id, attempt]);

    function retryLoading() {
        setStatus("loading");
        setAttempt((current) => current + 1);
    }

    function startEditing() {
        if (!agenda) return;
        setError(null);
        setDraftName(agenda.name);
        setDraftColor(parseCoverTheme(agenda.coverTheme).color);
        setEditing(true);
    }

    function handleSave() {
        setError(null);
        void submit(async () => {
            const res = await authFetch(`/api/agendas/${params.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: draftName,
                    coverTheme: serializeCoverTheme({ kind: "solid", color: draftColor }),
                }),
            });
            if (!res.ok) {
                setError("Could not save changes");
                return false;
            }
            setAgenda(await res.json());
            setEditing(false);
            return false;
        });
    }

    function handleDelete() {
        setError(null);
        void submit(async () => {
            const res = await authFetch(`/api/agendas/${params.id}`, { method: "DELETE" });
            if (!res.ok) {
                setError("Could not delete agenda");
                return false;
            }
            router.push("/");
            return true;
        });
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

    if (status === "loading" || status === "expired") return null;
    if (status === "error") {
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <LoadError onRetry={retryLoading} />
            </main>
        );
    }
    if (!agenda) return <p className="p-8">Agenda not found</p>;

    const isNotebook = agenda.baseTemplate === "notebook";
    const openHref = isNotebook ? `/agendas/${agenda.id}/book?page=1` : `/agendas/${agenda.id}/book?date=${todayLocal()}`;
    const savedTheme = parseCoverTheme(agenda.coverTheme);
    const coverTheme = editing ? { kind: "solid" as const, color: draftColor } : savedTheme;
    const template = templateFor(agenda.baseTemplate);
    const sections = [...agenda.sections].sort((a, b) => a.order - b.order);
    const structureHref = `/agendas/${agenda.id}/structure`;

    const cover = (
        <div ref={coverBoxRef} className="w-full max-w-sm">
            <CoverViewer
                theme={coverTheme}
                className="h-64 w-full md:h-96"
                onAnimationReady={(timeline) => {
                    timelineRef.current = timeline;
                }}
            />
        </div>
    );

    return (
        <BookSpread bindingColor={savedTheme.color} left={wide ? cover : null} mobileIntro={wide ? undefined : cover}>
            <RiseIn index={0}>
                <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                        <template.Icon className="size-5 shrink-0" />
                        {template.label}
                    </p>
                    <h1 className="font-hand text-4xl leading-tight wrap-anywhere text-ink">{agenda.name}</h1>
                </div>
            </RiseIn>

            {editing ? (
                <div className="rise-quick flex flex-col gap-4">
                    <h2 className="font-hand text-2xl leading-8 text-ink">Edit details</h2>
                    <Field
                        label="Name"
                        icon={PencilIcon}
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        maxLength={255}
                        autoComplete="off"
                        autoFocus
                    />
                    <CoverColorSwatches value={draftColor} onChange={setDraftColor} />
                    <FormMessage message={error} />
                    <div className="flex flex-col items-start gap-3">
                        <CrayonButton type="button" pending={pending} disabled={draftName.trim() === ""} onClick={handleSave}>
                            Save changes
                        </CrayonButton>
                        <button type="button" onClick={() => setEditing(false)} className={TEXT_BUTTON_CLASS}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <RiseIn index={1}>
                        <section aria-labelledby="inside-title" className="flex flex-col">
                            <h2 id="inside-title" className="font-hand text-2xl leading-8 text-ink">
                                Inside
                            </h2>
                            {sections.length === 0 ? (
                                <p className="min-h-8 leading-8 text-ink-soft">
                                    No sections yet. <TextLink href={structureHref}>Set up your pages</TextLink>
                                </p>
                            ) : (
                                <ul>
                                    {sections.map((section) => {
                                        const info = sectionInfo(section.type);
                                        return (
                                            <li key={section.type} className="flex h-8 items-center gap-3 text-ink">
                                                <info.Icon className="size-5 shrink-0 text-ink-soft" />
                                                {info.label}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    </RiseIn>

                    <RiseIn index={2}>
                        <CrayonLink href={openHref} onClick={(event) => handleOpenClick(event, openHref)}>
                            {isNotebook ? "Open page 1" : "Open today's page"}
                        </CrayonLink>
                    </RiseIn>

                    <RiseIn index={3}>
                        <div className="flex flex-wrap items-center gap-x-6">
                            <button ref={editButtonRef} type="button" onClick={startEditing} className={ACTION}>
                                <PencilIcon className="size-5" />
                                Edit details
                            </button>
                            <Link href={structureHref} className={ACTION}>
                                <LayoutIcon className="size-5" />
                                Edit structure
                            </Link>
                        </div>
                    </RiseIn>

                    <RiseIn index={4}>
                        <div className="flex flex-col gap-3">
                            {confirmingDelete ? (
                                <DeleteAgendaNotice
                                    agendaName={agenda.name}
                                    pending={pending}
                                    onConfirm={handleDelete}
                                    onCancel={() => setConfirmingDelete(false)}
                                />
                            ) : (
                                <button
                                    ref={deleteButtonRef}
                                    type="button"
                                    onClick={() => setConfirmingDelete(true)}
                                    className="flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm text-danger underline decoration-1 underline-offset-4 hover:text-ink-soft"
                                >
                                    <TrashIcon className="size-5" />
                                    Delete agenda
                                </button>
                            )}
                            <FormMessage message={error} />
                        </div>
                    </RiseIn>
                </>
            )}
        </BookSpread>
    );
}