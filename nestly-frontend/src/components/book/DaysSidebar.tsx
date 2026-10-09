"use client";

import { useEffect, useRef, useState } from "react";
import { SidebarHeader } from "@/components/book/SidebarHeader";
import { addMonths, buildMonthGrid, formatDateLong, formatMonthLong, monthOf, todayLocal } from "@/lib/date";
import { fetchDaysWithContent } from "@/lib/pages";

const NO_DAYS = new Set<string>();
const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "short" });

type Props = { agendaId: string; visible: string[]; onSelect: (date: string) => void };

export function DaysSidebar({ agendaId, visible, onSelect }: Readonly<Props>) {
    const listRef = useRef<HTMLUListElement>(null);
    const anchor = visible[0];
    const anchorMonth = monthOf(anchor);
    const [view, setView] = useState({ anchorMonth, month: anchorMonth });
    const [marks, setMarks] = useState<{ month: string; days: Set<string> } | null>(null);
    const month = view.anchorMonth === anchorMonth ? view.month : anchorMonth;

    if (view.anchorMonth !== anchorMonth) setView({ anchorMonth, month: anchorMonth });

    useEffect(() => {
        let cancelled = false;
        fetchDaysWithContent(agendaId, month).then((days) => {
            if (!cancelled) setMarks({ month, days: new Set(days) });
        });
        return () => {
            cancelled = true;
        };
    }, [agendaId, month, anchor]);

    useEffect(() => {
        listRef.current?.querySelector("[aria-current]")?.scrollIntoView({ block: "nearest" });
    }, [anchor, month]);

    const today = todayLocal();
    const written = marks?.month === month ? marks.days : NO_DAYS;
    const days = buildMonthGrid(month).filter((cell) => cell.inMonth);

    return (
        <>
            <SidebarHeader
                title={formatMonthLong(month)}
                previousLabel="Previous month"
                nextLabel="Next month"
                onPrevious={() => setView({ anchorMonth, month: addMonths(month, -1) })}
                onNext={() => setView({ anchorMonth, month: addMonths(month, 1) })}
            />
            <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
                {days.map(({ date }) => {
                    const shown = visible.includes(date);
                    const hasWriting = written.has(date);
                    return (
                        <li key={date}>
                            <button
                                type="button"
                                onClick={() => onSelect(date)}
                                aria-current={shown ? "page" : undefined}
                                aria-label={`${formatDateLong(date)}${hasWriting ? ", has writing" : ""}`}
                                className={`flex min-h-11 w-full cursor-pointer items-center gap-3 border-b border-line px-5 text-left transition-colors duration-150 ease-out hover:bg-accent-soft/60 motion-reduce:transition-none ${
                                    shown ? "bg-accent-soft shadow-[inset_4px_0_0_0_var(--color-focus)]" : ""
                                }`}
                            >
                                <span aria-hidden="true" className="w-9 text-sm text-ink-soft">
                                    {WEEKDAY.format(new Date(`${date}T00:00:00`))}
                                </span>
                                <span aria-hidden="true" className="w-8 font-hand text-2xl leading-none text-ink">
                                    {Number(date.slice(8))}
                                </span>
                                {date === today && (
                                    <span aria-hidden="true" className="rounded-full border border-ink-soft px-2 text-xs text-ink-soft">
                                        today
                                    </span>
                                )}
                                {hasWriting && <span aria-hidden="true" className="ml-auto size-2 rounded-full bg-focus" />}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}