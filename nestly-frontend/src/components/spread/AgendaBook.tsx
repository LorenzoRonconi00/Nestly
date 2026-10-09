"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { BookSidebar } from "@/components/book/BookSidebar";
import { BookTopBar } from "@/components/book/BookTopBar";
import { DaysSidebar } from "@/components/book/DaysSidebar";
import { PagesSidebar } from "@/components/book/PagesSidebar";
import { LoadError } from "@/components/LoadError";
import { SaveProblemBanner } from "@/components/SaveProblemBanner";
import { SoundToggle } from "@/components/handwriting/SoundToggle";
import { usePageReady } from "@/components/opening/OpeningProvider";
import { BookStage } from "@/components/spread/BookStage";
import { SearchMenu } from "@/components/spread/SearchMenu";
import { IconButton } from "@/components/ui/IconButton";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from "@/components/ui/icons";
import { parseCoverTheme } from "@/lib/coverTheme";
import { addDays, formatDateLong, todayLocal } from "@/lib/date";
import { loadJson } from "@/lib/loadJson";
import { fetchDateRange, fetchNumberRange, type PageData } from "@/lib/pages";
import type { SearchHit } from "@/lib/search";
import type { Direction, FlipState, SpreadData } from "@/lib/spread";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useRestoreFocus } from "@/lib/useRestoreFocus";
import { useSectionSaver } from "@/lib/useSectionSaver";
import { useSidebarOpen } from "@/lib/useSidebarOpen";

type AgendaInfo = { name: string; baseTemplate: string; coverTheme: string | null };

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
    const docked = useMediaQuery("(min-width: 1280px)", false);
    const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
    const toggleRef = useRef<HTMLButtonElement>(null);
    const count = wide ? 2 : 1;
    const { save, problem } = useSectionSaver(agendaId);
    useRestoreFocus(sidebarOpen && !docked, toggleRef);
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
    const sidebarId = "book-sidebar";
    const sidebarLabel = isNotebook ? "Pages" : "Calendar";
    const visiblePages = displayed ? displayed.pages : [];
    const visibleDates = displayed ? visiblePages.flatMap((page) => (page.date ? [page.date] : [])) : [];
    const visibleNumbers = displayed ? visiblePages.flatMap((page) => (page.pageNumber === null ? [] : [page.pageNumber])) : [];

    function pickFromSidebar(start: string) {
        jumpTo(start);
        if (!docked) setSidebarOpen(false);
    }

    return (
        <main className="paper-grain flex min-h-dvh bg-paper">
            <BookSidebar
                id={sidebarId}
                label={sidebarLabel}
                open={sidebarOpen}
                docked={docked}
                onClose={() => setSidebarOpen(false)}
            >
                {isNotebook ? (
                    <PagesSidebar visible={visibleNumbers} onSelect={pickFromSidebar} />
                ) : (
                    <DaysSidebar
                        agendaId={agendaId}
                        visible={visibleDates.length > 0 ? visibleDates : [dateStart]}
                        onSelect={pickFromSidebar}
                    />
                )}
            </BookSidebar>
            <div className="flex min-w-0 flex-1 flex-col">
                <BookTopBar
                    name={agenda.name}
                    backHref={`/agendas/${agendaId}`}
                    sidebarId={sidebarId}
                    sidebarLabel={sidebarOpen ? `Hide ${sidebarLabel.toLowerCase()}` : `Show ${sidebarLabel.toLowerCase()}`}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    toggleRef={toggleRef}
                >
                    {!isNotebook && (
                        <IconButton aria-label="Go to today" onClick={() => jumpTo(todayLocal())}>
                            <CalendarIcon className="size-6" />
                        </IconButton>
                    )}
                    <SearchMenu agendaId={agendaId} onSelect={jumpToHit} />
                    <SoundToggle />
                </BookTopBar>
                <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-center gap-x-2 gap-y-4 px-4 pb-10 md:grid-cols-[auto_minmax(0,1fr)_auto] md:px-6">
                    <IconButton
                        aria-label="Previous page"
                        disabled={!canGoPrevious}
                        onClick={() => go("prev")}
                        className="order-2 size-12 justify-self-start md:order-1 md:size-14"
                    >
                        <ArrowLeftIcon className="size-7" />
                    </IconButton>
                    <div className="order-1 col-span-2 min-w-0 md:order-2 md:col-span-1">
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
                    </div>
                    <IconButton
                        aria-label="Next page"
                        onClick={() => go("next")}
                        className="order-3 size-12 justify-self-end md:size-14"
                    >
                        <ArrowRightIcon className="size-7" />
                    </IconButton>
                </div>
            </div>
            <SaveProblemBanner problem={problem} />
        </main>
    );
}