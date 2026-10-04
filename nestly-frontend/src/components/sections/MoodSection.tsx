"use client";

import { useState } from "react";
import { useAutosave } from "@/lib/useAutosave";

const MOODS = [1, 2, 3, 4, 5];
type Props = { initialData: Record<string, unknown>; onSave: (data: Record<string, unknown>) => void };

export function MoodSection({ initialData, onSave }: Readonly<Props>) {
    const [value, setValue] = useState<number | null>((initialData.value as number | undefined) ?? null);

    useAutosave(value, (v) => {
        if (v !== null) onSave({ value: v });
    });

    return (
        <section>
            <div className="flex h-8 items-center">
                <h2 className="text-xs font-bold tracking-wider text-ink-soft uppercase">Mood</h2>
            </div>
            <div role="group" aria-label="Mood" className="flex h-8 gap-2">
                {MOODS.map((m) => (
                    <button
                        key={m}
                        type="button"
                        aria-pressed={value === m}
                        aria-label={`Mood ${m} of ${MOODS.length}`}
                        onClick={() => setValue(m)}
                        className={`h-8 w-8 cursor-pointer rounded-full border text-sm font-semibold transition-colors ${value === m
                                ? "border-ink bg-accent text-ink"
                                : "border-border-strong bg-sheet text-ink hover:bg-accent-soft"
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>
        </section>
    );
}