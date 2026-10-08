const BLOB_PATH = "M6 9C40 3 120 6 190 4s84 2 103 5c4 12 3 26 1 38-30 6-110 4-176 6S34 52 8 48C3 36 4 20 6 9Z";

type Props = { tone: "primary" | "danger"; hoverClass?: string };

export function CrayonBlob({ tone, hoverClass = "" }: Readonly<Props>) {
    const danger = tone === "danger";

    return (
        <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full" viewBox="0 0 300 56" preserveAspectRatio="none" fill="none">
            <path
                d={BLOB_PATH}
                className={`transition-colors duration-150 motion-reduce:transition-none ${danger ? "fill-danger" : `fill-accent ${hoverClass}`}`}
                filter={danger ? "url(#crayon-soft)" : "url(#crayon)"}
            />
            <path d={BLOB_PATH} className="stroke-ink-soft" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}