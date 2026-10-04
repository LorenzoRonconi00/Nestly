"use client";

import { useState } from "react";

type Props = {
    agendaName: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function DeleteAgendaPanel({ agendaName, onConfirm, onCancel }: Readonly<Props>) {
    const [typed, setTyped] = useState("");
    const matches = typed.trim() === agendaName.trim();

    return (
        <div role="alert" className="flex w-full max-w-sm flex-col gap-2 rounded border border-red-300 p-3">
            <p className="text-sm font-medium">
                This permanently deletes the agenda and all its pages. Type <strong>{agendaName}</strong> to
                confirm.
            </p>
            <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                aria-label="Agenda name confirmation"
                className="rounded border px-2 py-1"
            />
            <div className="flex gap-2">
                <button
                    onClick={onConfirm}
                    disabled={!matches}
                    className="cursor-pointer rounded bg-black px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Delete forever
                </button>
                <button onClick={onCancel} className="cursor-pointer rounded border px-3 py-1">
                    Cancel
                </button>
            </div>
        </div>
    );
}