"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiseIn } from "@/components/auth/RiseIn";
import { CrayonButton } from "@/components/ui/CrayonButton";
import { Field } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { MailIcon } from "@/components/ui/icons";
import { PasswordField } from "@/components/ui/PasswordField";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { flushDrafts } from "@/lib/drafts";
import { useQueryParam } from "@/lib/useQueryParam";
import { useSubmit } from "@/lib/useSubmit";

type FormError = { field: "email" | "password" | null; message: string };

function readReturnTo(): string {
    const value = new URLSearchParams(window.location.search).get("returnTo");
    const safe = value?.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\");
    return safe ? value! : "/";
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<FormError | null>(null);
    const { pending, submit } = useSubmit((message) => setError({ field: null, message }));
    const notice =
        useQueryParam("reason") === "expired"
            ? "Your session expired. Log in to continue; unsaved changes will be restored."
            : null;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        void submit(async () => {
            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                setError(
                    res.status === 400 || res.status === 401
                        ? { field: "password", message: "That email and password don't match." }
                        : { field: null, message: "Login failed. Try again in a moment." },
                );
                return false;
            }
            const data = await res.json();
            setToken(data.token);
            await flushDrafts();
            router.push(readReturnTo());
            return true;
        });
    }

    return (
        <>
            <RiseIn index={0}>
                <h1 className="font-hand text-4xl leading-tight text-ink">Welcome back</h1>
            </RiseIn>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                {notice && (
                    <p role="status" className="text-sm text-ink-soft">
                        {notice}
                    </p>
                )}
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
                        label="Your password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={error?.field === "password" ? error.message : null}
                        required
                    />
                </RiseIn>
                <FormMessage message={error?.field === null ? error.message : null} />
                <RiseIn index={3}>
                    <CrayonButton pending={pending}>{pending ? "Logging in…" : "Log in"}</CrayonButton>
                </RiseIn>
            </form>
        </>
    );
}