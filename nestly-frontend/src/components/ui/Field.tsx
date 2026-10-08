"use client";

import { useId, type ComponentType, type InputHTMLAttributes, type ReactNode, type SVGProps } from "react";
import { CrayonLine } from "@/components/ui/CrayonLine";
import { AlertIcon } from "@/components/ui/icons";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    hint?: string;
    error?: string | null;
    trailing?: ReactNode;
};

export function Field({ label, icon: Icon, hint, error, trailing, ...rest }: Readonly<FieldProps>) {
    const id = useId();
    const noteId = `${id}-note`;

    return (
        <div className="group flex flex-col gap-1">
            <label htmlFor={id} className="font-hand text-xl leading-6 text-ink">
                {label}
            </label>
            <div className="flex items-center gap-2 rounded-t-xl px-1 transition-colors duration-150 ease-out group-focus-within:bg-accent-soft/60 motion-reduce:transition-none">
                <Icon className="size-6 shrink-0 text-ink-soft" />
                <input
                    id={id}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={noteId}
                    className="min-h-11 w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-ink-soft"
                    {...rest}
                />
                {trailing}
            </div>
            <CrayonLine tone={error ? "error" : "neutral"} />
            <p
                id={noteId}
                aria-live="polite"
                className={`flex min-h-6 items-start gap-1.5 text-sm ${error ? "text-danger" : "text-ink-soft"}`}
            >
                {error && <AlertIcon className="mt-0.5 size-4 shrink-0" />}
                {error ?? hint}
            </p>
        </div>
    );
}