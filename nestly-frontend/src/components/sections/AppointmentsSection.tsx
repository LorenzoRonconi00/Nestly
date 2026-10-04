"use client";

import { useMemo, useState } from "react";
import { useAutosave } from "@/lib/useAutosave";
import { RevealText } from "@/components/handwriting/HandwrittenReveal";
import { ConfirmableSection } from "@/components/sections/ConfirmableSection";

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
            title="Appointments"
            confirmed={confirmed}
            onConfirm={() => setConfirmed(true)}
            onEdit={() => setConfirmed(false)}
        >
            {confirmed ? (
                <div className="flex flex-col gap-1">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
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
                    <div className="flex flex-col gap-2">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-2">
                                <input
                                    type="time"
                                    value={item.time}
                                    onChange={(e) => updateItem(item.id, { time: e.target.value })}
                                    className="rounded border px-2 py-1"
                                />
                                <input
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                    className="flex-1 rounded border px-2 py-1"
                                />
                                <button onClick={() => removeItem(item.id)}>✕</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addItem} className="mt-2 rounded border px-2 py-1 text-sm">
                        + Add appointment
                    </button>
                </>
            )}
        </ConfirmableSection>
    );
}