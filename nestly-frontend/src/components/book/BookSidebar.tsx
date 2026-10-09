"use client";

import { useEffect, type ReactNode } from "react";

type Props = { id: string; label: string; open: boolean; docked: boolean; onClose: () => void; children: ReactNode };

export function BookSidebar({ id, label, open, docked, onClose, children }: Readonly<Props>) {
    useEffect(() => {
        if (!open || docked) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, docked, onClose]);

    return (
        <>
            {open && !docked && <div aria-hidden="true" className="fixed inset-0 z-30 bg-ink/20" onPointerDown={onClose} />}
            <aside
                id={id}
                aria-label={label}
                inert={!open}
                className={`fixed inset-y-0 left-0 z-40 w-72 overflow-hidden bg-sheet shadow-[8px_0_32px_-12px_rgba(74,59,54,0.3)] transition-[transform,width] duration-250 ease-out-strong motion-reduce:transition-none xl:sticky xl:top-0 xl:z-auto xl:h-dvh xl:shrink-0 xl:self-start xl:shadow-none ${
                    open ? "translate-x-0 xl:w-72" : "-translate-x-full xl:w-0 xl:translate-x-0"
                }`}
            >
                <div className="flex h-full w-72 flex-col border-r border-border">{children}</div>
            </aside>
        </>
    );
}