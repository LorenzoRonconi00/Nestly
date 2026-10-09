"use client";

import { useState, type ReactNode } from "react";
import { HandwrittenReveal } from "@/components/handwriting/HandwrittenReveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { sectionInfo } from "@/components/structure/sectionTypes";
import { CheckIcon, PencilIcon } from "@/components/ui/icons";

type Props = {
    type: string;
    confirmed: boolean;
    onConfirm: () => void;
    onEdit: () => void;
    children: ReactNode;
};

export function ConfirmableSection({ type, confirmed, onConfirm, onEdit, children }: Readonly<Props>) {
    const [animate, setAnimate] = useState(false);
    const label = sectionInfo(type).label.toLowerCase();

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
                <SectionHeading type={type} />
                <button
                    type="button"
                    onClick={handleToggle}
                    aria-label={`${confirmed ? "Edit" : "Confirm"} ${label}`}
                    className="-my-1.5 -mr-2 flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 font-hand text-lg text-ink-soft transition-[transform,background-color,color] duration-150 ease-out-strong hover:bg-accent-soft hover:text-ink active:scale-95 motion-reduce:transition-none"
                >
                    {confirmed ? <PencilIcon className="size-5" /> : <CheckIcon className="size-5" />}
                    {confirmed ? "Edit" : "Confirm"}
                </button>
            </div>
            {confirmed ? <HandwrittenReveal animate={animate}>{children}</HandwrittenReveal> : children}
        </section>
    );
}