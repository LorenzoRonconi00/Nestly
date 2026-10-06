import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "./useAutosave";

describe("useAutosave", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it("does not save the initial value", () => {
        const onSave = vi.fn();
        renderHook(() => useAutosave({ text: "hello" }, onSave, 800));

        vi.advanceTimersByTime(5000);

        expect(onSave).not.toHaveBeenCalled();
    });

    it("saves a changed value once after the delay", () => {
        const onSave = vi.fn();
        const { rerender } = renderHook(({ value }) => useAutosave(value, onSave, 800), {
            initialProps: { value: { text: "a" } },
        });

        rerender({ value: { text: "ab" } });
        vi.advanceTimersByTime(799);
        expect(onSave).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith({ text: "ab" });
    });

    it("debounces rapid changes into a single save of the latest value", () => {
        const onSave = vi.fn();
        const { rerender } = renderHook(({ value }) => useAutosave(value, onSave, 800), {
            initialProps: { value: { text: "a" } },
        });

        rerender({ value: { text: "ab" } });
        vi.advanceTimersByTime(400);
        rerender({ value: { text: "abc" } });
        vi.advanceTimersByTime(400);
        rerender({ value: { text: "abcd" } });
        vi.advanceTimersByTime(800);

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith({ text: "abcd" });
    });

    it("does not save when a new object has the same content", () => {
        const onSave = vi.fn();
        const { rerender } = renderHook(({ value }) => useAutosave(value, onSave, 800), {
            initialProps: { value: { text: "same" } },
        });

        rerender({ value: { text: "same" } });
        vi.advanceTimersByTime(5000);

        expect(onSave).not.toHaveBeenCalled();
    });

    it("saves again when the value returns to its initial content after a save", () => {
        const onSave = vi.fn();
        const { rerender } = renderHook(({ value }) => useAutosave(value, onSave, 800), {
            initialProps: { value: { text: "a" } },
        });

        rerender({ value: { text: "b" } });
        vi.advanceTimersByTime(800);
        rerender({ value: { text: "a" } });
        vi.advanceTimersByTime(800);

        expect(onSave).toHaveBeenCalledTimes(2);
        expect(onSave).toHaveBeenLastCalledWith({ text: "a" });
    });

    it("flushes a pending edit when the component unmounts", () => {
        const onSave = vi.fn();
        const { rerender, unmount } = renderHook(({ value }) => useAutosave(value, onSave, 800), {
            initialProps: { value: { text: "a" } },
        });

        rerender({ value: { text: "ab" } });
        vi.advanceTimersByTime(300);
        unmount();

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith({ text: "ab" });
    });

    it("does not save on unmount when nothing changed or the edit was already saved", () => {
        const onSave = vi.fn();
        const { rerender, unmount } = renderHook(({ value }) => useAutosave(value, onSave, 800), {
            initialProps: { value: { text: "a" } },
        });

        rerender({ value: { text: "b" } });
        vi.advanceTimersByTime(800);
        expect(onSave).toHaveBeenCalledTimes(1);

        unmount();

        expect(onSave).toHaveBeenCalledTimes(1);
    });
});