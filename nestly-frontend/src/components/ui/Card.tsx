import type { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: Readonly<HTMLAttributes<HTMLDivElement>>) {
    return <div className={`rounded-2xl border border-border bg-sheet p-5 shadow-sm ${className}`} {...rest} />;
}