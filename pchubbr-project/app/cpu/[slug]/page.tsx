"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type CpuDetail = {
  name: string;
  brand: string;
  cores: number;
  threads: number;
  baseClock: number;
  boostClock?: number | null;
  socket: string;
  offers: Array<{ price: number; url: string; store: { name: string } }>;
  minPrice: number | null;
  maxPrice: number | null;
};

type Snapshot = { price: number; date: string; store: { name: string } };

export default function CpuPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [cpu, setCpu] = useState<CpuDetail | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    Promise.all([
      fetch(`/api/cpus/${slug}`).then((r) => r.json()),
      fetch(`/api/cpus/${slug}/history?days=30`).then((r) => r.json()),
    ])
      .then(([cpuData, hist]) => {
        setCpu(cpuData);
        setHistory(hist);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Carregando...</div>;
  if (!cpu) return <div>CPU não encontrada</div>;

  return (
    <main style={{ padding: 16 }}>
      <a href="/">← Voltar</a>

      <h1>{cpu.name}</h1>
      <p>
        {cpu.brand} — {cpu.cores}c/{cpu.threads}t — Socket {cpu.socket}
      </p>

      <h2>Ofertas atuais</h2>
      {cpu.offers?.length ? (
        <ul>
          {cpu.offers.map((o, i) => (
            <li key={i}>
              {o.store.name}: R$ {o.price.toFixed(2)} —{" "}
              <a href={o.url} target="_blank" rel="noreferrer">
                Ver
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Sem ofertas</p>
      )}

      <h2>Histórico (30 dias)</h2>
      {history?.length ? (
        <ul>
          {history.map((s, i) => (
            <li key={i}>
              {s.store.name}: R$ {s.price.toFixed(2)} em{" "}
              {new Date(s.date).toLocaleDateString("pt-BR")}
            </li>
          ))}
        </ul>
      ) : (
        <p>Sem histórico</p>
      )}
    </main>
  );
}