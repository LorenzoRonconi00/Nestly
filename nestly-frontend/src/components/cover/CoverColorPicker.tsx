"use client";

import { COVER_COLOR_PRESETS } from "@/lib/coverTheme";

type Props = { value: string; onChange: (color: string) => void };

export function CoverColorPicker({ value, onChange }: Readonly<Props>) {
    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-bold">Cover color</legend>
            <div className="flex flex-wrap items-center gap-2">
                {COVER_COLOR_PRESETS.map((color) => (
                    <button
                        key={color}
                        type="button"
                        aria-label={`Cover color ${color}`}
                        aria-pressed={value === color}
                        onClick={() => onChange(color)}
                        style={{ backgroundColor: color }}
                        className={`h-8 w-8 cursor-pointer rounded-full border border-border-strong ${value === color ? "ring-2 ring-ink ring-offset-2 ring-offset-sheet" : ""
                            }`}
                    />
                ))}
                <input
                    type="color"
                    aria-label="Custom cover color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-full"
                />
            </div>
        </fieldset>
    );
}