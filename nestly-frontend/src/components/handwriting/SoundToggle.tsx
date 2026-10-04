"use client";

import { useState } from "react";
import { isMuted, setMuted } from "@/lib/sound";

export function SoundToggle() {
    // Rendered only after client-side data loading, so reading localStorage here cannot cause a hydration mismatch
    const [muted, setMutedState] = useState(isMuted);

    function toggle() {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
    }

    return (
        <button
            onClick={toggle}
            aria-pressed={muted}
            className="cursor-pointer self-end rounded border px-2 py-1 text-xs"
        >
            {muted ? "Sound: off" : "Sound: on"}
        </button>
    );
}