import Link from "next/link";
import type { ComponentProps } from "react";
import { CrayonBlob } from "@/components/ui/CrayonBlob";
import { ArrowRightIcon } from "@/components/ui/icons";

export function CrayonLink({ children, className = "", ...rest }: Readonly<ComponentProps<typeof Link>>) {
    return (
        <Link
            className={`group relative isolate flex min-h-14 w-full items-center justify-center gap-2 px-6 font-hand text-2xl text-ink transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:transition-none ${className}`}
            {...rest}
        >
            <CrayonBlob tone="primary" hoverClass="group-hover:fill-accent-hover" />
            <span>{children}</span>
            <ArrowRightIcon className="size-6" />
        </Link>
    );
}