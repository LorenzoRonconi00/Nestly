"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { flushDrafts } from "@/lib/drafts";

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
        <main className="flex min-h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
                <h1 className="text-2xl font-semibold">Login</h1>
                {notice && <p className="text-gray-600">{notice}</p>}
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