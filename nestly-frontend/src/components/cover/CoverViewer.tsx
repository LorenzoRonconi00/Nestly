"use client";

import dynamic from "next/dynamic";
import type { CoverTheme } from "@/lib/coverTheme";

const Cover3D = dynamic(() => import("./Cover3D").then((module) => module.Cover3D), {
    ssr: false,
    loading: () => null,
});

export function CoverViewer({
    theme,
    className = "h-80 w-full max-w-sm",
}: Readonly<{ theme: CoverTheme; className?: string }>) {
    return (
        <div className={className}>
            <Cover3D theme={theme} />
        </div>
    );
}