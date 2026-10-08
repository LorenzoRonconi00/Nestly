"use client";

import type { CSSProperties, ReactNode } from "react";
import { PageSections } from "@/components/PageSections";
import { sectionInfo } from "@/components/structure/sectionTypes";
import { CrayonFrame } from "@/components/ui/CrayonFrame";
import { ArrowDownIcon, ArrowUpIcon, CloseIcon } from "@/components/ui/icons";
import { buildSampleSections } from "@/lib/sampleSections";

type SectionItem = { type: string; order: number };

type Props = {
    sections: SectionItem[];
    onMove: (index: number, direction: -1 | 1) => void;
    onRemove: (type: string) => void;
};

const NOOP = () => undefined;

function IconButton({
    label,
    disabled,
    onClick,
    children,
}: Readonly<{ label: string; disabled?: boolean; onClick: () => void; children: ReactNode }>) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="grid size-11 cursor-pointer place-items-center rounded-full text-ink-soft transition-[transform,color,background-color] duration-150 ease-out hover:bg-accent-soft hover:text-ink active:scale-95 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent motion-reduce:transition-none md:size-9"
        >
            {children}
        </button>
    );
}

export function PageComposer({ sections, onMove, onRemove }: Readonly<Props>) {
    if (sections.length === 0) {
        return (
            <div className="relative grid min-h-40 place-items-center px-6 py-8 text-center">
                <CrayonFrame dashed />
                <p className="relative font-hand text-2xl leading-8 text-ink-soft">Pick a section to start your page.</p>
            </div>
        );
    }

    return (
        <ul className="flex flex-col gap-6">
            {sections.map((section, index) => {
                const info = sectionInfo(section.type);
                return (
                    <li
                        key={section.type}
                        className="rise-quick relative -mx-2 rounded-xl px-2 py-1 transition-colors duration-150 focus-within:bg-accent-soft/30 hover:bg-accent-soft/30 motion-reduce:transition-none"
                        style={{ "--i": Math.min(index, 7) } as CSSProperties}
                    >
                        {/* The selector hides the sample section's own "Edit" pill, which is not part of the layout; it depends on ConfirmableSection's markup */}
                        <div inert aria-hidden="true" className="[&_section>div:first-child>button]:hidden">
                            <PageSections sections={buildSampleSections([{ type: section.type, order: 1 }])} onSaveSection={NOOP} />
                        </div>
                        <div role="group" aria-label={info.label} className="absolute -top-2 right-1 flex">
                            <IconButton label={`Move ${info.label} up`} disabled={index === 0} onClick={() => onMove(index, -1)}>
                                <ArrowUpIcon className="size-5" />
                            </IconButton>
                            <IconButton label={`Move ${info.label} down`} disabled={index === sections.length - 1} onClick={() => onMove(index, 1)}>
                                <ArrowDownIcon className="size-5" />
                            </IconButton>
                            <IconButton label={`Remove ${info.label}`} onClick={() => onRemove(section.type)}>
                                <CloseIcon className="size-5" />
                            </IconButton>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}