import { useSyncExternalStore } from "react";

function subscribe() {
    return () => undefined;
}

// The query string only exists in the browser: the server snapshot is empty so hydration never mismatches
export function useQueryParam(name: string): string | null {
    const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
    return new URLSearchParams(search).get(name);
}