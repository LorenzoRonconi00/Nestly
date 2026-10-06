import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { setToken } from "./auth";
import { useHasToken } from "./useHasToken";
import { useQueryParam } from "./useQueryParam";

describe("useQueryParam", () => {
    it("reads a parameter from the current URL", () => {
        window.history.replaceState({}, "", "/login?reason=expired&returnTo=%2Fagendas");

        expect(renderHook(() => useQueryParam("reason")).result.current).toBe("expired");
        expect(renderHook(() => useQueryParam("returnTo")).result.current).toBe("/agendas");
    });

    it("returns null when the parameter is missing", () => {
        window.history.replaceState({}, "", "/login");

        expect(renderHook(() => useQueryParam("reason")).result.current).toBeNull();
    });
});

describe("useHasToken", () => {
    it("is false without an access token", () => {
        expect(renderHook(() => useHasToken()).result.current).toBe(false);
    });

    it("is true when an access token is stored", () => {
        setToken("token");

        expect(renderHook(() => useHasToken()).result.current).toBe(true);
    });
});