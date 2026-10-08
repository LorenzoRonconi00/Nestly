import type { ButtonHTMLAttributes } from "react";
import { ArrowRightIcon, SpinnerIcon } from "@/components/ui/icons";

const BLOB_PATH = "M6 9C40 3 120 6 190 4s84 2 103 5c4 12 3 26 1 38-30 6-110 4-176 6S34 52 8 48C3 36 4 20 6 9Z";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & { pending?: boolean };

export function CrayonButton({ pending = false, disabled, children, className = "", ...rest }: Readonly<Props>) {
    return (
        <button
            type="submit"
            disabled={disabled || pending}
            className={`group relative isolate flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 px-6 font-hand text-2xl text-ink transition-transform duration-150 ease-out-strong active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${className}`}
            {...rest}
        >
            <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full" viewBox="0 0 300 56" preserveAspectRatio="none" fill="none">
                <path
                    d={BLOB_PATH}
                    className="fill-accent transition-colors duration-150 group-enabled:group-hover:fill-accent-hover motion-reduce:transition-none"
                    filter="url(#crayon)"
                />
                <path d={BLOB_PATH} className="stroke-ink-soft" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <span>{children}</span>
            {pending ? (
                <SpinnerIcon className="size-6 animate-spin motion-reduce:animate-none" />
            ) : (
                <ArrowRightIcon className="size-6" />
            )}
        </button>
    );
}