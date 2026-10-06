"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

export function PageJumpMenu({ onJump }: Readonly<{ onJump: (page: string) => void }>) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const page = Math.floor(Number(value));
        if (page < 1) return;
        setOpen(false);
        setValue("");
        onJump(String(page));
    }

    return (
        <div ref={rootRef} className="relative">
            <Button variant="ghost" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(!open)}>
                Go to page
            </Button>
            {open && (
                <form
                    onSubmit={handleSubmit}
                    role="dialog"
                    aria-label="Go to page"
                    className="absolute bottom-full left-1/2 z-40 mb-2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-border bg-sheet p-3 shadow-lg"
                >
                    <TextInput
                        compact
                        type="number"
                        min={1}
                        aria-label="Page number"
                        placeholder="Page"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-20"
                        required
                    />
                    <Button type="submit" size="sm">
                        Go
                    </Button>
                </form>
            )}
        </div>
    );
}