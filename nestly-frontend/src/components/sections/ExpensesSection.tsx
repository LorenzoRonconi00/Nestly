"use client";

import { useMemo, useState } from "react";
import { RevealText } from "@/components/handwriting/HandwrittenReveal";
import { AddItemButton } from "@/components/sections/AddItemButton";
import { ConfirmableSection } from "@/components/sections/ConfirmableSection";
import { IconButton } from "@/components/ui/IconButton";
import { LineInput } from "@/components/ui/LineInput";
import { CloseIcon } from "@/components/ui/icons";
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
            type="expenses"
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
                <div className="@container">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-wrap items-center gap-x-2">
                            <LineInput
                                placeholder="Label"
                                aria-label="Label"
                                maxLength={MAX_ITEM_TEXT_LENGTH}
                                value={item.label}
                                onChange={(e) => updateItem(item.id, { label: e.target.value })}
                                className="basis-full @md:basis-0 @md:flex-2"
                            />
                            <LineInput
                                type="number"
                                placeholder="Amount"
                                aria-label="Amount"
                                value={item.amount}
                                onChange={(e) => updateItem(item.id, { amount: clampAmount(Number(e.target.value)) })}
                                className="w-24 shrink-0"
                            />
                            <LineInput
                                placeholder="Category"
                                aria-label="Category"
                                maxLength={MAX_ITEM_TEXT_LENGTH}
                                value={item.category}
                                onChange={(e) => updateItem(item.id, { category: e.target.value })}
                                className="flex-1"
                            />
                            <IconButton
                                tone="danger"
                                aria-label="Remove expense"
                                className="-my-1.5 -mr-2"
                                onClick={() => removeItem(item.id)}
                            >
                                <CloseIcon className="size-5" />
                            </IconButton>
                        </div>
                    ))}
                    <AddItemButton label="Add expense" onClick={addItem} disabled={items.length >= MAX_SECTION_ITEMS} />
                </div>
            )}
        </ConfirmableSection>
    );
}