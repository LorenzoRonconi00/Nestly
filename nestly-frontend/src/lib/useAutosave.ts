import { useEffect, useRef } from "react";

export function useAutosave<T>(value: T, onSave: (value: T) => void, delayMs = 800) {
    const isFirst = useRef(true);

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }
        const handle = setTimeout(() => onSave(value), delayMs);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
}