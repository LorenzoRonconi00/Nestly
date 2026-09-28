"use client";

import { useState } from "react";
import { useAutosave } from "@/lib/useAutosave";

type AppointmentItem = { time: string; description: string };
type Props = { initialData: Record<string, unknown>; onSave: (data: Record<string, unknown>) => void };

export function AppointmentsSection({ initialData, onSave }: Props) {
    const [items, setItems] = useState<AppointmentItem[]>((initialData.items as AppointmentItem[]) ?? []);

    useAutosave(items, (value) => onSave({ items: value }));

    function addItem() {
        setItems([...items, { time: "", description: "" }]);
    }

    function updateItem(index: number, patch: Partial<AppointmentItem>) {
        setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    }

    function removeItem(index: number) {
        setItems(items.filter((_, i) => i !== index));
    }

    return (
        <div className="rounded border p-3">
            <h2 className="mb-2 text-sm font-medium">Appointments</h2>
            <div className="flex flex-col gap-2">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <input
                            type="time"
                            value={item.time}
                            onChange={(e) => updateItem(i, { time: e.target.value })}
                            className="rounded border px-2 py-1"
                        />
                        <input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateItem(i, { description: e.target.value })}
                            className="flex-1 rounded border px-2 py-1"
                        />
                        <button onClick={() => removeItem(i)}>✕</button>
                    </div>
                ))}
            </div>
            <button onClick={addItem} className="mt-2 rounded border px-2 py-1 text-sm">
                + Add appointment
            </button>
        </div>
    );
}