import type { ComponentProps } from "react";

export const ICON_BUTTON_CLASS =
    "grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink-soft transition-[transform,background-color,color] duration-150 ease-out-strong hover:bg-accent-soft hover:text-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-soft motion-reduce:transition-none";

export function IconButton({ className = "", type = "button", ...rest }: Readonly<ComponentProps<"button">>) {
    return <button type={type} className={`${ICON_BUTTON_CLASS} ${className}`} {...rest} />;
}