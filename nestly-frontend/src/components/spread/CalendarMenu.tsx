"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { addMonths, buildMonthGrid, formatDateLong, formatMonthLong, monthOf, todayLocal } from "@/lib/date";
import { fetchDaysWithContent } from "@/lib/pages";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const NO_DAYS = new Set<string>();

type Props = { agendaId: string; selected: string; onSelect: (date: string) => void };

export function CalendarMenu({ agendaId, selected, onSelect }: Readonly<Props>) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(() => monthOf(selected));
    const [marks, setMarks] = useState<{ month: string; days: Set<string> } | null>(null);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        fetchDaysWithContent(agendaId, month).then((days) => {
            if (!cancelled) setMarks({ month, days: new Set(days) });
        });
        return () => {
            cancelled = true;
        };
    }, [open, agendaId, month]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    function toggle() {
        if (!open) setMonth(monthOf(selected));
        setOpen((current) => !current);
    }

    function select(date: string) {
        setOpen(false);
        onSelect(date);
    }

    const today = todayLocal();
    const days = marks?.month === month ? marks.days : NO_DAYS;

    return (
        <div ref={rootRef} className="relative">
            <Button variant="ghost" aria-expanded={open} aria-haspopup="dialog" onClick={toggle}>
                Calendar
            </Button>
            {open && (
                <div
                    role="dialog"
                    aria-label="Calendar"
                    className="absolute bottom-full left-1/2 z-40 mb-2 w-72 -translate-x-1/2 rounded-2xl border border-border bg-sheet p-4 shadow-lg"
                >
                    <div className="mb-2 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Previous month"
                            onClick={() => setMonth(addMonths(month, -1))}
                        >
                            ‹
                        </Button>
                        <span className="text-sm font-bold">{formatMonthLong(month)}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Next month"
                            onClick={() => setMonth(addMonths(month, 1))}
                        >
                            ›
                        </Button>
                    </div>
                    <div className="grid grid-cols-7 place-items-center gap-y-1">
                        {WEEKDAYS.map((weekday) => (
                            <span key={weekday} className="text-xs text-ink-soft">
                                {weekday}
                            </span>
                        ))}
                        {buildMonthGrid(month).map((cell) => (
                            <button
                                key={cell.date}
                                type="button"
                                onClick={() => select(cell.date)}
                                aria-label={formatDateLong(cell.date)}
                                aria-current={cell.date === today ? "date" : undefined}
                                className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm ${cell.inMonth ? "text-ink" : "text-ink-soft/60"
                                    } ${cell.date === selected ? "bg-accent font-bold" : "hover:bg-accent-soft"} ${cell.date === today ? "ring-1 ring-ink" : ""
                                    }`}
                            >
                                {Number(cell.date.slice(8))}
                                {days.has(cell.date) && (
                                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-ink" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}