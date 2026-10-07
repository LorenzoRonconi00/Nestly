"use client";

import { useMemo, useState } from "react";
import { RevealText } from "@/components/handwriting/HandwrittenReveal";
import { ConfirmableSection } from "@/components/sections/ConfirmableSection";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { useAutosave } from "@/lib/useAutosave";
import { clampAmount, MAX_ITEM_TEXT_LENGTH, MAX_SECTION_ITEMS } from "@/lib/sectionLimits";

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
                <div className="flex flex-col">
                    {items.map((item) => (
                        <div key={item.id} className="written flex min-h-8 gap-3">
                            <span className="min-w-0 flex-1">
                                <RevealText text={item.label} />
                            </span>
                            <span className="w-16 shrink-0 text-right">
                                <RevealText text={String(item.amount)} />
                            </span>
                            <span className="w-20 shrink-0 text-ink-soft">
                                <RevealText text={item.category} />
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {items.map((item) => (
                        <div key={item.id} className="flex h-8 items-center gap-2">
                            <TextInput
                                compact
                                placeholder="Label"
                                aria-label="Label"
                                maxLength={MAX_ITEM_TEXT_LENGTH}
                                value={item.label}
                                onChange={(e) => updateItem(item.id, { label: e.target.value })}
                                className="min-w-0 flex-1"
                            />
                            <TextInput
                                compact
                                type="number"
                                placeholder="Amount"
                                aria-label="Amount"
                                value={item.amount}
                                onChange={(e) => updateItem(item.id, { amount: clampAmount(Number(e.target.value)) })}
                                className="w-16 shrink-0"
                            />
                            <TextInput
                                compact
                                placeholder="Category"
                                aria-label="Category"
                                maxLength={MAX_ITEM_TEXT_LENGTH}
                                value={item.category}
                                onChange={(e) => updateItem(item.id, { category: e.target.value })}
                                className="w-20 shrink-0"
                            />
                            <Button
                                variant="dangerGhost"
                                size="sm"
                                aria-label="Remove expense"
                                onClick={() => removeItem(item.id)}
                            >
                                ✕
                            </Button>
                        </div>
                    ))}
                    <div className="flex h-8 items-center">
                        <Button variant="secondary" size="sm" onClick={addItem} disabled={items.length >= MAX_SECTION_ITEMS}>
                            + Add expense
                        </Button>
                    </div>
                </>
            )}
        </ConfirmableSection>
    );
}