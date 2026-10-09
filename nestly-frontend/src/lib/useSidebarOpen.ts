import { useSyncExternalStore } from "react";

const STORAGE_KEY = "nestly_sidebar";
const DOCKED_QUERY = "(min-width: 1280px)";
const listeners = new Set<() => void>();
let override: boolean | null = null;

function readStored(): boolean | null {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === null ? null : value === "open";
    } catch {
        return null;
    }
}

function persist(open: boolean) {
    try {
        localStorage.setItem(STORAGE_KEY, open ? "open" : "closed");
    } catch {
        return;
    }
}

function getSnapshot(): boolean {
    if (!window.matchMedia(DOCKED_QUERY).matches) return override ?? false;
    return override ?? readStored() ?? true;
}

function subscribe(listener: () => void) {
    const list = window.matchMedia(DOCKED_QUERY);
    const onChange = () => {
        override = null;
        listener();
    };
    listeners.add(listener);
    list.addEventListener("change", onChange);
    return () => {
        listeners.delete(listener);
        list.removeEventListener("change", onChange);
    };
}

function setOpen(next: boolean) {
    override = next;
    if (window.matchMedia(DOCKED_QUERY).matches) persist(next);
    listeners.forEach((listener) => listener());
}

export function useSidebarOpen(): [boolean, (open: boolean) => void] {
    const open = useSyncExternalStore(subscribe, getSnapshot, () => false);
    return [open, setOpen];
}