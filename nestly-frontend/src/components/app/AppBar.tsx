import Link from "next/link";
import { AccountMenu } from "@/components/app/AccountMenu";
import { NestIllustration } from "@/components/auth/NestIllustration";

type Props = { email: string; onLogout: () => void };

export function AppBar({ email, onLogout }: Readonly<Props>) {
    return (
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 md:px-10">
            <Link href="/" className="flex items-center gap-2 rounded-xl py-1 pr-2">
                <NestIllustration className="h-10 w-12 shrink-0" />
                <span className="font-hand text-4xl leading-none text-ink">Nestly</span>
            </Link>
            <AccountMenu email={email} onLogout={onLogout} />
        </header>
    );
}