"use client";

import { SECTION_TYPES } from "@/components/structure/sectionTypes";
import { CrayonFrame } from "@/components/ui/CrayonFrame";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";

type Props = { activeTypes: string[]; onAdd: (type: string) => void; layout: "stack" | "row" };

export function SectionPalette({ activeTypes, onAdd, layout }: Readonly<Props>) {
    return (
        <ul className={layout === "stack" ? "flex flex-col gap-3" : "-mr-5 flex snap-x gap-3 overflow-x-auto pr-5 pb-3"}>
            {SECTION_TYPES.map(({ value, label, description, Icon }) => {
                const added = activeTypes.includes(value);
                return (
                    <li key={value} className={layout === "row" ? "w-60 shrink-0 snap-start" : undefined}>
                        <button
                            type="button"
                            disabled={added}
                            onClick={() => onAdd(value)}
                            className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-[transform,background-color] duration-150 ease-out-strong enabled:cursor-pointer enabled:hover:bg-accent-soft/40 enabled:active:scale-[0.98] disabled:cursor-default motion-reduce:transition-none ${
                                added ? "bg-accent-soft/60" : ""
                            }`}
                        >
                            <CrayonFrame />
                            <Icon className="relative size-8 shrink-0 text-ink" />
                            <span className="relative flex min-w-0 flex-1 flex-col">
                                <span className="font-hand text-2xl leading-7 text-ink">{label}</span>
                                <span className="text-sm text-ink-soft">{description}</span>
                            </span>
                            {added ? (
                                <CheckIcon className="relative size-6 shrink-0 text-ink" />
                            ) : (
                                <PlusIcon className="relative size-6 shrink-0 text-ink-soft" />
                            )}
                            {added && <span className="sr-only">Already on the page</span>}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}