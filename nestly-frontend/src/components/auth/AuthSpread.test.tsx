import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthSpread } from "./AuthSpread";

vi.mock("next/navigation", () => ({ usePathname: () => "/register" }));

describe("AuthSpread", () => {
    it("shows a way back home and marks the tab of the current route", () => {
        render(
            <AuthSpread>
                <h1>Create your account</h1>
            </AuthSpread>,
        );

        expect(screen.getByRole("heading", { level: 1, name: "Create your account" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("link", { name: "Log in" })).not.toHaveAttribute("aria-current");
    });
});