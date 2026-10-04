import { useEffect, useRef } from "react";

export function useAutosave<T>(value: T, onSave: (value: T) => void, delayMs = 800) {
    const lastSaved = useRef(JSON.stringify(value));

    useEffect(() => {
        const serialized = JSON.stringify(value);
        if (serialized === lastSaved.current) return;
        const handle = setTimeout(() => {
            lastSaved.current = serialized;
            onSave(value);
        }, delayMs);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
}