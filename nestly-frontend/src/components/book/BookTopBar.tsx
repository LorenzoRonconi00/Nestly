import Link from "next/link";
import type { ReactNode, Ref } from "react";
import { ICON_BUTTON_CLASS, IconButton } from "@/components/ui/IconButton";
import { ArrowLeftIcon, SidebarIcon } from "@/components/ui/icons";

type Props = {
    name: string;
    backHref: string;
    sidebarId: string;
    sidebarLabel: string;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    toggleRef: Ref<HTMLButtonElement>;
    children: ReactNode;
};

export function BookTopBar({
    name,
    backHref,
    sidebarId,
    sidebarLabel,
    sidebarOpen,
    onToggleSidebar,
    toggleRef,
    children,
}: Readonly<Props>) {
    return (
        <header className="flex h-16 items-center gap-1 px-2 md:px-4">
            <Link href={backHref} aria-label="Back to the agenda" className={ICON_BUTTON_CLASS}>
                <ArrowLeftIcon className="size-6" />
            </Link>
            <IconButton
                ref={toggleRef}
                aria-label={sidebarLabel}
                aria-expanded={sidebarOpen}
                aria-controls={sidebarId}
                onClick={onToggleSidebar}
            >
                <SidebarIcon className="size-6" />
            </IconButton>
            <h1 className="mx-2 min-w-0 flex-1 truncate font-hand text-2xl text-ink">{name}</h1>
            {children}
        </header>
    );
}