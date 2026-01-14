"use client";
import { useEffect, useState } from "react";

type Cpu = { id: string; name: string; slug: string; brand: string; cores: number; threads: number };

export default function Home() {
  const [cpus, setCpus] = useState<Cpu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cpus").then((r) => r.json()).then(setCpus).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <main style={{ padding: 16 }}>
      <h1>PCHubBR</h1>
      <p>CPUs (MVP)</p>
      <ul>
        {cpus.map((c) => (
          <li key={c.id}>
            <a href={`/cpu/${c.slug}`}>{c.name}</a> — {c.brand} — {c.cores}c/{c.threads}t
          </li>
        ))}
      </ul>
    </main>
  );
}