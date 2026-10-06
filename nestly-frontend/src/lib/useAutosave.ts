import { useEffect, useRef } from "react";

export function useAutosave<T>(value: T, onSave: (value: T) => void, delayMs = 800) {
    const lastSaved = useRef(JSON.stringify(value));
    const latest = useRef({ value, onSave });

    useEffect(() => {
        latest.current = { value, onSave };
    });

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

    // Unmounting must not drop a pending edit: pages are unmounted while the user can still be typing
    useEffect(() => {
        return () => {
            const { value: current, onSave: save } = latest.current;
            const serialized = JSON.stringify(current);
            if (serialized === lastSaved.current) return;
            lastSaved.current = serialized;
            save(current);
        };
    }, []);
}