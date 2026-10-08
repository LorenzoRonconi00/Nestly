"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { NestIllustration } from "@/components/auth/NestIllustration";
import { BookSpread } from "@/components/ui/BookSpread";

const TABS = [
    { key: "login", href: "/login", label: "Log in", tint: "bg-crayon-pink" },
    { key: "register", href: "/register", label: "Create account", tint: "bg-crayon-blue" },
] as const;

export function AuthSpread({ children }: Readonly<{ children: ReactNode }>) {
    const active = usePathname().startsWith("/register") ? "register" : "login";

    return (
        <BookSpread
            left={
                <>
                    <NestIllustration className="w-full max-w-sm" />
                    <p className="font-hand text-6xl leading-none text-ink">Nestly</p>
                    <p className="max-w-xs text-center font-hand text-2xl leading-8 text-ink-soft">
                        A cozy agenda that feels like paper.
                    </p>
                </>
            }
            mobileIntro={
                <div className="flex items-center gap-3">
                    <NestIllustration className="w-20 shrink-0" />
                    <p className="font-hand text-4xl leading-none text-ink">Nestly</p>
                </div>
            }
            corner={
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
            }
        >
            {children}
        </BookSpread>
    );
}