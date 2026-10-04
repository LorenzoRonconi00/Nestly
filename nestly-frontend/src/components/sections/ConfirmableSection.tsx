"use client";

import { useState, type ReactNode } from "react";
import { HandwrittenReveal } from "@/components/handwriting/HandwrittenReveal";
import { Button } from "@/components/ui/Button";

type Props = {
    title: string;
    confirmed: boolean;
    onConfirm: () => void;
    onEdit: () => void;
    children: ReactNode;
};

export function ConfirmableSection({ title, confirmed, onConfirm, onEdit, children }: Readonly<Props>) {
    const [animate, setAnimate] = useState(false);

    function handleToggle() {
        if (confirmed) {
            setAnimate(false);
            onEdit();
        } else {
            setAnimate(true);
            onConfirm();
        }
    }

    return (
        <section>
            <div className="flex h-8 items-center justify-between">
                <h2 className="text-xs font-bold tracking-wider text-ink-soft uppercase">{title}</h2>
                <Button variant="secondary" size="sm" onClick={handleToggle}>
                    {confirmed ? "Edit" : "Confirm"}
                </Button>
            </div>
            {confirmed ? <HandwrittenReveal animate={animate}>{children}</HandwrittenReveal> : children}
        </section>
    );
}