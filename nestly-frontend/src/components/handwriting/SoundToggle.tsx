"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
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
        <Button variant="ghost" size="sm" onClick={toggle} aria-pressed={muted} className="self-end">
            {muted ? "Sound: off" : "Sound: on"}
        </Button>
    );
}