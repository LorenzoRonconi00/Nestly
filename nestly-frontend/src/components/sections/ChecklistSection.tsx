"use client";

import { useState } from "react";
import { useAutosave } from "@/lib/useAutosave";

type ChecklistItem = { text: string; done: boolean };
type Props = { initialData: Record<string, unknown>; onSave: (data: Record<string, unknown>) => void };

export function ChecklistSection({ initialData, onSave }: Props) {
    const [items, setItems] = useState<ChecklistItem[]>((initialData.items as ChecklistItem[]) ?? []);

    useAutosave(items, (value) => onSave({ items: value }));

    function addItem() {
        setItems([...items, { text: "", done: false }]);
    }

    function updateItem(index: number, patch: Partial<ChecklistItem>) {
        setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    }

    function removeItem(index: number) {
        setItems(items.filter((_, i) => i !== index));
    }

    return (
        <div className="rounded border p-3">
            <h2 className="mb-2 text-sm font-medium">Checklist</h2>
            <div className="flex flex-col gap-2">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input type="checkbox" checked={item.done} onChange={(e) => updateItem(i, { done: e.target.checked })} />
                        <input
                            value={item.text}
                            onChange={(e) => updateItem(i, { text: e.target.value })}
                            className="flex-1 rounded border px-2 py-1"
                        />
                        <button onClick={() => removeItem(i)}>✕</button>
                    </div>
                ))}
            </div>
            <button onClick={addItem} className="mt-2 rounded border px-2 py-1 text-sm">
                + Add item
            </button>
        </div>
    );
}