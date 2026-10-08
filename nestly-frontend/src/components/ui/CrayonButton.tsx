import type { ButtonHTMLAttributes } from "react";
import { ArrowRightIcon, SpinnerIcon } from "@/components/ui/icons";

const BLOB_PATH = "M6 9C40 3 120 6 190 4s84 2 103 5c4 12 3 26 1 38-30 6-110 4-176 6S34 52 8 48C3 36 4 20 6 9Z";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean; tone?: "primary" | "danger" };

export function CrayonButton({
    pending = false,
    tone = "primary",
    type = "submit",
    disabled,
    children,
    className = "",
    ...rest
}: Readonly<Props>) {
    const danger = tone === "danger";

    return (
        <button
            type={type}
            disabled={disabled || pending}
            className={`group relative isolate flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 px-6 font-hand text-2xl transition-transform duration-150 ease-out-strong active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${danger ? "text-white" : "text-ink"} ${className}`}
            {...rest}
        >
            <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full" viewBox="0 0 300 56" preserveAspectRatio="none" fill="none">
                <path
                    d={BLOB_PATH}
                    className={`transition-colors duration-150 motion-reduce:transition-none ${
                        danger ? "fill-danger" : "fill-accent group-enabled:group-hover:fill-accent-hover"
                    }`}
                    filter={danger ? "url(#crayon-soft)" : "url(#crayon)"}
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