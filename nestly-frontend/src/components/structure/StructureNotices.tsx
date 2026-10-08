import Link from "next/link";
import { CrayonButton } from "@/components/ui/CrayonButton";
import { CrayonFrame } from "@/components/ui/CrayonFrame";
import { AlertIcon } from "@/components/ui/icons";
import { TEXT_BUTTON_CLASS } from "@/components/ui/textButton";

type DataLossProps = {
    losses: { label: string; pageCount: number }[];
    pending: boolean;
    onKeep: () => void;
    onConfirm: () => void;
};

export function DataLossNotice({ losses, pending, onKeep, onConfirm }: Readonly<DataLossProps>) {
    return (
        <div role="alert" className="relative flex flex-col gap-3 p-5">
            <CrayonFrame filled />
            <p className="relative flex items-start gap-2 font-semibold text-ink">
                <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger" />
                These sections hold your writing, and it will be deleted from every page.
            </p>
            <ul className="relative text-sm text-ink-soft">
                {losses.map((loss) => (
                    <li key={loss.label}>
                        {loss.label}: {loss.pageCount} {loss.pageCount === 1 ? "page" : "pages"}
                    </li>
                ))}
            </ul>
            <div className="relative flex flex-col items-start gap-3">
                <CrayonButton type="button" tone="danger" pending={pending} onClick={onConfirm}>
                    Delete and save
                </CrayonButton>
                <button type="button" onClick={onKeep} className={TEXT_BUTTON_CLASS}>
                    Keep editing
                </button>
            </div>
        </div>
    );
}

type LeaveProps = { leaveHref: string; onKeep: () => void };

export function LeaveNotice({ leaveHref, onKeep }: Readonly<LeaveProps>) {
    return (
        <div role="alert" className="relative flex flex-col gap-3 p-5">
            <CrayonFrame filled />
            <p className="relative flex items-start gap-2 font-semibold text-ink">
                <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-soft" />
                You have changes that are not saved yet.
            </p>
            <div className="relative flex flex-wrap items-center gap-6">
                <button type="button" onClick={onKeep} className={TEXT_BUTTON_CLASS}>
                    Keep editing
                </button>
                <Link href={leaveHref} className={TEXT_BUTTON_CLASS}>
                    Leave without saving
                </Link>
            </div>
        </div>
    );
}