"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState(""); // email ou username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit() {
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || "Resposta inválida do servidor" };
      }

      if (!res.ok) {
        setStatus(data?.error || "Erro ao entrar");
        return;
      }

      router.push("/alerts");
      router.refresh();
    } catch {
      setStatus("Falha de rede ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/">← Voltar</Link>
        </Button>

        <Button asChild variant="outline">
          <Link href="/register">Criar conta</Link>
        </Button>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Use seu email ou nome de usuário.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Email ou usuário</div>
            <Input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="ian.g.racano@gmail.com ou ianracano"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Senha</div>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <Button onClick={onSubmit} disabled={loading || !login.trim() || !password}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}

          <Separator />

          <div className="text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/register" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}