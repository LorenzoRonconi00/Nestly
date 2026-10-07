"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { TextLink } from "@/components/ui/TextLink";
import { firstValidationMessage } from "@/lib/errors";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const res = await apiFetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            if (res.status === 409) {
                setError("Email already registered");
                return;
            }
            const message = res.status === 400 ? await firstValidationMessage(res) : null;
            setError(message ?? "Registration failed");
            return;
        }
        router.push("/login");
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-8">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <h1 className="text-2xl font-bold">Create your account</h1>
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
                        placeholder="Password (min 8 characters)"
                        aria-label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                    <Button type="submit">Register</Button>
                    <p className="text-sm text-ink-soft">
                        Already have an account? <TextLink href="/login">Login</TextLink>
                    </p>
                </form>
            </Card>
        </main>
    );
}