import type { ReactNode } from "react";

const RING_IDS = ["top", "middle", "bottom"];

export function Spread({ coverColor, children }: Readonly<{ coverColor: string; children: ReactNode }>) {
    return (
        <div className="rounded-[2rem] p-3 shadow-xl" style={{ backgroundColor: coverColor }}>
            <div className="relative grid grid-cols-1 md:grid-cols-2">
                {children}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 flex-col justify-around py-12 md:flex"
                >
                    {RING_IDS.map((id) => (
                        <span key={id} className="block h-4 w-10 rounded-full border-[3px] border-ink-soft bg-paper" />
                    ))}
                </div>
            </div>
        </div>
    );
}