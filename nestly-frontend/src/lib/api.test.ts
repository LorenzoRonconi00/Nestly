import { beforeEach, describe, expect, it, vi } from "vitest";
import { authFetch, ignoreSessionExpired, logout, SessionExpiredError } from "./api";
import { getToken, setToken } from "./auth";
import { redirectTo } from "./navigation";

vi.mock("./navigation", () => ({ redirectTo: vi.fn() }));

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function requestHeader(call: unknown[], name: string) {
    const init = call[1] as RequestInit;
    return (init.headers as Record<string, string>)[name];
}

describe("authFetch", () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
        vi.mocked(redirectTo).mockClear();
    });

    it("sends the access token and returns the response", async () => {
        setToken("token-1");
        fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

        const res = await authFetch("/api/agendas");

        expect(res.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(requestHeader(fetchMock.mock.calls[0], "Authorization")).toBe("Bearer token-1");
        expect((fetchMock.mock.calls[0][1] as RequestInit).credentials).toBe("include");
    });

    it("renews an expired token once and retries the request with the new one", async () => {
        setToken("old");
        fetchMock
            .mockResolvedValueOnce(new Response(null, { status: 401 }))
            .mockResolvedValueOnce(jsonResponse({ token: "new" }))
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        const res = await authFetch("/api/agendas");

        expect(res.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(String(fetchMock.mock.calls[1][0])).toContain("/api/auth/refresh");
        expect(requestHeader(fetchMock.mock.calls[2], "Authorization")).toBe("Bearer new");
        expect(getToken()).toBe("new");
        expect(redirectTo).not.toHaveBeenCalled();
    });

    it("sends the user to the login page when the session cannot be renewed", async () => {
        window.history.replaceState({}, "", "/agendas/42/book?date=2026-10-04");
        setToken("old");
        fetchMock
            .mockResolvedValueOnce(new Response(null, { status: 401 }))
            .mockResolvedValueOnce(new Response(null, { status: 401 }));

        await expect(authFetch("/api/agendas")).rejects.toBeInstanceOf(SessionExpiredError);

        expect(getToken()).toBeNull();
        expect(redirectTo).toHaveBeenCalledTimes(1);
        const target = new URL(vi.mocked(redirectTo).mock.calls[0][0], "http://localhost");
        expect(target.pathname).toBe("/login");
        expect(target.searchParams.get("reason")).toBe("expired");
        expect(target.searchParams.get("returnTo")).toBe("/agendas/42/book?date=2026-10-04");
    });

    it("gives up if the request is still unauthorized after a renewal", async () => {
        setToken("old");
        fetchMock
            .mockResolvedValueOnce(new Response(null, { status: 401 }))
            .mockResolvedValueOnce(jsonResponse({ token: "new" }))
            .mockResolvedValueOnce(new Response(null, { status: 401 }));

        await expect(authFetch("/api/agendas")).rejects.toBeInstanceOf(SessionExpiredError);

        expect(redirectTo).toHaveBeenCalledTimes(1);
    });

    it("renews the session when there is no access token but the refresh cookie is valid", async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ token: "fresh" }))
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        const res = await authFetch("/api/agendas");

        expect(res.status).toBe(200);
        expect(String(fetchMock.mock.calls[0][0])).toContain("/api/auth/refresh");
        expect(requestHeader(fetchMock.mock.calls[1], "Authorization")).toBe("Bearer fresh");
    });

    it("redirects without the expired notice when nobody was logged in", async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

        await expect(authFetch("/api/agendas")).rejects.toBeInstanceOf(SessionExpiredError);

        const target = new URL(vi.mocked(redirectTo).mock.calls[0][0], "http://localhost");
        expect(target.searchParams.has("reason")).toBe(false);
    });

    it("goes to the plain login page, without a return address, when the user was on the home page", async () => {
        window.history.replaceState({}, "", "/");
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

        await expect(authFetch("/api/auth/me")).rejects.toBeInstanceOf(SessionExpiredError);

        expect(redirectTo).toHaveBeenCalledWith("/login");
    });


    it("does not redirect when redirecting is switched off", async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

        await expect(authFetch("/api/auth/me", {}, false)).rejects.toBeInstanceOf(SessionExpiredError);

        expect(redirectTo).not.toHaveBeenCalled();
    });

    it("renews the token only once when several requests expire together", async () => {
        setToken("old");
        const locks = createFakeLocks();
        vi.stubGlobal("navigator", { ...window.navigator, locks });
        fetchMock.mockImplementation(async (input, init) => {
            const url = String(input);
            if (url.includes("/api/auth/refresh")) return jsonResponse({ token: "new" });
            const authorization = (init?.headers as Record<string, string>).Authorization;
            return authorization === "Bearer new" ? jsonResponse({ ok: true }) : new Response(null, { status: 401 });
        });

        const results = await Promise.all([authFetch("/api/a"), authFetch("/api/b"), authFetch("/api/c")]);

        expect(results.map((res) => res.status)).toEqual([200, 200, 200]);
        const refreshCalls = fetchMock.mock.calls.filter((call) => String(call[0]).includes("/api/auth/refresh"));
        expect(refreshCalls).toHaveLength(1);
    });
});

describe("logout", () => {
    it("clears the token and asks the server to revoke the session", async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
        vi.stubGlobal("fetch", fetchMock);
        setToken("token");

        await logout();

        expect(getToken()).toBeNull();
        expect(String(fetchMock.mock.calls[0][0])).toContain("/api/auth/logout");
    });

    it("clears the token even when the server is unreachable", async () => {
        vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new TypeError("network")));
        setToken("token");

        await expect(logout()).resolves.toBeUndefined();

        expect(getToken()).toBeNull();
    });
});

describe("ignoreSessionExpired", () => {
    it("swallows a session expiry and rethrows everything else", () => {
        expect(ignoreSessionExpired(new SessionExpiredError())).toBeUndefined();
        expect(() => ignoreSessionExpired(new Error("boom"))).toThrow("boom");
    });
});

function createFakeLocks() {
    let queue: Promise<unknown> = Promise.resolve();
    return {
        request: <T>(_name: string, callback: () => Promise<T>): Promise<T> => {
            const result = queue.then(callback);
            queue = result.catch(() => undefined);
            return result;
        },
    };
}