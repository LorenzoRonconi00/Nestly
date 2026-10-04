"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch, ignoreSessionExpired, logout } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold">Nestly</h1>
        {me ? (
          <p className="text-sm text-ink-soft">Logged in as {me.email}</p>
        ) : (
          <p className="text-ink-soft">Your cozy digital agenda.</p>
        )}
      </header>

      {me ? (
        <>
          <Card className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Your agendas</h2>
            {agendas?.length === 0 && <p className="text-sm text-ink-soft">No agendas yet</p>}
            {agendas && agendas.length > 0 && (
              <ul className="flex flex-col">
                {agendas.map((agenda) => (
                  <li key={agenda.id}>
                    <Link
                      href={`/agendas/${agenda.id}`}
                      className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 hover:bg-accent-soft"
                    >
                      <span className="font-semibold">{agenda.name}</span>
                      <span className="rounded-full border bg-paper px-2 py-0.5 text-xs text-ink-soft">
                        {agenda.baseTemplate}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <div className="flex gap-3">
            <Link href="/agendas/new" className={buttonClassName("primary")}>
              New agenda
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </>
      ) : (
        <div className="flex gap-3">
          <Link href="/login" className={buttonClassName("primary")}>
            Login
          </Link>
          <Link href="/register" className={buttonClassName("secondary")}>
            Register
          </Link>
        </div>
      )}
    </main>
  );
}