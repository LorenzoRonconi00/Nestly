"use client";

import { useState } from "react";
import { useAutosave } from "@/lib/useAutosave";

type ExpenseItem = { id: string; label: string; amount: number; category: string };
type Props = { initialData: Record<string, unknown>; onSave: (data: Record<string, unknown>) => void };

function withIds(items: unknown): ExpenseItem[] {
    return ((items as Partial<ExpenseItem>[]) ?? []).map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        label: item.label ?? "",
        amount: item.amount ?? 0,
        category: item.category ?? "",
    }));
}

export function ExpensesSection({ initialData, onSave }: Readonly<Props>) {
    const [items, setItems] = useState<ExpenseItem[]>(withIds(initialData.items));

    useAutosave(items, (value) => onSave({ items: value }));

    function addItem() {
        setItems([...items, { id: crypto.randomUUID(), label: "", amount: 0, category: "" }]);
    }

    function updateItem(id: string, patch: Partial<ExpenseItem>) {
        setItems(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }

    function removeItem(id: string) {
        setItems(items.filter((item) => item.id !== id));
    }

    return (
        <div className="rounded border p-3">
            <h2 className="mb-2 text-sm font-medium">Expenses</h2>
            <div className="flex flex-col gap-2">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-2">
                        <input
                            placeholder="Label"
                            value={item.label}
                            onChange={(e) => updateItem(item.id, { label: e.target.value })}
                            className="flex-1 rounded border px-2 py-1"
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) => updateItem(item.id, { amount: Number(e.target.value) })}
                            className="w-24 rounded border px-2 py-1"
                        />
                        <input
                            placeholder="Category"
                            value={item.category}
                            onChange={(e) => updateItem(item.id, { category: e.target.value })}
                            className="w-28 rounded border px-2 py-1"
                        />
                        <button onClick={() => removeItem(item.id)}>✕</button>
                    </div>
                ))}
            </div>
            <button onClick={addItem} className="mt-2 rounded border px-2 py-1 text-sm">
                + Add expense
            </button>
        </div>
    );
}