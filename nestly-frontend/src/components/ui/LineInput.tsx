import type { ComponentProps } from "react";

export function LineInput({ className = "", ...rest }: Readonly<ComponentProps<"input">>) {
    return (
        <input
            className={`h-8 min-w-0 rounded-t-md border-b border-border-strong/60 bg-transparent px-1 font-hand text-xl leading-8 text-hand outline-none transition-[background-color,box-shadow] duration-150 ease-out placeholder:text-ink-soft focus:bg-accent-soft/60 focus:shadow-[0_2px_0_0_var(--color-focus)] motion-reduce:transition-none ${className}`}
            {...rest}
        />
    );
}