"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch, ignoreSessionExpired, logout } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Me = { userId: string; email: string };

type AgendaSummary = { id: string; name: string; baseTemplate: string };

export default function Home() {

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [agendas, setAgendas] = useState<AgendaSummary[] | null>(null);

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

  useEffect(() => {
    if (!me) return;
    authFetch("/api/agendas", {}, false)
      .catch(ignoreSessionExpired)
      .then((res) => (res?.ok ? res.json() : []))
      .then(setAgendas);
  }, [me]);

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
          <h2 className="text-lg font-medium">Your agendas</h2>
          {agendas?.length === 0 && <p className="text-sm text-gray-500">No agendas yet</p>}
          {agendas && agendas.length > 0 && (
            <ul className="flex flex-col gap-1">
              {agendas.map((agenda) => (
                <li key={agenda.id}>
                  <Link href={`/agendas/${agenda.id}`} className="underline">
                    {agenda.name}
                  </Link>
                  <span className="ml-2 text-sm text-gray-500">{agenda.baseTemplate}</span>
                </li>
              ))}
            </ul>
          )}
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