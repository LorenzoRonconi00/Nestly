"use client";

import { useState } from "react";
import { MoodFace } from "@/components/sections/MoodFace";
import { SectionHeading } from "@/components/sections/SectionHeading";
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
                <SectionHeading type="mood" />
            </div>
            <div role="group" aria-label="Mood" className="flex h-8 items-center gap-1">
                {MOODS.map((m) => (
                    <button
                        key={m}
                        type="button"
                        aria-pressed={value === m}
                        aria-label={`Mood ${m} of ${MOODS.length}`}
                        onClick={() => setValue(m)}
                        className={`-my-1.5 -ml-1 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full transition-[transform,background-color,color] duration-150 ease-out-strong active:scale-95 motion-reduce:transition-none ${
                            value === m ? "bg-accent text-ink" : "text-ink-soft hover:bg-accent-soft hover:text-ink"
                        }`}
                    >
                        <MoodFace level={m} />
                    </button>
                ))}
            </div>
        </section>
    );
}