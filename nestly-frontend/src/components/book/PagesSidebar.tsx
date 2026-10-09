"use client";

import { useState, type FormEvent } from "react";
import { SidebarHeader } from "@/components/book/SidebarHeader";
import { Field } from "@/components/ui/Field";
import { NotebookIcon } from "@/components/ui/icons";

const BLOCK_SIZE = 20;

type Props = { visible: number[]; onSelect: (page: string) => void };

function blockOf(page: number) {
    return Math.floor((Math.max(1, page) - 1) / BLOCK_SIZE);
}

export function PagesSidebar({ visible, onSelect }: Readonly<Props>) {
    const anchorBlock = blockOf(visible[0] ?? 1);
    const [view, setView] = useState({ anchorBlock, block: anchorBlock });
    const [typed, setTyped] = useState("");
    const block = view.anchorBlock === anchorBlock ? view.block : anchorBlock;

    if (view.anchorBlock !== anchorBlock) setView({ anchorBlock, block: anchorBlock });

    const first = block * BLOCK_SIZE + 1;
    const pages = Array.from({ length: BLOCK_SIZE }, (_, index) => first + index);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const page = Math.floor(Number(typed));
        if (!Number.isFinite(page) || page < 1) return;
        setTyped("");
        onSelect(String(page));
    }

    return (
        <>
            <SidebarHeader
                title={`Pages ${first}–${first + BLOCK_SIZE - 1}`}
                previousLabel="Previous pages"
                nextLabel="Next pages"
                onPrevious={() => setView({ anchorBlock, block: Math.max(0, block - 1) })}
                onNext={() => setView({ anchorBlock, block: block + 1 })}
            />
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {pages.map((page) => {
                    const shown = visible.includes(page);
                    return (
                        <li key={page}>
                            <button
                                type="button"
                                onClick={() => onSelect(String(page))}
                                aria-current={shown ? "page" : undefined}
                                aria-label={`Page ${page}`}
                                className={`flex min-h-11 w-full cursor-pointer items-center gap-3 border-b border-line px-5 text-left transition-colors duration-150 ease-out hover:bg-accent-soft/60 motion-reduce:transition-none ${
                                    shown ? "bg-accent-soft shadow-[inset_4px_0_0_0_var(--color-focus)]" : ""
                                }`}
                            >
                                <span aria-hidden="true" className="font-hand text-2xl leading-none text-ink">
                                    {page}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
            <form onSubmit={handleSubmit} className="border-t border-border px-5 pt-3 pb-4">
                <Field
                    label="Go to page"
                    icon={NotebookIcon}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={typed}
                    onChange={(event) => setTyped(event.target.value)}
                    hint="Press Enter to go."
                />
            </form>
        </>
    );
}