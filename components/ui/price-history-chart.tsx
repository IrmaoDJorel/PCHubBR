"use client";

import { useMemo } from "react";
import { formatBRLFromCents } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Snapshot = {
  priceCents: number;
  date: string;
  store: { name: string };
};

function formatDateBR(d: string) {
  // d vem como "YYYY-MM-DD"
  const [y, m, day] = d.split("-").map(Number);
  const dt = new Date(y, m - 1, day);
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function getDateKeyLocal(iso: string) {
  // Gera YYYY-MM-DD em horário local (evita bug do toISOString)
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeToCents(value: number) {
  // Blindagem: se vier 200/800, tratamos como reais e convertemos para centavos.
  // Se vier 20000/80000, já é centavos.
  // Heurística: abaixo de 5000 dificilmente é centavos num preço de CPU.
  if (!Number.isFinite(value)) return value;
  if (value > 0 && value < 5000) return Math.round(value * 100);
  return Math.round(value);
}

export function PriceHistoryChart({ history }: { history: Snapshot[] }) {
  const { data, stores } = useMemo(() => {
    const storeNames = Array.from(new Set(history.map((h) => h.store.name)));

    const byDate = new Map<string, Record<string, any>>();

    for (const h of history) {
      const key = getDateKeyLocal(h.date); // YYYY-MM-DD (local)
      if (!byDate.has(key)) byDate.set(key, { date: key });

      byDate.get(key)![h.store.name] = normalizeToCents(h.priceCents);
    }

    const rows = Array.from(byDate.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return { data: rows, stores: storeNames };
  }, [history]);

  const palette = ["#2563eb", "#16a34a", "#f97316", "#a855f7", "#ef4444"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de preço (30 dias)</CardTitle>
        <CardDescription>Uma linha por loja (valores em `R$`).</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" tickFormatter={formatDateBR} minTickGap={20} />

              <YAxis
                width={96}
                tickFormatter={(v) => formatBRLFromCents(Number(v))}
              />

              <Tooltip
                formatter={(value: any) => formatBRLFromCents(Number(value))}
                labelFormatter={(label) => `Data: ${formatDateBR(String(label))}`}
              />

              <Legend />

              {stores.map((store, idx) => (
                <Line
                  key={store}
                  type="monotone"
                  dataKey={store}
                  name={store}
                  stroke={palette[idx % palette.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}