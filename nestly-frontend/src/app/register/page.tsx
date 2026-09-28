"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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
            setError(res.status === 409 ? "Email already registered" : "Registration failed");
            return;
        }
        router.push("/login");
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
                <h1 className="text-2xl font-semibold">Register</h1>
                {error && <p className="text-red-600">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded border px-3 py-2"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="rounded border px-3 py-2"
                />
                <button type="submit" className="rounded bg-black px-3 py-2 text-white">
                    Register
                </button>
            </form>
        </main>
    );
}