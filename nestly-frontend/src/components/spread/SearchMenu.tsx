"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { formatDateLong } from "@/lib/date";
import { searchAgenda, type SearchHit, type SearchOutcome, type SearchSegment } from "@/lib/search";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;
const SECTION_LABELS: Record<string, string> = {
    freetext: "Free text",
    checklist: "Checklist",
    appointments: "Appointments",
    expenses: "Expenses",
};

type Props = { agendaId: string; onSelect: (hit: SearchHit) => void };

// The offset of a segment inside the snippet is stable and unique, so it works as a React key
function withOffsets(segments: SearchSegment[]) {
    let offset = 0;
    return segments.map((segment) => {
        const keyed = { ...segment, offset };
        offset += segment.text.length;
        return keyed;
    });
}

function Segments({ segments }: Readonly<{ segments: SearchSegment[] }>) {
    return (
        <>
            {withOffsets(segments).map(({ text, match, offset }) =>
                match ? (
                    <mark key={offset} className="rounded bg-accent px-0.5 font-semibold text-ink">
                        {text}
                    </mark>
                ) : (
                    <span key={offset}>{text}</span>
                ),
            )}
        </>
    );
}

function hitTitle(hit: SearchHit) {
    return hit.date ? formatDateLong(hit.date) : `Page ${hit.pageNumber}`;
}

export function SearchMenu({ agendaId, onSelect }: Readonly<Props>) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [outcome, setOutcome] = useState<{ query: string; result: SearchOutcome } | null>(null);
    const trimmed = query.trim();
    const debounced = useDebouncedValue(trimmed, DEBOUNCE_MS);
    const searchable = debounced.length >= MIN_QUERY_LENGTH;

    useEffect(() => {
        if (open) dialogRef.current?.querySelector("input")?.focus();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    useEffect(() => {
        if (!open || !searchable) return;
        const controller = new AbortController();
        searchAgenda(agendaId, debounced, controller.signal).then((result) => {
            if (!controller.signal.aborted) setOutcome({ query: debounced, result });
        });
        return () => controller.abort();
    }, [open, searchable, agendaId, debounced]);

    function select(hit: SearchHit) {
        setOpen(false);
        onSelect(hit);
    }

    const tooShort = trimmed.length < MIN_QUERY_LENGTH;
    const current = !tooShort && outcome?.query === trimmed ? outcome.result : null;

    let status: string | null = null;
    if (tooShort) {
        status = `Type at least ${MIN_QUERY_LENGTH} letters to search this agenda.`;
    } else if (!current) {
        status = "Searching…";
    } else if (current.error) {
        status = current.error;
    } else if (current.hits.length === 0) {
        status = `No results for “${trimmed}”.`;
    }

    return (
        <>
            <Button variant="ghost" aria-haspopup="dialog" onClick={() => setOpen(true)}>
                Search
            </Button>
            {open && (
                <div
                    role="presentation"
                    className="fixed inset-0 z-40 flex items-start justify-center bg-ink/30 px-4 pt-20"
                    onPointerDown={(event) => {
                        if (event.target === event.currentTarget) setOpen(false);
                    }}
                >
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Search"
                        className="flex max-h-[70vh] w-full max-w-md flex-col gap-3 rounded-2xl border border-border bg-sheet p-4 shadow-lg"
                    >
                        <TextInput
                            type="search"
                            aria-label="Search this agenda"
                            placeholder="Search this agenda"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && current?.hits[0]) select(current.hits[0]);
                            }}
                        />
                        {status && (
                            <p role="status" className="text-sm text-ink-soft">
                                {status}
                            </p>
                        )}
                        {current && current.hits.length > 0 && (
                            <ul className="flex flex-col gap-1 overflow-y-auto">
                                {current.hits.map((hit) => (
                                    <li key={hit.pageId}>
                                        <button
                                            type="button"
                                            onClick={() => select(hit)}
                                            className="w-full cursor-pointer rounded-xl px-3 py-2 text-left hover:bg-accent-soft"
                                        >
                                            <span className="font-hand text-lg">{hitTitle(hit)}</span>
                                            {hit.snippets.map((snippet) => (
                                                <span key={snippet.section} className="mt-0.5 block text-sm text-ink-soft">
                                                    <span className="mr-2 text-xs font-bold tracking-wider uppercase">
                                                        {SECTION_LABELS[snippet.section] ?? snippet.section}
                                                    </span>
                                                    <Segments segments={snippet.segments} />
                                                </span>
                                            ))}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}