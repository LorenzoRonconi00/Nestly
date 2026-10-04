"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore, type ReactNode } from "react";
import { Cover2D } from "@/components/cover/Cover2D";
import { CoverErrorBoundary } from "@/components/cover/CoverErrorBoundary";
import type { CoverTheme } from "@/lib/coverTheme";
import { supportsWebGL } from "@/lib/webgl";

const Cover3D = dynamic(() => import("./Cover3D").then((module) => module.Cover3D), {
    ssr: false,
    loading: () => null,
});

function subscribe() {
    return () => undefined;
}

function getServerSnapshot() {
    return null;
}

export function CoverViewer({
    theme,
    className = "h-80 w-full max-w-sm",
}: Readonly<{ theme: CoverTheme; className?: string }>) {
    const webglSupported = useSyncExternalStore<boolean | null>(subscribe, supportsWebGL, getServerSnapshot);

    let content: ReactNode = null;
    if (webglSupported === true) {
        content = (
            <CoverErrorBoundary fallback={<Cover2D theme={theme} />}>
                <Cover3D theme={theme} />
            </CoverErrorBoundary>
        );
    } else if (webglSupported === false) {
        content = <Cover2D theme={theme} />;
    }

    return <div className={className}>{content}</div>;
}