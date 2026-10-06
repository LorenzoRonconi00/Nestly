import type { ReactNode } from "react";

type Side = "left" | "right" | "single";

const SIDE_CLASSES: Record<Side, string> = {
    left: "rounded-l-2xl",
    right: "rounded-r-2xl",
    single: "rounded-2xl",
};

const GUTTER_SHADOWS: Record<Side, string | null> = {
    left: "linear-gradient(to left, rgba(74, 59, 54, 0.12), transparent)",
    right: "linear-gradient(to right, rgba(74, 59, 54, 0.12), transparent)",
    single: null,
};

type Props = { title: string; side: Side; children: ReactNode };

export function PageFace({ title, side, children }: Readonly<Props>) {
    const shadow = GUTTER_SHADOWS[side];

    return (
        <article className={`sheet-lines relative flex min-h-[34rem] flex-col gap-8 bg-sheet p-8 ${SIDE_CLASSES[side]}`}>
            <h2 className="font-hand text-2xl leading-8">{title}</h2>
            {children}
            {shadow && (
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-0 w-10 ${side === "left" ? "right-0" : "left-0"}`}
                    style={{ backgroundImage: shadow }}
                />
            )}
        </article>
    );
}