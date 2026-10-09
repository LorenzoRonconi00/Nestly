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

type AppointmentItem = { id: string; time: string; description: string };
type Props = { initialData: Record<string, unknown>; onSave: (data: Record<string, unknown>) => void };

function withIds(items: unknown): AppointmentItem[] {
    return ((items as Partial<AppointmentItem>[]) ?? []).map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        time: item.time ?? "",
        description: item.description ?? "",
    }));
}

export function AppointmentsSection({ initialData, onSave }: Readonly<Props>) {
    const [items, setItems] = useState<AppointmentItem[]>(withIds(initialData.items));
    const [confirmed, setConfirmed] = useState(initialData.confirmed === true);

    const data = useMemo(() => ({ items, confirmed }), [items, confirmed]);
    useAutosave(data, onSave);

    function addItem() {
        setItems([...items, { id: crypto.randomUUID(), time: "", description: "" }]);
    }

    function updateItem(id: string, patch: Partial<AppointmentItem>) {
        setItems(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }

    function removeItem(id: string) {
        setItems(items.filter((item) => item.id !== id));
    }

    return (
        <ConfirmableSection
            type="appointments"
            confirmed={confirmed}
            onConfirm={() => setConfirmed(true)}
            onEdit={() => setConfirmed(false)}
        >
            {confirmed ? (
                <div className="flex flex-col">
                    {items.map((item) => (
                        <div key={item.id} className="written flex min-h-8 gap-3">
                            <span className="w-14 shrink-0">
                                <RevealText text={item.time} />
                            </span>
                            <span>
                                <RevealText text={item.description} />
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-wrap items-center gap-x-2">
                            <LineInput
                                type="time"
                                aria-label="Time"
                                value={item.time}
                                onChange={(e) => updateItem(item.id, { time: e.target.value })}
                                className="w-28 shrink-0"
                            />
                            <LineInput
                                placeholder="Description"
                                aria-label="Description"
                                maxLength={MAX_ITEM_TEXT_LENGTH}
                                value={item.description}
                                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                className="flex-1 basis-40"
                            />
                            <IconButton
                                tone="danger"
                                aria-label="Remove appointment"
                                className="-my-1.5 -mr-2"
                                onClick={() => removeItem(item.id)}
                            >
                                <CloseIcon className="size-5" />
                            </IconButton>
                        </div>
                    ))}
                    <AddItemButton label="Add appointment" onClick={addItem} disabled={items.length >= MAX_SECTION_ITEMS} />
                </>
            )}
        </ConfirmableSection>
    );
}