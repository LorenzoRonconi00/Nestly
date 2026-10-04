import Link from "next/link";
import type { ComponentProps } from "react";

export function TextLink({ className = "", ...rest }: Readonly<ComponentProps<typeof Link>>) {
    return (
        <Link
            className={`text-ink underline decoration-accent-hover decoration-2 underline-offset-4 hover:text-ink-soft ${className}`}
            {...rest}
        />
    );
}