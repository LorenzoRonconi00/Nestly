"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

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
        router.push("/");
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
                <h1 className="text-2xl font-semibold">Login</h1>
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
                    className="rounded border px-3 py-2"
                />
                <button type="submit" className="rounded bg-black px-3 py-2 text-white">
                    Login
                </button>
            </form>
        </main>
    );
}