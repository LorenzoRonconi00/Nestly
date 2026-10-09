import { PlusIcon } from "@/components/ui/icons";

type Props = { label: string; onClick: () => void; disabled?: boolean };

export function AddItemButton({ label, onClick, disabled }: Readonly<Props>) {
    return (
        <div className="flex h-8 items-center">
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className="-my-1.5 flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full pr-3 pl-1 font-hand text-xl text-ink-soft transition-[color,transform] duration-150 ease-out-strong hover:text-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            >
                <PlusIcon className="size-5" />
                {label}
            </button>
        </div>
    );
}