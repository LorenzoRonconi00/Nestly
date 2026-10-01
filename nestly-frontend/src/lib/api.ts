import { clearToken, getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function apiFetch(path: string, options: RequestInit = {}) {
    return fetch(`${API_URL}${path}`, {
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

export async function authFetch(path: string, options: RequestInit = {}) {
    const token = getToken();
    if (!token) {
        redirectToLogin(false);
        throw new SessionExpiredError();
    }
    const res = await apiFetch(path, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, ...options.headers },
    });
    if (res.status === 401) {
        clearToken();
        redirectToLogin(true);
        throw new SessionExpiredError();
    }
    return res;
}

export function ignoreSessionExpired(err: unknown): undefined {
    if (err instanceof SessionExpiredError) return undefined;
    throw err;
}

function redirectToLogin(expired: boolean) {
    const params = new URLSearchParams({ returnTo: window.location.pathname });
    if (expired) params.set("reason", "expired");
    window.location.assign(`/login?${params}`);
}