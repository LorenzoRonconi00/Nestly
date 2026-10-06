"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import type { CoverAnimationReady, CoverTimeline } from "@/components/cover/Cover3D";
import type { CoverTheme } from "@/lib/coverTheme";

const OPEN_SECONDS = 2.4;

type Props = { theme: CoverTheme; onAnimationReady?: CoverAnimationReady };

export function Cover2D({ theme, onAnimationReady }: Readonly<Props>) {
    const bookRef = useRef<HTMLDivElement>(null);
    const notifyReady = useEffectEvent((timeline: CoverTimeline | null) => onAnimationReady?.(timeline));

    useEffect(() => {
        const book = bookRef.current;
        if (!book) return;

        let cancelled = false;
        let timeline: CoverTimeline | null = null;
        void import("gsap").then(({ gsap }) => {
            if (cancelled) return;
            timeline = gsap.timeline({ paused: true });
            timeline.to(book, { scale: 1.2, duration: OPEN_SECONDS, ease: "power2.inOut" }, 0);
            notifyReady(timeline);
        });

        return () => {
            cancelled = true;
            timeline?.kill();
            notifyReady(null);
        };
    }, []);

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div ref={bookRef} className="relative aspect-[5/7] h-4/5">
                <div className="absolute inset-y-[2%] -right-1.5 w-3 rounded-r-sm bg-[#fbf3df]" />
                <div
                    className="absolute inset-0 overflow-hidden rounded-l-sm rounded-r-md shadow-lg"
                    style={{ backgroundColor: theme.color }}
                >
                    <div className="absolute inset-y-0 left-0 w-[8%] bg-black/10" />
                    <div
                        className="absolute inset-0"
                        style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.25), transparent 60%)" }}
                    />
                </div>
            </div>
        </div>
    );
}