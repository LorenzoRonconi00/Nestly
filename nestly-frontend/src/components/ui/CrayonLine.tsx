const LINE_PATH = "M2 4.6C34 2.8 70 5.6 118 4.1S214 2.6 298 4.4";

type Props = { tone?: "neutral" | "error" };

export function CrayonLine({ tone = "neutral" }: Readonly<Props>) {
    return (
        <span aria-hidden="true" className="pointer-events-none relative block h-2 w-full">
            <svg className="absolute inset-0 size-full" viewBox="0 0 300 8" preserveAspectRatio="none" fill="none">
                <path
                    d={LINE_PATH}
                    className="stroke-ink-soft"
                    strokeWidth="3"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    filter="url(#crayon-soft)"
                />
            </svg>
            <svg
                className={`absolute inset-0 size-full transition-[clip-path] duration-200 ease-out-strong motion-reduce:transition-none ${tone === "error"
                        ? "[clip-path:inset(0_0_0_0)]"
                        : "[clip-path:inset(0_100%_0_0)] group-focus-within:[clip-path:inset(0_0_0_0)]"
                    }`}
                viewBox="0 0 300 8"
                preserveAspectRatio="none"
                fill="none"
            >
                <path
                    d={LINE_PATH}
                    className={tone === "error" ? "stroke-danger" : "stroke-focus"}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    filter="url(#crayon-soft)"
                />
            </svg>
        </span>
    );
}