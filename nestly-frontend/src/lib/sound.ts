const MUTE_KEY = "nestly_sound_muted";
const PENCIL_SOUND_SRC = "/sounds/pencil.mp3";

export const PENCIL_VOLUME = 0.5;

export function isMuted(): boolean {
    try {
        return localStorage.getItem(MUTE_KEY) === "true";
    } catch {
        return false;
    }
}

export function setMuted(muted: boolean) {
    try {
        localStorage.setItem(MUTE_KEY, String(muted));
    } catch {
        // the preference just won't persist
    }
}

export function startPencilSound(): HTMLAudioElement | null {
    if (isMuted()) return null;
    const audio = new Audio(PENCIL_SOUND_SRC);
    audio.loop = true;
    audio.volume = PENCIL_VOLUME;
    // the animation must work without sound
    audio.play().catch(() => undefined);
    return audio;
}