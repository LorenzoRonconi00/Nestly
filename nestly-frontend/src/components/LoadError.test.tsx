import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoadError } from "./LoadError";

describe("LoadError", () => {
    it("announces the problem and retries on request", () => {
        const onRetry = vi.fn();
        render(<LoadError onRetry={onRetry} />);

        expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
        fireEvent.click(screen.getByRole("button", { name: "Try again" }));

        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});