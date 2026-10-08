const FRAME_PATH = "M4 3C30 1.5 70 3.5 96 2.5c2.5 18 1.5 68 2 93.5C70 98.5 30 97 3 98 1.5 70 3 30 2 5Z";

type Props = { dashed?: boolean; filled?: boolean };

export function CrayonFrame({ dashed = false, filled = false }: Readonly<Props>) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            className="pointer-events-none absolute inset-0 size-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
        >
            {filled && <path d={FRAME_PATH} className="fill-sheet" />}
            <path
                d={FRAME_PATH}
                className="stroke-ink-soft"
                strokeWidth="2.4"
                strokeLinejoin="round"
                strokeDasharray={dashed ? "8 8" : undefined}
                vectorEffect="non-scaling-stroke"
                filter="url(#crayon-soft)"
            />
        </svg>
    );
}