import { clearToken, getToken, setToken } from "./auth";
import { redirectTo } from "./navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const REFRESH_LOCK_NAME = "nestly-token-refresh";

export async function apiFetch(path: string, options: RequestInit = {}) {
    return fetch(`${API_URL}${path}`, {
        credentials: "include",
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
}

export class SessionExpiredError extends Error {
    constructor() {
        super("Session expired");
    }
}

export async function authFetch(path: string, options: RequestInit = {}, redirectOnExpiry = true) {
    let token = getToken() ?? (await refreshAccessToken(null));
    if (!token) expireSession(redirectOnExpiry, false);

    let res = await sendAuthorized(path, options, token!);
    if (res.status === 401) {
        token = await refreshAccessToken(token!);
        if (!token) expireSession(redirectOnExpiry, true);
        res = await sendAuthorized(path, options, token!);
        if (res.status === 401) expireSession(redirectOnExpiry, true);
    }
    return res;
}

export async function logout() {
    clearToken();
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
}

export function ignoreSessionExpired(err: unknown): undefined {
    if (err instanceof SessionExpiredError) return undefined;
    throw err;
}

function sendAuthorized(path: string, options: RequestInit, token: string) {
    return apiFetch(path, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, ...options.headers },
    });
}

// The lock serializes refreshes across concurrent requests and browser tabs. Since the refresh token is single-use,
// so a second parallel refresh would be treated by the server as a token theft and revoke the session
async function refreshAccessToken(staleToken: string | null): Promise<string | null> {
    const run = async () => {
        const current = getToken();
        if (current && current !== staleToken) return current;
        const res = await apiFetch("/api/auth/refresh", { method: "POST" });
        if (!res.ok) return null;
        const data = await res.json();
        setToken(data.token);
        return data.token as string;
    };
    if ("locks" in navigator) {
        return navigator.locks.request(REFRESH_LOCK_NAME, run);
    }
    return run();
}

function expireSession(redirect: boolean, expired: boolean): never {
    clearToken();
    if (redirect) {
        const params = new URLSearchParams({ returnTo: window.location.pathname + window.location.search });
        if (expired) params.set("reason", "expired");
        redirectTo(`/login?${params}`);
    }
    throw new SessionExpiredError();
}