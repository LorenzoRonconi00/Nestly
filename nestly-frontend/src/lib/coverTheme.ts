export type CoverTheme = { kind: "solid"; color: string };

export const DEFAULT_COVER_THEME: CoverTheme = { kind: "solid", color: "#f4b6c2" };

export function parseCoverTheme(value: string | null | undefined): CoverTheme {
    const match = /^solid:(#[0-9a-fA-F]{6})$/.exec(value ?? "");
    return match ? { kind: "solid", color: match[1] } : DEFAULT_COVER_THEME;
}

export function serializeCoverTheme(theme: CoverTheme): string {
    return `solid:${theme.color}`;
}

export const COVER_COLORS = [
    { name: "Pink", color: "#f4b6c2" },
    { name: "Peach", color: "#f9d5a7" },
    { name: "Yellow", color: "#fdf0a6" },
    { name: "Green", color: "#c7e8c0" },
    { name: "Blue", color: "#a8d8ea" },
    { name: "Lilac", color: "#c9c1f0" },
    { name: "Mauve", color: "#e8c7e6" },
    { name: "Sand", color: "#e0d6cc" },
];

export const COVER_COLOR_PRESETS = COVER_COLORS.map((entry) => entry.color);

export function avatarColor(seed: string): string {
    let hash = 0;
    for (const char of seed) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
    return COVER_COLOR_PRESETS[hash % COVER_COLOR_PRESETS.length];
}