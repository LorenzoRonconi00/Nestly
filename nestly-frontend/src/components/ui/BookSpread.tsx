import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/ui/icons";

const SHEET_SHADOW = "md:shadow-[0_24px_48px_-16px_rgba(74,59,54,0.28)]";

type Props = {
    left: ReactNode;
    mobileIntro?: ReactNode;
    corner?: ReactNode;
    backHref?: string;
    backLabel?: string;
    children: ReactNode;
};

export function BookSpread({
    left,
    mobileIntro,
    corner,
    backHref = "/",
    backLabel = "Back to home",
    children,
}: Readonly<Props>) {
    return (
        <main className="paper-grain flex min-h-dvh justify-center bg-paper md:items-center md:px-8 md:py-10">
            <div className="relative grid w-full max-w-5xl md:grid-cols-2">
                <section
                    className={`sheet-left relative hidden flex-col items-center justify-center gap-4 rounded-l-4xl bg-sheet px-12 py-16 md:flex ${SHEET_SHADOW}`}
                >
                    {left}
                </section>

                <div
                    aria-hidden="true"
                    className="binding-fade pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-7 -translate-x-1/2 md:block"
                >
                    <span className="absolute inset-0 bg-crayon-pink [filter:url(#crayon)]" />
                    <span className="absolute inset-0 flex flex-col justify-around py-20">
                        {["top", "middle", "bottom"].map((ring) => (
                            <span key={ring} className="block h-4 w-9 -translate-x-1 rounded-full border-[3px] border-ink-soft bg-paper" />
                        ))}
                    </span>
                </div>

                <section
                    className={`sheet-right sheet-lines relative flex min-h-dvh flex-col bg-sheet md:min-h-[40rem] md:rounded-r-4xl ${SHEET_SHADOW}`}
                >
                    <span aria-hidden="true" className="absolute inset-y-0 left-9 w-0.5 bg-crayon-red [filter:url(#crayon)] md:left-14" />

                    <div className="flex flex-1 flex-col gap-6 py-6 pr-5 pl-14 md:py-10 md:pr-12 md:pl-24">
                        <header className="relative h-12">
                            <Link
                                href={backHref}
                                aria-label={backLabel}
                                className="absolute top-0 -left-2 grid size-11 place-items-center rounded-full text-ink-soft transition-[transform,background-color] duration-150 ease-out hover:bg-accent-soft active:scale-95 motion-reduce:transition-none"
                            >
                                <ArrowLeftIcon className="size-6" />
                            </Link>
                            {corner}
                        </header>

                        <div className="flex flex-col gap-6 md:my-auto">
                            {mobileIntro && <div className="md:hidden">{mobileIntro}</div>}
                            {children}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}