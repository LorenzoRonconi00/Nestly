"use client";

import { useState } from "react";
import { useAutosave } from "@/lib/useAutosave";

const MOODS = [1, 2, 3, 4, 5];
type Props = { initialData: Record<string, unknown>; onSave: (data: Record<string, unknown>) => void };

export function MoodSection({ initialData, onSave }: Readonly<Props>) {
    const [value, setValue] = useState<number>((initialData.value as number) ?? 3);

    useAutosave(value, (v) => onSave({ value: v }));

    return (
        <div className="rounded border p-3">
            <h2 className="mb-2 text-sm font-medium">Mood</h2>
            <div className="flex gap-2">
                {MOODS.map((m) => (
                    <button
                        key={m}
                        onClick={() => setValue(m)}
                        className={`h-8 w-8 cursor-pointer rounded-full border ${value === m ? "bg-foreground text-background" : ""}`}
                    >
                        {m}
                    </button>
                ))}
            </div>
        </div>
    );
}