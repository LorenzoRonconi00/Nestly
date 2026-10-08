"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { NestIllustration } from "@/components/auth/NestIllustration";
import { ArrowLeftIcon } from "@/components/ui/icons";

const TABS = [
    { key: "login", href: "/login", label: "Log in", tint: "bg-crayon-pink" },
    { key: "register", href: "/register", label: "Create account", tint: "bg-crayon-blue" },
] as const;

const SHEET_SHADOW = "md:shadow-[0_24px_48px_-16px_rgba(74,59,54,0.28)]";

export function AuthSpread({ children }: Readonly<{ children: ReactNode }>) {
    const active = usePathname().startsWith("/register") ? "register" : "login";

    return (
        <main className="paper-grain flex min-h-dvh justify-center bg-paper md:items-center md:px-8 md:py-10">
            <div className="relative grid w-full max-w-5xl md:grid-cols-2">
                <section
                    className={`sheet-left relative hidden flex-col items-center justify-center gap-4 rounded-l-4xl bg-sheet px-12 py-16 md:flex ${SHEET_SHADOW}`}
                >
                    <NestIllustration className="w-full max-w-sm" />
                    <p className="font-hand text-6xl leading-none text-ink">Nestly</p>
                    <p className="max-w-xs text-center font-hand text-2xl leading-8 text-ink-soft">
                        A cozy agenda that feels like paper.
                    </p>
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
                                href="/"
                                aria-label="Back to home"
                                className="absolute top-0 -left-2 grid size-11 place-items-center rounded-full text-ink-soft transition-[transform,background-color] duration-150 ease-out hover:bg-accent-soft active:scale-95 motion-reduce:transition-none"
                            >
                                <ArrowLeftIcon className="size-6" />
                            </Link>
                            <nav aria-label="Account" className="absolute -top-6 right-0 md:-top-10">
                                <ul className="flex gap-2">
                                    {TABS.map((tab, index) => (
                                        <li key={tab.key} className="ribbon-drop" style={{ "--i": index } as CSSProperties}>
                                            <Link
                                                href={tab.href}
                                                aria-current={active === tab.key ? "page" : undefined}
                                                className={`block px-3.5 pt-4 font-hand text-xl leading-6 text-ink transition-transform duration-150 ease-out hover:translate-y-1 motion-reduce:transition-none [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-10px),0_100%)] ${tab.tint} ${active === tab.key ? "pb-9" : "pb-6"
                                                    }`}
                                            >
                                                {tab.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </header>

                        <div className="flex flex-col gap-6 md:my-auto">
                            <div className="flex items-center gap-3 md:hidden">
                                <NestIllustration className="w-20 shrink-0" />
                                <p className="font-hand text-4xl leading-none text-ink">Nestly</p>
                            </div>

                            {children}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}