import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";
import { PasswordField } from "./PasswordField";
import { MailIcon } from "./icons";

describe("Field", () => {
    it("links the visible label to the input and describes it with the hint", () => {
        render(<Field label="Your email" icon={MailIcon} hint="We never share it" />);

        const input = screen.getByLabelText("Your email");

        expect(input).toHaveAccessibleDescription("We never share it");
        expect(input).not.toHaveAttribute("aria-invalid");
    });

    it("marks the input invalid and describes it with the error instead of the hint", () => {
        render(<Field label="Your email" icon={MailIcon} hint="We never share it" error="Enter a valid email address" />);

        const input = screen.getByLabelText("Your email");

        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAccessibleDescription("Enter a valid email address");
    });
});

describe("PasswordField", () => {
    it("hides the password by default and toggles its visibility", () => {
        render(<PasswordField label="Your password" />);

        const input = screen.getByLabelText("Your password");
        const toggle = screen.getByRole("button", { name: "Show password" });
        expect(input).toHaveAttribute("type", "password");
        expect(toggle).toHaveAttribute("aria-pressed", "false");

        fireEvent.click(toggle);
        expect(input).toHaveAttribute("type", "text");
        expect(toggle).toHaveAttribute("aria-pressed", "true");

        fireEvent.click(toggle);
        expect(input).toHaveAttribute("type", "password");
    });
});