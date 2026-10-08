import { useEffect, useRef, type RefObject } from "react";

export function useRestoreFocus(active: boolean, target: RefObject<HTMLElement | null>) {
    const wasActive = useRef(false);

    useEffect(() => {
        if (wasActive.current && !active) target.current?.focus();
        wasActive.current = active;
    }, [active, target]);
}