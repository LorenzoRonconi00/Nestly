"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CrayonFrame } from "@/components/ui/CrayonFrame";
import { LogOutIcon } from "@/components/ui/icons";
import { avatarColor } from "@/lib/coverTheme";

type Props = { email: string; onLogout: () => void };

export function AccountMenu({ email, onLogout }: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelId = useId();

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setOpen(false);
            triggerRef.current?.focus();
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-label="Account"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={() => setOpen((current) => !current)}
                style={{ backgroundColor: avatarColor(email) }}
                className="grid size-11 cursor-pointer place-items-center rounded-full border-2 border-ink-soft font-hand text-2xl leading-none text-ink transition-transform duration-150 ease-out-strong active:scale-95 motion-reduce:transition-none"
            >
                {email.charAt(0).toUpperCase()}
            </button>
            {open && (
                <div id={panelId} className="pop-in absolute top-full right-0 z-30 mt-3 w-72 origin-top-right p-5">
                    <CrayonFrame filled />
                    <div className="relative flex flex-col gap-3">
                        <p className="text-sm break-all text-ink-soft">{email}</p>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-2 text-left font-hand text-xl text-ink transition-colors duration-150 hover:bg-accent-soft motion-reduce:transition-none"
                        >
                            <LogOutIcon className="size-6 shrink-0" />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}