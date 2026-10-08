import type { ButtonHTMLAttributes } from "react";
import { CrayonBlob } from "@/components/ui/CrayonBlob";
import { ArrowRightIcon, SpinnerIcon } from "@/components/ui/icons";

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
            <CrayonBlob tone={tone} hoverClass="group-enabled:group-hover:fill-accent-hover" />
            <span>{children}</span>
            {pending ? (
                <SpinnerIcon className="size-6 animate-spin motion-reduce:animate-none" />
            ) : (
                <ArrowRightIcon className="size-6" />
            )}
        </button>
    );
}