"use client";

import { useState } from "react";
import { useAutosave } from "@/lib/useAutosave";

type ChecklistItem = { id: string; text: string; done: boolean };
type Props = { initialData: Record<string, unknown>; onSave: (data: Record<string, unknown>) => void };

function withIds(items: unknown): ChecklistItem[] {
    return ((items as Partial<ChecklistItem>[]) ?? []).map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        text: item.text ?? "",
        done: item.done ?? false,
    }));
}

export function ChecklistSection({ initialData, onSave }: Readonly<Props>) {
    const [items, setItems] = useState<ChecklistItem[]>(withIds(initialData.items));

    useAutosave(items, (value) => onSave({ items: value }));

    function addItem() {
        setItems([...items, { id: crypto.randomUUID(), text: "", done: false }]);
    }

    function updateItem(id: string, patch: Partial<ChecklistItem>) {
        setItems(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }

    function removeItem(id: string) {
        setItems(items.filter((item) => item.id !== id));
    }

    return (
        <div className="rounded border p-3">
            <h2 className="mb-2 text-sm font-medium">Checklist</h2>
            <div className="flex flex-col gap-2">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={item.done} onChange={(e) => updateItem(item.id, { done: e.target.checked })} />
                        <input
                            value={item.text}
                            onChange={(e) => updateItem(item.id, { text: e.target.value })}
                            className="flex-1 rounded border px-2 py-1"
                        />
                        <button onClick={() => removeItem(item.id)}>✕</button>
                    </div>
                ))}
            </div>
            <button onClick={addItem} className="mt-2 rounded border px-2 py-1 text-sm">
                + Add item
            </button>
        </div>
    );
}