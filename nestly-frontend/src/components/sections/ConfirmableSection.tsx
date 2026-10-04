"use client";

import { useState, type ReactNode } from "react";
import { HandwrittenReveal } from "@/components/handwriting/HandwrittenReveal";

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
        <div className="rounded border p-3">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium">{title}</h2>
                <button onClick={handleToggle} className="cursor-pointer rounded border px-2 py-1 text-xs">
                    {confirmed ? "Edit" : "Confirm"}
                </button>
            </div>
            {confirmed ? <HandwrittenReveal animate={animate}>{children}</HandwrittenReveal> : children}
        </div>
    );
}