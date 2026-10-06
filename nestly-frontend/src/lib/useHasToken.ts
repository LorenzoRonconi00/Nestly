import { useSyncExternalStore } from "react";
import { getToken } from "./auth";

function subscribe() {
    return () => undefined;
}

// null means "not known yet": on the server there is no localStorage to read
export function useHasToken(): boolean | null {
    return useSyncExternalStore<boolean | null>(subscribe, () => getToken() !== null, () => null);
}