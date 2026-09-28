"use client";

import { useState } from "react";
import { useAutosave } from "@/lib/useAutosave";

type Props = {
    initialData: Record<string, unknown>;
    onSave: (data: Record<string, unknown>) => void;
};

export function FreetextSection({ initialData, onSave }: Props) {
    const [text, setText] = useState((initialData.text as string) ?? "");

    useAutosave(text, (value) => onSave({ text: value }));

    return (
        <div className="rounded border p-3">
            <h2 className="mb-2 text-sm font-medium">Free text</h2>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full rounded border px-2 py-1"
            />
        </div>
    );
}