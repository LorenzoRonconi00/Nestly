import { IconButton } from "@/components/ui/IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

type Props = { title: string; previousLabel: string; nextLabel: string; onPrevious: () => void; onNext: () => void };

export function SidebarHeader({ title, previousLabel, nextLabel, onPrevious, onNext }: Readonly<Props>) {
    return (
        <div className="flex items-center gap-1 border-b border-border px-3 py-3">
            <IconButton aria-label={previousLabel} onClick={onPrevious}>
                <ChevronLeftIcon className="size-6" />
            </IconButton>
            <h2 className="min-w-0 flex-1 text-center font-hand text-2xl leading-none text-ink">{title}</h2>
            <IconButton aria-label={nextLabel} onClick={onNext}>
                <ChevronRightIcon className="size-6" />
            </IconButton>
        </div>
    );
}