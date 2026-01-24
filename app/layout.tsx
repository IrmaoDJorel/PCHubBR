import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";

export const metadata = {
  title: "PCHubBR - Comparador de Preços de Hardware",
  description: "Compare preços de CPUs, GPUs e Placas-Mãe nas melhores lojas do Brasil. Crie alertas de preço e economize na montagem do seu PC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          {/* Header com logo, tema e menu de usuário */}
          <Header />

          {/* Barra de categorias */}
          <CategoryNav />

          {/* Conteúdo principal das páginas */}
          <main className="mx-auto max-w-5xl p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}