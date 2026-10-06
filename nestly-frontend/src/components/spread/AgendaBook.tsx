"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageSections } from "@/components/PageSections";
import { SaveProblemBanner } from "@/components/SaveProblemBanner";
import { SoundToggle } from "@/components/handwriting/SoundToggle";
import { usePageReady } from "@/components/opening/OpeningProvider";
import { PageFace } from "@/components/spread/PageFace";
import { Spread } from "@/components/spread/Spread";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { authFetch, ignoreSessionExpired } from "@/lib/api";
import { parseCoverTheme } from "@/lib/coverTheme";
import { addDays, formatDateLong, todayLocal } from "@/lib/date";
import { fetchDateRange, fetchNumberRange, type PageData } from "@/lib/pages";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useSectionSaver } from "@/lib/useSectionSaver";

type AgendaInfo = { baseTemplate: string; coverTheme: string | null };
type Loaded = { key: string; pages: PageData[] | null };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pageTitle(page: PageData) {
    return page.date ? formatDateLong(page.date) : `Page ${page.pageNumber}`;
}

function faceSide(count: number, index: number) {
    if (count === 1) return "single";
    return index === 0 ? "left" : "right";
}

function buildTargets(agendaId: string, isNotebook: boolean, dateStart: string, pageStart: number, step: number) {
    const base = `/agendas/${agendaId}/book`;
    if (!isNotebook) {
        return {
            previous: { href: `${base}?date=${addDays(dateStart, -step)}`, disabled: false },
            next: { href: `${base}?date=${addDays(dateStart, step)}`, disabled: false },
        };
    }
    return {
        previous: { href: `${base}?page=${Math.max(1, pageStart - step)}`, disabled: pageStart <= 1 },
        next: { href: `${base}?page=${pageStart + step}`, disabled: false },
    };
}

export function AgendaBook({ agendaId }: Readonly<{ agendaId: string }>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const wide = useMediaQuery("(min-width: 768px)", true);
    const count = wide ? 2 : 1;
    const { save, problem } = useSectionSaver(agendaId);
    const [agenda, setAgenda] = useState<AgendaInfo | null | undefined>(undefined);
    const [loaded, setLoaded] = useState<Loaded | null>(null);

    const rawDate = searchParams.get("date");
    const dateStart = rawDate && DATE_PATTERN.test(rawDate) ? rawDate : todayLocal();
    const rawPage = Number(searchParams.get("page"));
    const pageStart = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

    const isNotebook = agenda?.baseTemplate === "notebook";
    const key = `${isNotebook ? pageStart : dateStart}:${count}`;
    const targets = agenda ? buildTargets(agendaId, isNotebook, dateStart, pageStart, count) : null;

    usePageReady(agenda === null || (agenda !== undefined && loaded !== null));

    useEffect(() => {
        authFetch(`/api/agendas/${agendaId}`)
            .catch(ignoreSessionExpired)
            .then((res) => (res?.ok ? res.json() : null))
            .then(setAgenda);
    }, [agendaId]);

    useEffect(() => {
        if (!agenda) return;
        let cancelled = false;
        const request = isNotebook
            ? fetchNumberRange(agendaId, pageStart, count)
            : fetchDateRange(agendaId, dateStart, count);
        request
            .catch(ignoreSessionExpired)
            .then((pages) => {
                if (!cancelled) setLoaded({ key, pages: pages ?? null });
            });
        return () => {
            cancelled = true;
        };
    }, [agenda, agendaId, isNotebook, dateStart, pageStart, count, key]);

    useEffect(() => {
        if (!targets) return;
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing = target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
            if (typing) return;
            if (event.key === "ArrowLeft" && !targets.previous.disabled) router.push(targets.previous.href);
            if (event.key === "ArrowRight" && !targets.next.disabled) router.push(targets.next.href);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [targets?.previous.href, targets?.previous.disabled, targets?.next.href, targets?.next.disabled, router]);

    if (agenda === null) return <p className="p-8">Agenda not found</p>;
    if (!agenda || !loaded || !targets) return null;

    const pages = loaded.pages;

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-8 md:max-w-5xl">
            <div className="flex items-center justify-between">
                <TextLink href={`/agendas/${agendaId}`} className="text-sm">
                    ← Back to agenda
                </TextLink>
                <SoundToggle />
            </div>
            {pages ? (
                <Spread coverColor={parseCoverTheme(agenda.coverTheme).color}>
                    {pages.map((page, index) => (
                        <PageFace key={page.id} title={pageTitle(page)} side={faceSide(pages.length, index)}>
                            <PageSections
                                sections={page.sections}
                                onSaveSection={(sectionId, data) => save(page.id, sectionId, data)}
                            />
                        </PageFace>
                    ))}
                </Spread>
            ) : (
                <p className="text-ink-soft">Page not found</p>
            )}
            <div className="flex items-center justify-center gap-3">
                <Button
                    variant="secondary"
                    disabled={targets.previous.disabled}
                    onClick={() => router.push(targets.previous.href)}
                >
                    ← Previous
                </Button>
                <Button variant="secondary" disabled={targets.next.disabled} onClick={() => router.push(targets.next.href)}>
                    Next →
                </Button>
            </div>
            <SaveProblemBanner problem={problem} />
        </main>
    );
}