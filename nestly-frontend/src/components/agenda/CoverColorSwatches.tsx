"use client";

import { PlusIcon } from "@/components/ui/icons";
import { COVER_COLORS } from "@/lib/coverTheme";

type Props = { value: string; onChange: (color: string) => void };

const SWATCH =
    "size-8 rounded-full border-2 border-ink-soft transition-transform duration-150 ease-out-strong peer-checked:ring-2 peer-checked:ring-ink peer-checked:ring-offset-2 peer-checked:ring-offset-sheet peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-focus peer-active:scale-95 motion-reduce:transition-none";

export function CoverColorSwatches({ value, onChange }: Readonly<Props>) {
    const current = value.toLowerCase();
    const isCustom = !COVER_COLORS.some((entry) => entry.color === current);

    return (
        <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 font-hand text-xl leading-6 text-ink">Cover color</legend>
            <div className="-ml-1.5 flex flex-wrap items-center">
                {COVER_COLORS.map(({ name, color }) => (
                    <label key={color} className="grid size-11 cursor-pointer place-items-center md:size-10">
                        <input
                            type="radio"
                            name="cover-color"
                            value={color}
                            checked={current === color}
                            onChange={() => onChange(color)}
                            className="peer sr-only"
                        />
                        <span className={SWATCH} style={{ backgroundColor: color }} />
                        <span className="sr-only">{name}</span>
                    </label>
                ))}
                <label className="grid size-11 cursor-pointer place-items-center md:size-10">
                    <input
                        type="color"
                        value={current}
                        onChange={(event) => onChange(event.target.value)}
                        aria-label="Custom color"
                        className="peer sr-only"
                    />
                    <span
                        className={`${SWATCH} grid place-items-center text-ink-soft ${
                            isCustom ? "ring-2 ring-ink ring-offset-2 ring-offset-sheet" : "border-dashed"
                        }`}
                        style={isCustom ? { backgroundColor: current } : undefined}
                    >
                        {!isCustom && <PlusIcon className="size-4" />}
                    </span>
                </label>
            </div>
        </fieldset>
    );
}