"use client";

import { useState } from "react";
import { CrayonButton } from "@/components/ui/CrayonButton";
import { CrayonFrame } from "@/components/ui/CrayonFrame";
import { Field } from "@/components/ui/Field";
import { AlertIcon, TrashIcon } from "@/components/ui/icons";
import { TEXT_BUTTON_CLASS } from "@/components/ui/textButton";

type Props = {
    agendaName: string;
    pending: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function DeleteAgendaNotice({ agendaName, pending, onConfirm, onCancel }: Readonly<Props>) {
    const [typed, setTyped] = useState("");
    const matches = typed.trim() === agendaName.trim();

    return (
        <div role="alert" className="rise-quick relative flex flex-col gap-3 p-5">
            <CrayonFrame filled />
            <p className="relative flex items-start gap-2 font-semibold text-ink">
                <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger" />
                This permanently deletes the agenda and all its pages. Type its name to confirm.
            </p>
            <div className="relative">
                <Field
                    label="Agenda name"
                    icon={TrashIcon}
                    value={typed}
                    onChange={(event) => setTyped(event.target.value)}
                    placeholder={agendaName}
                    autoComplete="off"
                    autoFocus
                />
            </div>
            <div className="relative flex flex-col items-start gap-3">
                <CrayonButton type="button" tone="danger" pending={pending} disabled={!matches} onClick={onConfirm}>
                    Delete forever
                </CrayonButton>
                <button type="button" onClick={onCancel} className={TEXT_BUTTON_CLASS}>
                    Cancel
                </button>
            </div>
        </div>
    );
}