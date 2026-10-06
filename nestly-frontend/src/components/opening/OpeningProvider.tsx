"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { CoverTimeline } from "@/components/cover/Cover3D";

type StartOptions = {
    coverTimeline: CoverTimeline;
    href: string;
    origin: { x: number; y: number };
};

type OpeningContextValue = {
    startOpening: (options: StartOptions) => Promise<void>;
    markPageReady: () => void;
};

const OpeningContext = createContext<OpeningContextValue | null>(null);

const GLOW_IN_AT = 2;
const GLOW_IN_SECONDS = 1;
const NAVIGATE_AT = 3;
const GLOW_OUT_SECONDS = 0.5;
const READY_TIMEOUT_MS = 2000;
const SKIP_SPEED = 6;
const GLOW_GRADIENT =
    "#fffaf0 0%, #fff0c8 30%, #ffe2a8 50%, rgba(255, 226, 168, 0) 72%";

export function OpeningProvider({ children }: Readonly<{ children: ReactNode }>) {
    const router = useRouter();
    const pathname = usePathname();
    const glowRef = useRef<HTMLDivElement>(null);
    const masterRef = useRef<CoverTimeline | null>(null);
    const busyRef = useRef(false);
    const navigatedRef = useRef(false);
    const startPathRef = useRef<string | null>(null);
    const cancelRef = useRef<(() => void) | null>(null);
    const pageReadyRef = useRef<(() => void) | null>(null);

    const markPageReady = useCallback(() => {
        pageReadyRef.current?.();
    }, []);

    const startOpening = useCallback(
        async ({ coverTimeline, href, origin }: StartOptions) => {
            const glow = glowRef.current;
            if (!glow || busyRef.current) return;
            busyRef.current = true;

            const gsapModule = await import("gsap").catch(() => null);
            if (!gsapModule) {
                busyRef.current = false;
                router.push(href);
                return;
            }
            const { gsap } = gsapModule;

            navigatedRef.current = false;
            startPathRef.current = window.location.pathname;
            glow.style.backgroundImage = `radial-gradient(circle at ${origin.x}px ${origin.y}px, ${GLOW_GRADIENT})`;
            glow.style.transformOrigin = `${origin.x}px ${origin.y}px`;
            glow.style.pointerEvents = "auto";
            gsap.set(glow, { opacity: 0, scale: 0.15 });

            const skip = () => {
                masterRef.current?.timeScale(SKIP_SPEED);
            };
            const onKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape") skip();
            };
            glow.addEventListener("click", skip);
            window.addEventListener("keydown", onKeyDown);

            const finish = () => {
                glow.removeEventListener("click", skip);
                window.removeEventListener("keydown", onKeyDown);
                glow.style.pointerEvents = "none";
                gsap.set(glow, { opacity: 0 });
                masterRef.current = null;
                cancelRef.current = null;
                startPathRef.current = null;
                pageReadyRef.current = null;
                busyRef.current = false;
            };

            const master = gsap.timeline({ paused: true, onComplete: finish });
            masterRef.current = master;
            cancelRef.current = () => {
                master.kill();
                finish();
            };

            const navigateWhenReady = async () => {
                const ready = new Promise<void>((resolve) => {
                    pageReadyRef.current = resolve;
                });
                const timeout = new Promise<void>((resolve) => setTimeout(resolve, READY_TIMEOUT_MS));
                navigatedRef.current = true;
                router.push(href);
                await Promise.race([ready, timeout]);
                pageReadyRef.current = null;
                master.resume();
            };

            coverTimeline.paused(false);
            master.add(coverTimeline, 0);
            master.fromTo(
                glow,
                { opacity: 0, scale: 0.15 },
                { opacity: 1, scale: 3, duration: GLOW_IN_SECONDS, ease: "power2.in" },
                GLOW_IN_AT,
            );
            master.addPause(NAVIGATE_AT, () => {
                void navigateWhenReady();
            });
            master.to(glow, { opacity: 0, duration: GLOW_OUT_SECONDS, ease: "power1.out" }, NAVIGATE_AT);
            master.play();
        },
        [router],
    );

    // Leaving the page before the animation decides to navigate (browser Back) must abort it,
    // otherwise the timeline would still push the destination route when it reaches the pause
    useEffect(() => {
        const aborted =
            startPathRef.current !== null && !navigatedRef.current && pathname !== startPathRef.current;
        if (aborted) cancelRef.current?.();
    }, [pathname]);

    useEffect(() => {
        return () => {
            masterRef.current?.kill();
        };
    }, []);

    const value = useMemo(() => ({ startOpening, markPageReady }), [startOpening, markPageReady]);

    return (
        <OpeningContext.Provider value={value}>
            {children}
            <div
                ref={glowRef}
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-50 opacity-0"
            />
        </OpeningContext.Provider>
    );
}

export function useOpening() {
    const context = useContext(OpeningContext);
    if (!context) throw new Error("useOpening must be used inside OpeningProvider");
    return context;
}

export function usePageReady(ready: boolean) {
    const context = useContext(OpeningContext);
    useEffect(() => {
        if (ready) context?.markPageReady();
    }, [ready, context]);
}