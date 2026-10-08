import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrayonButton } from "./CrayonButton";

describe("CrayonButton", () => {
    it("submits by default and is enabled", () => {
        render(<CrayonButton>Log in</CrayonButton>);

        const button = screen.getByRole("button", { name: "Log in" });

        expect(button).toHaveAttribute("type", "submit");
        expect(button).toBeEnabled();
    });

    it("is disabled while pending", () => {
        render(<CrayonButton pending>Logging in…</CrayonButton>);

        expect(screen.getByRole("button", { name: "Logging in…" })).toBeDisabled();
    });
});