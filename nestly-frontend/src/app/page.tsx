async function getBackendHealth() {
  try {
    const res = await fetch("http://localhost:8080/actuator/health", { cache: "no-store" });
    if (!res.ok) return { status: "UNREACHABLE" };
    return res.json();
  } catch {
    return { status: "UNREACHABLE" };
  }
}

export default async function Home() {
  const health = await getBackendHealth();

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Nestly</h1>
        <p className="mt-2">
          Backend status: <span className="font-mono">{health.status}</span>
        </p>
      </div>
    </main>
  );
}