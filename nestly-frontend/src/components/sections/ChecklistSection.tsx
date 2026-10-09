"use client";

import { useMemo, useState } from "react";
import { RevealText } from "@/components/handwriting/HandwrittenReveal";
import { AddItemButton } from "@/components/sections/AddItemButton";
import { ConfirmableSection } from "@/components/sections/ConfirmableSection";
import { IconButton } from "@/components/ui/IconButton";
import { LineInput } from "@/components/ui/LineInput";
import { CloseIcon } from "@/components/ui/icons";
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
            type="checklist"
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
                                className="mt-1.5 size-5 shrink-0 cursor-pointer accent-focus"
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
                        <div key={item.id} className="flex h-8 items-center gap-1">
                            <label className="-my-1.5 -ml-2 grid size-11 shrink-0 cursor-pointer place-items-center">
                                <input
                                    type="checkbox"
                                    aria-label="Done"
                                    checked={item.done}
                                    onChange={(e) => updateItem(item.id, { done: e.target.checked })}
                                    className="size-5 cursor-pointer accent-focus"
                                />
                            </label>
                            <LineInput
                                aria-label="Item text"
                                maxLength={MAX_ITEM_TEXT_LENGTH}
                                value={item.text}
                                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                                className="flex-1"
                            />
                            <IconButton
                                tone="danger"
                                aria-label="Remove item"
                                className="-my-1.5 -mr-2"
                                onClick={() => removeItem(item.id)}
                            >
                                <CloseIcon className="size-5" />
                            </IconButton>
                        </div>
                    ))}
                    <AddItemButton label="Add item" onClick={addItem} disabled={items.length >= MAX_SECTION_ITEMS} />
                </>
            )}
        </ConfirmableSection>
    );
}