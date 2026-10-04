import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "dangerGhost";
type Size = "md" | "sm";

const VARIANTS: Record<Variant, string> = {
    primary: "border-transparent bg-accent text-ink hover:bg-accent-hover",
    secondary: "border-border-strong bg-sheet text-ink hover:bg-accent-soft",
    danger: "border-transparent bg-danger text-white hover:opacity-90",
    ghost: "border-transparent bg-transparent text-ink-soft hover:bg-accent-soft",
    dangerGhost: "border-transparent bg-transparent text-danger hover:bg-accent-soft",
};

const SIZES: Record<Size, string> = {
    md: "px-4 py-2 text-sm",
    sm: "px-3 py-0.5 text-xs",
};

export function buttonClassName(variant: Variant = "primary", size: Size = "md") {
    return `inline-block cursor-pointer rounded-full border text-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({
    variant = "primary",
    size = "md",
    className = "",
    type = "button",
    ...rest
}: Readonly<Props>) {
    return <button type={type} className={`${buttonClassName(variant, size)} ${className}`} {...rest} />;
}