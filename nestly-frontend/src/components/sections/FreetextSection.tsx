"use client";

import { useMemo, useState } from "react";
import { RevealText } from "@/components/handwriting/HandwrittenReveal";
import { ConfirmableSection } from "@/components/sections/ConfirmableSection";
import { useAutosave } from "@/lib/useAutosave";

type Props = {
    initialData: Record<string, unknown>;
    onSave: (data: Record<string, unknown>) => void;
};

export function FreetextSection({ initialData, onSave }: Readonly<Props>) {
    const [text, setText] = useState((initialData.text as string) ?? "");
    const [confirmed, setConfirmed] = useState(initialData.confirmed === true);

    const data = useMemo(() => ({ text, confirmed }), [text, confirmed]);
    useAutosave(data, onSave);

    return (
        <ConfirmableSection
            title="Free text"
            confirmed={confirmed}
            onConfirm={() => setConfirmed(true)}
            onEdit={() => setConfirmed(false)}
        >
            {confirmed ? (
                <p className="written whitespace-pre-wrap">
                    <RevealText text={text} />
                </p>
            ) : (
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    aria-label="Free text"
                    className="written field-sizing-content w-full resize-none bg-transparent"
                />
            )}
        </ConfirmableSection>
    );
}