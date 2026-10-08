"use client";

import { useState } from "react";
import { Field, type FieldProps } from "@/components/ui/Field";
import { EyeIcon, EyeOffIcon, KeyIcon } from "@/components/ui/icons";

export function PasswordField(props: Readonly<Omit<FieldProps, "icon" | "type" | "trailing">>) {
    const [visible, setVisible] = useState(false);
    const EyeStateIcon = visible ? EyeOffIcon : EyeIcon;

    return (
        <Field
            {...props}
            icon={KeyIcon}
            type={visible ? "text" : "password"}
            trailing={
                <button
                    type="button"
                    aria-pressed={visible}
                    aria-label="Show password"
                    onClick={() => setVisible((current) => !current)}
                    className="-mr-1 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink-soft transition-[transform,color] duration-150 ease-out hover:text-ink active:scale-95 motion-reduce:transition-none"
                >
                    <EyeStateIcon className="size-6" />
                </button>
            }
        />
    );
}