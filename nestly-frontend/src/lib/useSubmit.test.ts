import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionExpiredError } from "./api";
import { NETWORK_ERROR, useSubmit } from "./useSubmit";

describe("useSubmit", () => {
    it("is pending while the action runs and ready again afterwards", async () => {
        const onError = vi.fn();
        const { result } = renderHook(() => useSubmit(onError));
        let finish!: (leaving: boolean) => void;
        let running!: Promise<void>;

        act(() => {
            running = result.current.submit(
                () =>
                    new Promise<boolean>((resolve) => {
                        finish = resolve;
                    }),
            );
        });
        expect(result.current.pending).toBe(true);

        await act(async () => {
            finish(false);
            await running;
        });
        expect(result.current.pending).toBe(false);
        expect(onError).not.toHaveBeenCalled();
    });

    it("stays pending when the action is leaving the page", async () => {
        const { result } = renderHook(() => useSubmit(vi.fn()));

        await act(async () => {
            await result.current.submit(async () => true);
        });

        expect(result.current.pending).toBe(true);
    });

    it("reports network failures and becomes ready again", async () => {
        const onError = vi.fn();
        const { result } = renderHook(() => useSubmit(onError));

        await act(async () => {
            await result.current.submit(async () => {
                throw new TypeError("Failed to fetch");
            });
        });

        expect(onError).toHaveBeenCalledWith(NETWORK_ERROR);
        expect(result.current.pending).toBe(false);
    });

    it("stays silent when the session expired", async () => {
        const onError = vi.fn();
        const { result } = renderHook(() => useSubmit(onError));

        await act(async () => {
            await result.current.submit(async () => {
                throw new SessionExpiredError();
            });
        });

        expect(onError).not.toHaveBeenCalled();
    });
});