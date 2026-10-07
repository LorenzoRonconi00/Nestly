import { authFetch, SessionExpiredError } from "./api";

export type LoadResult<T> =
    | { kind: "ok"; data: T }
    | { kind: "not-found" }
    | { kind: "error" }
    | { kind: "expired" };

export type LoadStatus = "loading" | LoadResult<unknown>["kind"];

export async function loadJson<T>(path: string, redirectOnExpiry = true): Promise<LoadResult<T>> {
    try {
        const res = await authFetch(path, {}, redirectOnExpiry);
        if (res.ok) return { kind: "ok", data: await res.json() };
        return { kind: res.status === 404 || res.status === 400 ? "not-found" : "error" };
    } catch (err) {
        return { kind: err instanceof SessionExpiredError ? "expired" : "error" };
    }
}