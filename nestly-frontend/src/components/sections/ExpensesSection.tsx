"use client";

import { useState } from "react";
import { useAutosave } from "@/lib/useAutosave";

type ExpenseItem = { label: string; amount: number; category: string };
type Props = { initialData: Record<string, unknown>; onSave: (data: Record<string, unknown>) => void };

export function ExpensesSection({ initialData, onSave }: Props) {
    const [items, setItems] = useState<ExpenseItem[]>((initialData.items as ExpenseItem[]) ?? []);

    useAutosave(items, (value) => onSave({ items: value }));

    function addItem() {
        setItems([...items, { label: "", amount: 0, category: "" }]);
    }

    function updateItem(index: number, patch: Partial<ExpenseItem>) {
        setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    }

    function removeItem(index: number) {
        setItems(items.filter((_, i) => i !== index));
    }

    return (
        <div className="rounded border p-3">
            <h2 className="mb-2 text-sm font-medium">Expenses</h2>
            <div className="flex flex-col gap-2">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <input
                            placeholder="Label"
                            value={item.label}
                            onChange={(e) => updateItem(i, { label: e.target.value })}
                            className="flex-1 rounded border px-2 py-1"
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) => updateItem(i, { amount: Number(e.target.value) })}
                            className="w-24 rounded border px-2 py-1"
                        />
                        <input
                            placeholder="Category"
                            value={item.category}
                            onChange={(e) => updateItem(i, { category: e.target.value })}
                            className="w-28 rounded border px-2 py-1"
                        />
                        <button onClick={() => removeItem(i)}>✕</button>
                    </div>
                ))}
            </div>
            <button onClick={addItem} className="mt-2 rounded border px-2 py-1 text-sm">
                + Add expense
            </button>
        </div>
    );
}