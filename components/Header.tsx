"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Settings, Bell, Heart, LogOut } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Componente Header
 * 
 * Barra superior da aplicação com:
 * - Logo (link para home)
 * - Toggle de tema (Dark/Light)
 * - Menu de usuário (se logado) ou botões de Login/Cadastro
 * 
 * Estado de autenticação é verificado via API /api/session
 */
export function Header() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Verifica se usuário está logado ao carregar o componente
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => setLoggedIn(Boolean(data?.loggedIn)))
      .catch(() => setLoggedIn(false))
      .finally(() => setSessionLoaded(true));
  }, []);

  // Função de logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLoggedIn(false);
      window.location.href = "/"; // Redireciona para home
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold transition-colors hover:text-primary">
          PCHubBR
        </Link>

        {/* Controles do lado direito */}
        <div className="flex items-center gap-3">
          {/* Toggle de tema (Dark/Light) */}
          <ThemeToggle />

          {/* Menu de usuário ou botões de autenticação */}
          {!sessionLoaded ? (
            // Enquanto carrega, não mostra nada (evita flash de conteúdo)
            <div className="h-9 w-24" />
          ) : loggedIn ? (
            // USUÁRIO LOGADO: Dropdown com opções
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Menu do usuário">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Meu Perfil
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // VISITANTE: Botões de Login e Cadastro
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Criar conta</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}