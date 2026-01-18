"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit() {
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || "Resposta inválida do servidor" };
      }

      if (!res.ok) {
        setStatus(data?.error || "Erro ao cadastrar");
        return;
      }

      router.push("/alerts");
      router.refresh();
    } catch {
      setStatus("Falha de rede ao cadastrar");
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
          <Link href="/login">Entrar</Link>
        </Button>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Cadastre email, usuário e senha.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Email</div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Nome de usuário</div>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex.: ianracano"
              autoComplete="username"
            />
            <div className="text-xs text-muted-foreground">
              Use apenas letras/números. (Validação avançada pode vir depois.)
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Senha</div>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 8 caracteres"
              type="password"
              autoComplete="new-password"
            />
          </div>

          <Button
            onClick={onSubmit}
            disabled={loading || !email.trim().includes("@") || username.trim().length < 3 || password.length < 8}
          >
            {loading ? "Criando..." : "Criar conta"}
          </Button>

          {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}

          <Separator />

          <div className="text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}