"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch, ignoreSessionExpired, logout } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Me = { userId: string; email: string };

export default function Home() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authFetch("/api/auth/me", {}, false)
      .catch(ignoreSessionExpired)
      .then((res) => (res?.ok ? res.json() : null))
      .then((data) => setMe(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await logout();
    setMe(null);
  }

  if (loading) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Nestly</h1>
      {me ? (
        <>
          <p>Logged in as {me.email}</p>
          <Link href="/agendas/new" className="underline">New agenda</Link>
          <button onClick={handleLogout} className="rounded bg-black px-3 py-2 text-white">
            Logout
          </button>
        </>
      ) : (
        <div className="flex gap-4">
          <Link href="/login" className="underline">Login</Link>
          <Link href="/register" className="underline">Register</Link>
        </div>
      )}
    </main>
  );
}