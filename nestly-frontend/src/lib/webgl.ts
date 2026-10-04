let cached: boolean | null = null;

function detect(): boolean {
    try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("webgl2");
        context?.getExtension("WEBGL_lose_context")?.loseContext();
        return context !== null;
    } catch {
        return false;
    }
}

// Cached because React calls the snapshot getter repeatedly and each detection creates a GL context
export function supportsWebGL(): boolean {
    cached ??= detect();
    return cached;
}