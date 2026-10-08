"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiseIn } from "@/components/auth/RiseIn";
import { CrayonButton } from "@/components/ui/CrayonButton";
import { Field } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { MailIcon } from "@/components/ui/icons";
import { PasswordField } from "@/components/ui/PasswordField";
import { apiFetch } from "@/lib/api";
import { firstViolation } from "@/lib/errors";
import { useSubmit } from "@/lib/useSubmit";

type FormError = { field: "email" | "password" | null; message: string };

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<FormError | null>(null);
    const { pending, submit } = useSubmit((message) => setError({ field: null, message }));

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        void submit(async () => {
            const res = await apiFetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                if (res.status === 409) {
                    setError({ field: "email", message: "That email already has an account. Try logging in." });
                    return false;
                }
                const violation = res.status === 400 ? await firstViolation(res) : null;
                setError({
                    field: violation?.field === "email" || violation?.field === "password" ? violation.field : null,
                    message: violation?.message ?? "Registration failed. Try again in a moment.",
                });
                return false;
            }
            router.push("/login");
            return true;
        });
    }

    return (
        <>
            <RiseIn index={0}>
                <h1 className="font-hand text-4xl leading-tight text-ink">Create your account</h1>
            </RiseIn>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <RiseIn index={1}>
                    <Field
                        label="Your email"
                        icon={MailIcon}
                        type="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={error?.field === "email" ? error.message : null}
                        required
                    />
                </RiseIn>
                <RiseIn index={2}>
                    <PasswordField
                        label="Choose a password"
                        hint="8 to 72 characters"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={error?.field === "password" ? error.message : null}
                        required
                        minLength={8}
                    />
                </RiseIn>
                <FormMessage message={error?.field === null ? error.message : null} />
                <RiseIn index={3}>
                    <CrayonButton pending={pending}>{pending ? "Creating account…" : "Create account"}</CrayonButton>
                </RiseIn>
            </form>
        </>
    );
}