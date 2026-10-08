import type { CSSProperties, ReactNode } from "react";

type Props = { index: number; children: ReactNode };

export function RiseIn({ index, children }: Readonly<Props>) {
    return (
        <div className="rise" style={{ "--i": index } as CSSProperties}>
            {children}
        </div>
    );
}