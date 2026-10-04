"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { flushDrafts } from "@/lib/drafts";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { TextLink } from "@/components/ui/TextLink";

function readReturnTo(): string {
    const value = new URLSearchParams(window.location.search).get("returnTo");
    const safe = value?.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\");
    return safe ? value! : "/";
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("reason") === "expired") {
            setNotice("Your session expired. Log in to continue; unsaved changes will be restored.");
        }
    }, []);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        const res = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            setError("Invalid credentials");
            return;
        }
        const data = await res.json();
        setToken(data.token);
        await flushDrafts();
        router.push(readReturnTo());
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-8">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    {notice && <p className="text-sm text-ink-soft">{notice}</p>}
                    {error && (
                        <p role="alert" className="text-sm text-danger">
                            {error}
                        </p>
                    )}
                    <TextInput
                        type="email"
                        placeholder="Email"
                        aria-label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextInput
                        type="password"
                        placeholder="Password"
                        aria-label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit">Login</Button>
                    <p className="text-sm text-ink-soft">
                        No account yet? <TextLink href="/register">Register</TextLink>
                    </p>
                </form>
            </Card>
        </main>
    );
}