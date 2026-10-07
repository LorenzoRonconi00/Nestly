"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { SaveProblemBanner } from "@/components/SaveProblemBanner";
import { LoadError } from "@/components/LoadError";
import { SoundToggle } from "@/components/handwriting/SoundToggle";
import { usePageReady } from "@/components/opening/OpeningProvider";
import { BookStage } from "@/components/spread/BookStage";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { parseCoverTheme } from "@/lib/coverTheme";
import { addDays, formatDateLong, todayLocal } from "@/lib/date";
import { fetchDateRange, fetchNumberRange, type PageData } from "@/lib/pages";
import type { Direction, FlipState, SpreadData } from "@/lib/spread";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useSectionSaver } from "@/lib/useSectionSaver";
import { CalendarMenu } from "@/components/spread/CalendarMenu";
import { PageJumpMenu } from "@/components/spread/PageJumpMenu";
import { SearchMenu } from "@/components/spread/SearchMenu";
import type { SearchHit } from "@/lib/search";
import { loadJson } from "@/lib/loadJson";

type AgendaInfo = { baseTemplate: string; coverTheme: string | null };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PREFETCH_DELAY_MS = 500;

function pageTitle(page: PageData) {
    return page.date ? formatDateLong(page.date) : `Page ${page.pageNumber}`;
}

function neighborStart(isNotebook: boolean, start: string, direction: Direction, step: number): string | null {
    if (isNotebook) {
        const current = Number(start);
        if (direction === "prev" && current <= 1) return null;
        const target = direction === "next" ? current + step : current - step;
        return String(Math.max(1, target));
    }
    return addDays(start, direction === "next" ? step : -step);
}

function hrefFor(agendaId: string, isNotebook: boolean, start: string) {
    return `/agendas/${agendaId}/book?${isNotebook ? "page" : "date"}=${start}`;
}

export function AgendaBook({ agendaId }: Readonly<{ agendaId: string }>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const wide = useMediaQuery("(min-width: 768px)", true);
    const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", false);
    const count = wide ? 2 : 1;
    const { save, problem } = useSectionSaver(agendaId);
    const [agenda, setAgenda] = useState<AgendaInfo | null | undefined>(undefined);
    const [agendaFailed, setAgendaFailed] = useState(false);
    const [agendaAttempt, setAgendaAttempt] = useState(0);
    const [displayed, setDisplayed] = useState<SpreadData | null | undefined>(undefined);
    const [flip, setFlip] = useState<FlipState | null>(null);
    const displayedRef = useRef<SpreadData | null | undefined>(undefined);
    const flippingRef = useRef(false);
    const cacheRef = useRef(new Map<string, Promise<SpreadData | null>>());

    const rawDate = searchParams.get("date");
    const dateStart = rawDate && DATE_PATTERN.test(rawDate) ? rawDate : todayLocal();
    const rawPage = Number(searchParams.get("page"));
    const pageStart = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
    const isNotebook = agenda?.baseTemplate === "notebook";
    const urlStart = isNotebook ? String(pageStart) : dateStart;
    const urlKey = `${urlStart}:${count}`;

    usePageReady(agenda === null || (agenda !== undefined && displayed !== undefined));

    const show = useCallback((spread: SpreadData | null) => {
        displayedRef.current = spread;
        if (spread) cacheRef.current.delete(spread.key);
        setDisplayed(spread);
    }, []);

    const loadSpread = useCallback(
        (start: string): Promise<SpreadData | null> => {
            const key = `${start}:${count}`;
            const cached = cacheRef.current.get(key);
            if (cached) return cached;
            const request = (
                isNotebook ? fetchNumberRange(agendaId, Number(start), count) : fetchDateRange(agendaId, start, count)
            )
                .then((pages) => (pages ? { key, start, pages } : null))
                .catch(() => null)
                .then((spread) => {
                    if (!spread) cacheRef.current.delete(key);
                    return spread;
                });
            cacheRef.current.set(key, request);
            return request;
        },
        [agendaId, isNotebook, count],
    );

    const commit = useCallback(
        (to: SpreadData) => {
            flushSync(() => {
                show(to);
                setFlip(null);
            });
            flippingRef.current = false;
            router.push(hrefFor(agendaId, isNotebook, to.start), { scroll: false });
        },
        [agendaId, isNotebook, router, show],
    );

    const flipTo = useCallback(
        async (direction: Direction, start: string) => {
            const from = displayedRef.current;
            if (!from || flippingRef.current || start === from.start) return;
            flippingRef.current = true;
            const to = await loadSpread(start);
            if (!to) {
                flippingRef.current = false;
                return;
            }
            if (reducedMotion) {
                commit(to);
                return;
            }
            setFlip({ direction, to });
        },
        [commit, loadSpread, reducedMotion],
    );

    const go = useCallback(
        (direction: Direction) => {
            const from = displayedRef.current;
            if (!from) return;
            const start = neighborStart(isNotebook, from.start, direction, count);
            if (start !== null) void flipTo(direction, start);
        },
        [count, flipTo, isNotebook],
    );

    const jumpTo = useCallback(
        (start: string) => {
            const from = displayedRef.current;
            if (!from) return;
            const forward = isNotebook ? Number(start) > Number(from.start) : start > from.start;
            void flipTo(forward ? "next" : "prev", start);
        },
        [flipTo, isNotebook],
    );

    const jumpToHit = useCallback(
        (hit: SearchHit) => {
            const start = hit.date ?? (hit.pageNumber === null ? null : String(hit.pageNumber));
            if (start) jumpTo(start);
        },
        [jumpTo],
    );


    useEffect(() => {
        let cancelled = false;
        loadJson<AgendaInfo>(`/api/agendas/${agendaId}`).then((result) => {
            if (cancelled || result.kind === "expired") return;
            setAgendaFailed(result.kind === "error");
            setAgenda(result.kind === "ok" ? result.data : null);
        });
        return () => {
            cancelled = true;
        };
    }, [agendaId, agendaAttempt]);

    function retryAgenda() {
        setAgendaFailed(false);
        setAgenda(undefined);
        setAgendaAttempt((current) => current + 1);
    }

    useEffect(() => {
        if (!agenda || flippingRef.current) return;
        if (displayedRef.current?.key === urlKey) return;
        let cancelled = false;
        loadSpread(urlStart).then((spread) => {
            if (!cancelled) show(spread);
        });
        return () => {
            cancelled = true;
        };
    }, [agenda, urlKey, urlStart, loadSpread, show]);

    useEffect(() => {
        if (!agenda || !displayed) return;
        const timer = setTimeout(() => {
            const keep = new Set<string>();
            for (const direction of ["next", "prev"] as const) {
                const start = neighborStart(isNotebook, displayed.start, direction, count);
                if (start === null) continue;
                keep.add(`${start}:${count}`);
                void loadSpread(start);
            }
            for (const key of cacheRef.current.keys()) {
                if (!keep.has(key)) cacheRef.current.delete(key);
            }
        }, PREFETCH_DELAY_MS);
        return () => clearTimeout(timer);
    }, [agenda, displayed, isNotebook, count, loadSpread]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing =
                target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
            if (typing) return;
            if (event.key === "ArrowLeft") go("prev");
            if (event.key === "ArrowRight") go("next");
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [go]);

    if (agendaFailed) {
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <LoadError onRetry={retryAgenda} />
            </main>
        );
    }
    if (agenda === null) return <p className="p-8">Agenda not found</p>;
    if (!agenda || displayed === undefined) return null;

    const canGoPrevious = !displayed || !isNotebook || Number(displayed.start) > 1;

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-8 md:max-w-5xl">
            <div className="flex items-center justify-between">
                <TextLink href={`/agendas/${agendaId}`} className="text-sm">
                    ← Back to agenda
                </TextLink>
                <SoundToggle />
            </div>
            {displayed ? (
                <BookStage
                    coverColor={parseCoverTheme(agenda.coverTheme).color}
                    displayed={displayed}
                    flip={flip}
                    titleFor={pageTitle}
                    onSaveSection={save}
                    onFlipDone={() => {
                        if (flip) commit(flip.to);
                    }}
                />
            ) : (
                <LoadError onRetry={() => window.location.reload()} />
            )}
            <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="secondary" disabled={!canGoPrevious} onClick={() => go("prev")}>
                    ← Previous
                </Button>
                {isNotebook ? (
                    <PageJumpMenu onJump={jumpTo} />
                ) : (
                    <>
                        <CalendarMenu agendaId={agendaId} selected={displayed?.start ?? dateStart} onSelect={jumpTo} />
                        <Button variant="ghost" onClick={() => jumpTo(todayLocal())}>
                            Today
                        </Button>
                    </>
                )}
                <SearchMenu agendaId={agendaId} onSelect={jumpToHit} />
                <Button variant="secondary" onClick={() => go("next")}>
                    Next →
                </Button>
            </div>
            <SaveProblemBanner problem={problem} />
        </main>
    );
}