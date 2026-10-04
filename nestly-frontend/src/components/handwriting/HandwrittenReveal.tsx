"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PENCIL_VOLUME, startPencilSound } from "@/lib/sound";

const MAX_TOTAL_MS = 4000;
const MAX_STEP_MS = 120;
const FADE_MS = 300;
const PENCIL_TIP_X = 3;
const PENCIL_TIP_Y = 21;

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RevealText({ text }: Readonly<{ text: string }>) {
    return (
        <>
            {Array.from(text.matchAll(/\S+|\s+/g), (match) =>
                match[0].trim() === "" ? (
                    match[0]
                ) : (
                    <span key={match.index} data-reveal-word>
                        {match[0]}
                    </span>
                ),
            )}
        </>
    );
}

function PencilIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 21l1-5L16 4l4 4L8 20l-5 1z" className="fill-pencil stroke-ink-soft" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M3 21l1-5 4 4-5 1z" className="fill-wood stroke-ink-soft" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M16 4l2-2 4 4-2 2z" className="fill-accent stroke-ink-soft" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
    );
}

function movePencil(container: HTMLElement, pencil: HTMLElement | null, word: HTMLElement | undefined) {
    if (!pencil || !word) return;
    const containerRect = container.getBoundingClientRect();
    const wordRect = word.getBoundingClientRect();
    const x = wordRect.right - containerRect.left;
    const y = wordRect.bottom - containerRect.top;
    pencil.style.opacity = "1";
    pencil.style.transform = `translate(${x - PENCIL_TIP_X}px, ${y - PENCIL_TIP_Y}px)`;
}

type Props = { animate: boolean; children: ReactNode };

// the animation plays once per mount, never when text changes later
export function HandwrittenReveal({ animate, children }: Readonly<Props>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pencilRef = useRef<HTMLSpanElement>(null);
    const [revealing, setRevealing] = useState(() => animate && !prefersReducedMotion());

    useEffect(() => {
        const container = containerRef.current;
        if (!revealing || !container) return;

        const words = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal-word]"));
        words.forEach((word) => delete word.dataset.revealed);
        const audio = words.length > 0 ? startPencilSound() : null;
        const step = Math.min(MAX_STEP_MS, MAX_TOTAL_MS / Math.max(words.length, 1));
        const startedAt = performance.now();
        let revealed = 0;
        let frame = 0;
        let fadeTimer: ReturnType<typeof setInterval> | undefined;

        const fadeOut = () => {
            const fadeStart = performance.now();
            fadeTimer = setInterval(() => {
                const progress = Math.min(1, (performance.now() - fadeStart) / FADE_MS);
                if (audio) audio.volume = PENCIL_VOLUME * (1 - progress);
                if (progress === 1) {
                    clearInterval(fadeTimer);
                    setRevealing(false);
                }
            }, 30);
        };

        const tick = (now: number) => {
            const target = Math.min(words.length, Math.floor((now - startedAt) / step) + 1);
            while (revealed < target) {
                words[revealed].dataset.revealed = "true";
                revealed++;
            }
            movePencil(container, pencilRef.current, words[revealed - 1]);
            if (revealed < words.length) {
                frame = requestAnimationFrame(tick);
            } else {
                fadeOut();
            }
        };
        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
            clearInterval(fadeTimer);
            audio?.pause();
        };
    }, [revealing]);

    return (
        <div ref={containerRef} className={`relative ${revealing ? "reveal-active" : ""}`}>
            {children}
            {revealing && (
                <span
                    ref={pencilRef}
                    className="pointer-events-none absolute top-0 left-0 opacity-0 transition-transform duration-100 ease-linear"
                >
                    <PencilIcon />
                </span>
            )}
        </div>
    );
}