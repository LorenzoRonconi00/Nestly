"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { BellIcon, BellOffIcon } from "@/components/ui/icons";
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
        <IconButton aria-label="Writing sound" aria-pressed={!muted} onClick={toggle}>
            {muted ? <BellOffIcon className="size-6" /> : <BellIcon className="size-6" />}
        </IconButton>
    );
}