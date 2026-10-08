import Link from "next/link";
import { CrayonFrame } from "@/components/ui/CrayonFrame";
import { PlusIcon } from "@/components/ui/icons";

export function NewAgendaTile() {
    return (
        <Link href="/agendas/new" className="group flex flex-col rounded-2xl focus-visible:outline-offset-4">
            <span className="relative block aspect-[5/7] transition-transform duration-150 ease-out-strong group-hover:-translate-y-1 group-active:scale-[0.97] motion-reduce:transition-none">
                <CrayonFrame dashed />
                <span className="absolute inset-0 grid place-items-center text-ink-soft transition-colors duration-150 group-hover:text-ink motion-reduce:transition-none">
                    <PlusIcon className="size-12" />
                </span>
            </span>
            <span className="mt-4 flex min-h-7 items-center font-hand text-xl text-ink">New agenda</span>
        </Link>
    );
}