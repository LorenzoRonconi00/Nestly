"use client";

import { AGENDA_TEMPLATES, type AgendaTemplate } from "@/components/agenda/templates";
import { CrayonFrame } from "@/components/ui/CrayonFrame";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";

type Props = { value: AgendaTemplate; onChange: (value: AgendaTemplate) => void };

export function TemplateCards({ value, onChange }: Readonly<Props>) {
    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-hand text-xl leading-6 text-ink">Type</legend>
            <div className="flex flex-col gap-3">
                {AGENDA_TEMPLATES.map(({ value: option, label, description, Icon }) => {
                    const selected = value === option;
                    return (
                        <label
                            key={option}
                            className={`relative flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.98] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus motion-reduce:transition-none ${
                                selected ? "bg-accent-soft/60" : ""
                            }`}
                        >
                            <CrayonFrame />
                            <input
                                type="radio"
                                name="agenda-template"
                                value={option}
                                checked={selected}
                                onChange={() => onChange(option)}
                                className="sr-only"
                            />
                            <Icon className="relative size-8 shrink-0 text-ink" />
                            <span className="relative flex min-w-0 flex-1 flex-col">
                                <span className="font-hand text-2xl leading-7 text-ink">{label}</span>
                                <span className="text-sm text-ink-soft">{description}</span>
                            </span>
                            {selected && <CheckIcon className="relative size-6 shrink-0 text-ink" />}
                        </label>
                    );
                })}
            </div>
            <p className="flex items-start gap-1.5 text-sm text-ink-soft">
                <AlertIcon className="mt-0.5 size-4 shrink-0" />
                You can&apos;t change this later.
            </p>
        </fieldset>
    );
}