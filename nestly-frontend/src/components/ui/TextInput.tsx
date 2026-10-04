import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { compact?: boolean };

export function TextInput({ compact = false, className = "", ...rest }: Readonly<Props>) {
    const size = compact ? "h-7 px-2 py-0 text-sm" : "px-3 py-2";
    return (
        <input
            className={`rounded-xl border border-border-strong bg-sheet text-ink placeholder:text-ink-soft ${size} ${className}`}
            {...rest}
        />
    );
}