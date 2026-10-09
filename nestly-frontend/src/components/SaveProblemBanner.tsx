"use client";

import { useEffect } from "react";
import { CrayonFrame } from "@/components/ui/CrayonFrame";
import { AlertIcon } from "@/components/ui/icons";
import { TEXT_BUTTON_CLASS } from "@/components/ui/textButton";
import type { SaveProblem } from "@/lib/useSectionSaver";

const MESSAGES: Record<SaveProblem, string> = {
    stale: "This page was changed elsewhere (another tab or a structure edit). Reload to continue. Your latest change here was not saved.",
    failed: "Your last change could not be saved. It will be saved together with your next edit.",
};

export function SaveProblemBanner({ problem }: Readonly<{ problem: SaveProblem | null }>) {
    useEffect(() => {
        if (problem !== "failed") return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [problem]);

    if (!problem) return null;

    return (
        <div
            role="alert"
            className="rise-quick fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md flex-col gap-2 p-5"
        >
            <CrayonFrame filled />
            <p className="relative flex items-start gap-2 font-semibold text-ink">
                <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger" />
                {MESSAGES[problem]}
            </p>
            {problem === "stale" && (
                <button type="button" onClick={() => window.location.reload()} className={`relative self-start ${TEXT_BUTTON_CLASS}`}>
                    Reload
                </button>
            )}
        </div>
    );
}