"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage({ searchParams }: { searchParams: { checkEmail?: string } }) {
  const [email, setEmail] = useState("");

  const checkEmail = searchParams?.checkEmail === "1";

  return (
    <main className="mx-auto max-w-md p-6">
      <Button asChild variant="outline">
        <Link href="/">← Voltar</Link>
      </Button>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            {checkEmail
              ? "Enviamos um link para seu email. Abra e clique para entrar."
              : "Digite seu email e enviaremos um link de acesso."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            inputMode="email"
          />
          <Button
            onClick={() => signIn("email", { email, callbackUrl: "/alerts" })}
            disabled={!email.trim().includes("@")}
          >
            Enviar link de login
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}