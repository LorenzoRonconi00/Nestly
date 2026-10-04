"use client";

import { useMemo, useState } from "react";
import { useAutosave } from "@/lib/useAutosave";
import { RevealText } from "@/components/handwriting/HandwrittenReveal";
import { ConfirmableSection } from "@/components/sections/ConfirmableSection";

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
    const [confirmed, setConfirmed] = useState(initialData.confirmed === true);

    const data = useMemo(() => ({ items, confirmed }), [items, confirmed]);
    useAutosave(data, onSave);

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
        <ConfirmableSection
            title="Expenses"
            confirmed={confirmed}
            onConfirm={() => setConfirmed(true)}
            onEdit={() => setConfirmed(false)}
        >
            {confirmed ? (
                <div className="flex flex-col gap-1">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                            <span className="flex-1">
                                <RevealText text={item.label} />
                            </span>
                            <span className="w-20 shrink-0 text-right">
                                <RevealText text={String(item.amount)} />
                            </span>
                            <span className="w-24 shrink-0 text-gray-500">
                                <RevealText text={item.category} />
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
                </>
            )}
        </ConfirmableSection>
    );
}