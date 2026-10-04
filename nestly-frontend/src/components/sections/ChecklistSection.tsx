"use client";

import { useMemo, useState } from "react";
import { useAutosave } from "@/lib/useAutosave";
import { RevealText } from "@/components/handwriting/HandwrittenReveal";
import { ConfirmableSection } from "@/components/sections/ConfirmableSection";

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
    const [confirmed, setConfirmed] = useState(initialData.confirmed === true);

    const data = useMemo(() => ({ items, confirmed }), [items, confirmed]);
    useAutosave(data, onSave);

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
        <ConfirmableSection
            title="Checklist"
            confirmed={confirmed}
            onConfirm={() => setConfirmed(true)}
            onEdit={() => setConfirmed(false)}
        >
            {confirmed ? (
                <div className="flex flex-col gap-1">
                    {items.map((item) => (
                        <label key={item.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={item.done}
                                onChange={(e) => updateItem(item.id, { done: e.target.checked })}
                            />
                            <span className={item.done ? "text-gray-400 line-through" : ""}>
                                <RevealText text={item.text} />
                            </span>
                        </label>
                    ))}
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-2">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={item.done}
                                    onChange={(e) => updateItem(item.id, { done: e.target.checked })}
                                />
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
                </>
            )}
        </ConfirmableSection>
    );
}