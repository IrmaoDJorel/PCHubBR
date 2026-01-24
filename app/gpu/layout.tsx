import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placas de Vídeo (GPUs) - Comparador de Preços | PCHubBR",
  description:
    "Compare preços de GPUs NVIDIA, AMD e Intel nas melhores lojas do Brasil. Encontre RTX 4060, RX 7600 e outras placas de vídeo com os melhores descontos.",
  keywords: [
    "GPU",
    "placa de vídeo",
    "NVIDIA",
    "AMD",
    "RTX",
    "RX",
    "GeForce",
    "Radeon",
    "comparador de preços",
    "hardware",
  ],
  openGraph: {
    title: "Placas de Vídeo (GPUs) - Comparador de Preços | PCHubBR",
    description:
      "Compare preços de GPUs NVIDIA, AMD e Intel nas melhores lojas do Brasil.",
    type: "website",
  },
};

export default function GpuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}