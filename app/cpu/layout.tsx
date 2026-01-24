import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Processadores (CPUs) - Comparador de Preços | PCHubBR",
  description:
    "Compare preços de processadores Intel e AMD nas melhores lojas do Brasil. Encontre CPUs Ryzen, Core i5, i7, i9 com os melhores descontos.",
  keywords: [
    "CPU",
    "processador",
    "Intel",
    "AMD",
    "Ryzen",
    "Core i5",
    "Core i7",
    "comparador de preços",
    "hardware",
  ],
  openGraph: {
    title: "Processadores (CPUs) - Comparador de Preços | PCHubBR",
    description:
      "Compare preços de processadores Intel e AMD nas melhores lojas do Brasil.",
    type: "website",
  },
};

export default function CpuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}