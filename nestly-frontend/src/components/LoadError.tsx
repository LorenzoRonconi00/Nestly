"use client";

import { Button } from "@/components/ui/Button";

export function LoadError({ onRetry }: Readonly<{ onRetry: () => void }>) {
    return (
        <div role="alert" className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="font-semibold">Something went wrong while loading. Check your connection and try again.</p>
            <Button onClick={onRetry}>Try again</Button>
        </div>
    );
}