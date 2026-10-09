const MOUTHS = [
    "M8.4 16c1.9-2.4 5.4-2.5 7.3-.1",
    "M8.8 15.6c1.4-1.2 4.6-1.2 6.4 0",
    "M8.8 14.8c2 .2 4.4.2 6.4 0",
    "M8.4 14c1.9 2.4 5.4 2.5 7.3.1",
    "M7.8 13.4c2.3 3.8 6.1 3.8 8.4 0-2.8.4-5.6.4-8.4 0Z",
];

export function MoodFace({ level }: Readonly<{ level: number }>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className="size-8"
        >
            <path d="M12 3.4c4.8-.1 8.5 3.6 8.6 8.4.1 4.8-3.7 8.7-8.5 8.7-4.9 0-8.6-3.7-8.6-8.5 0-4.8 3.7-8.6 8.5-8.6Z" />
            <path d="M9 9.6v.2" />
            <path d="M15 9.6v.2" />
            <path d={MOUTHS[level - 1]} />
        </svg>
    );
}