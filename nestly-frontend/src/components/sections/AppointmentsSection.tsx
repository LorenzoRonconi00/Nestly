"use client";

import { useState } from "react";
import { useAutosave } from "@/lib/useAutosave";

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

    useAutosave(items, (value) => onSave({ items: value }));

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
        <div className="rounded border p-3">
            <h2 className="mb-2 text-sm font-medium">Appointments</h2>
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
        </div>
    );
}