"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

type Props = {
    agendaName: string;
    pending: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function DeleteAgendaPanel({ agendaName, pending, onConfirm, onCancel }: Readonly<Props>) {
    const [typed, setTyped] = useState("");
    const matches = typed.trim() === agendaName.trim();

    return (
        <div role="alert" className="flex w-full flex-col gap-3 rounded-2xl border border-danger bg-sheet p-4">
            <p className="text-sm font-semibold">
                This permanently deletes the agenda and all its pages. Type <strong>{agendaName}</strong> to
                confirm.
            </p>
            <TextInput
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                aria-label="Agenda name confirmation"
            />
            <div className="flex gap-2">
                <Button variant="danger" onClick={onConfirm} disabled={!matches || pending}>
                    Delete forever
                </Button>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}