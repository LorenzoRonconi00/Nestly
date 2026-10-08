"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/app/AppBar";
import { NestIllustration } from "@/components/auth/NestIllustration";
import { NewAgendaTile } from "@/components/home/NewAgendaTile";
import { NotebookCover } from "@/components/home/NotebookCover";
import { LoadError } from "@/components/LoadError";
import { logout } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { parseCoverTheme } from "@/lib/coverTheme";
import { loadJson } from "@/lib/loadJson";

type Me = { userId: string; email: string };

type AgendaSummary = { id: string; name: string; baseTemplate: string; coverTheme: string | null };

const MAX_STAGGERED = 7;

function stagger(index: number): CSSProperties {
  return { "--i": Math.min(index, MAX_STAGGERED) } as CSSProperties;
}

export default function Home() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [agendas, setAgendas] = useState<AgendaSummary[] | null>(null);
  const [meFailed, setMeFailed] = useState(false);
  const [agendasFailed, setAgendasFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadJson<Me>("/api/auth/me").then((result) => {
      if (cancelled) return;
      if (result.kind === "not-found") {
        clearToken();
        router.replace("/login");
        return;
      }
      setMeFailed(result.kind === "error");
      setMe(result.kind === "ok" ? result.data : null);
    });
    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    loadJson<AgendaSummary[]>("/api/agendas").then((result) => {
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
    router.push("/login");
  }

  if (meFailed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <LoadError onRetry={retryLoading} />
      </main>
    );
  }

  if (!me) return null;

  return (
    <div className="paper-grain min-h-dvh bg-paper">
      <AppBar email={me.email} onLogout={handleLogout} />
      <main className="mx-auto w-full max-w-5xl px-6 pt-4 pb-20 md:px-10">
        <h1 className="font-hand text-4xl leading-tight text-ink md:text-5xl">Your agendas</h1>

        {agendasFailed && <LoadError onRetry={retryLoading} />}

        {agendas?.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <NestIllustration className="w-48" />
            <p className="font-hand text-3xl leading-tight text-ink">Let&apos;s start your first agenda.</p>
            <div className="w-40">
              <NewAgendaTile />
            </div>
          </div>
        )}

        {agendas && agendas.length > 0 && (
          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {agendas.map((agenda, index) => (
              <li key={agenda.id} className="rise-quick" style={stagger(index)}>
                <NotebookCover
                  id={agenda.id}
                  name={agenda.name}
                  baseTemplate={agenda.baseTemplate}
                  color={parseCoverTheme(agenda.coverTheme).color}
                />
              </li>
            ))}
            <li className="rise-quick" style={stagger(agendas.length)}>
              <NewAgendaTile />
            </li>
          </ul>
        )}
      </main>
    </div>
  );
}