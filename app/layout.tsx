import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";

export const metadata = {
  title: "PCHubBR - Comparador de Preços de Hardware | Melhores Ofertas",
  description:
    "Encontre as melhores ofertas em CPUs, GPUs e Placas-Mãe. Compare preços em tempo real e economize na montagem do seu PC com descontos de até 35%!",
  keywords: [
    "hardware",
    "pc",
    "ofertas",
    "desconto",
    "comparador de preços",
    "cpu",
    "gpu",
    "placa mãe",
    "processador",
    "placa de vídeo",
    "ryzen",
    "intel",
    "nvidia",
    "amd",
    "kabum",
    "terabyte",
    "pichau",
  ],
  openGraph: {
    title: "PCHubBR - Comparador de Preços de Hardware",
    description:
      "Encontre as melhores ofertas em hardware. Compare preços e economize!",
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          {/* Header com logo, tema e menu de usuário */}
          <Header />

          {/* Barra de categorias */}
          <CategoryNav />

          {/* Conteúdo principal das páginas */}
          <main className="mx-auto max-w-5xl p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}