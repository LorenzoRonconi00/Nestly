"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/api";
import { loadJson } from "@/lib/loadJson";
import { useHasToken } from "@/lib/useHasToken";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadError } from "@/components/LoadError";

type Me = { userId: string; email: string };

type AgendaSummary = { id: string; name: string; baseTemplate: string };

export default function Home() {

  const hasToken = useHasToken();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [agendas, setAgendas] = useState<AgendaSummary[] | null>(null);
  const [meFailed, setMeFailed] = useState(false);
  const [agendasFailed, setAgendasFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!hasToken) return;
    let cancelled = false;
    loadJson<Me>("/api/auth/me", false).then((result) => {
      if (cancelled) return;
      setMeFailed(result.kind === "error");
      setMe(result.kind === "ok" ? result.data : null);
    });
    return () => {
      cancelled = true;
    };
  }, [hasToken, attempt]);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    loadJson<AgendaSummary[]>("/api/agendas", false).then((result) => {
      if (cancelled) return;
      setAgendasFailed(result.kind !== "ok");
      setAgendas(result.kind === "ok" ? result.data : null);
    });
    return () => {
      cancelled = true;
    };
  }, [me, attempt]);

  function retryLoading() {
    setMeFailed(false);
    setMe(undefined);
    setAgendasFailed(false);
    setAgendas(null);
    setAttempt((current) => current + 1);
  }

  async function handleLogout() {
    await logout();
    setMe(null);
  }

  const loading = hasToken === null || (hasToken && me === undefined);
  if (loading) return null;

  if (meFailed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <LoadError onRetry={retryLoading} />
      </main>
    );
  }

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
            {agendasFailed && <LoadError onRetry={retryLoading} />}
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