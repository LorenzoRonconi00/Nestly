"use client";

import { useMemo, useState } from "react";
import { RevealText } from "@/components/handwriting/HandwrittenReveal";
import { ConfirmableSection } from "@/components/sections/ConfirmableSection";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { useAutosave } from "@/lib/useAutosave";
import { MAX_ITEM_TEXT_LENGTH, MAX_SECTION_ITEMS } from "@/lib/sectionLimits";

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
                <div className="flex flex-col">
                    {items.map((item) => (
                        <label key={item.id} className="written flex min-h-8 cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={item.done}
                                onChange={(e) => updateItem(item.id, { done: e.target.checked })}
                                className="mt-2 h-4 w-4 accent-focus"
                            />
                            <span className={item.done ? "text-ink-soft line-through" : ""}>
                                <RevealText text={item.text} />
                            </span>
                        </label>
                    ))}
                </div>
            ) : (
                <>
                    {items.map((item) => (
                        <div key={item.id} className="flex h-8 items-center gap-2">
                            <input
                                type="checkbox"
                                aria-label="Done"
                                checked={item.done}
                                onChange={(e) => updateItem(item.id, { done: e.target.checked })}
                                className="h-4 w-4 accent-focus"
                            />
                            <TextInput
                                compact
                                aria-label="Item text"
                                maxLength={MAX_ITEM_TEXT_LENGTH}
                                value={item.text}
                                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                                className="min-w-0 flex-1"
                            />
                            <Button variant="dangerGhost" size="sm" aria-label="Remove item" onClick={() => removeItem(item.id)}>
                                ✕
                            </Button>
                        </div>
                    ))}
                    <div className="flex h-8 items-center">
                        <Button variant="secondary" size="sm" onClick={addItem} disabled={items.length >= MAX_SECTION_ITEMS}>
                            + Add item
                        </Button>
                    </div>
                </>
            )}
        </ConfirmableSection>
    );
}