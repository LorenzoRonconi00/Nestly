import type { ReactNode, Ref } from "react";

export type Side = "left" | "right" | "single";

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

type Props = { title: string; side: Side; shadeRef?: Ref<HTMLDivElement>; children: ReactNode };

export function PageFace({ title, side, shadeRef, children }: Readonly<Props>) {
    const shadow = GUTTER_SHADOWS[side];

    return (
        <article
            className={`sheet-lines relative flex h-full min-h-[max(34rem,calc(100dvh-9.5rem))] flex-col gap-8 bg-sheet py-8 pr-6 pl-14 md:pr-8 ${SIDE_CLASSES[side]}`}
        >
            <span aria-hidden="true" className="absolute inset-y-0 left-9 w-0.5 bg-crayon-red/80" />
            <h2 className="font-hand text-2xl leading-8 text-ink">{title}</h2>
            {children}
            {shadow && (
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-0 w-10 ${side === "left" ? "right-0" : "left-0"}`}
                    style={{ backgroundImage: shadow }}
                />
            )}
            {shadeRef && (
                <div
                    ref={shadeRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[inherit] bg-ink opacity-0"
                />
            )}
        </article>
    );
}