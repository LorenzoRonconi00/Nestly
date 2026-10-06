"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
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
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-danger bg-sheet p-4 shadow-lg"
        >
            <p className="text-sm font-semibold">{MESSAGES[problem]}</p>
            {problem === "stale" && (
                <Button size="sm" onClick={() => window.location.reload()}>
                    Reload
                </Button>
            )}
        </div>
    );
}