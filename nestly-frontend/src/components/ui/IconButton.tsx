import type { ComponentProps } from "react";

const BASE =
    "grid size-11 shrink-0 cursor-pointer place-items-center rounded-full transition-[transform,background-color,color] duration-150 ease-out-strong hover:bg-accent-soft active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent motion-reduce:transition-none";

export const ICON_BUTTON_CLASS = `${BASE} text-ink-soft hover:text-ink disabled:hover:text-ink-soft`;

type Props = ComponentProps<"button"> & { tone?: "default" | "danger" };

export function IconButton({ tone = "default", className = "", type = "button", ...rest }: Readonly<Props>) {
    const colors = tone === "danger" ? `${BASE} text-danger` : ICON_BUTTON_CLASS;
    return <button type={type} className={`${colors} ${className}`} {...rest} />;
}