import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placas-Mãe - Comparador de Preços | PCHubBR",
  description:
    "Compare preços de placas-mãe para Intel e AMD nas melhores lojas do Brasil. Encontre chipsets B550, Z790, X670E e outras placas-mãe com os melhores descontos.",
  keywords: [
    "placa-mãe",
    "motherboard",
    "B550",
    "Z790",
    "X670E",
    "chipset",
    "AM4",
    "AM5",
    "LGA1700",
    "comparador de preços",
    "hardware",
  ],
  openGraph: {
    title: "Placas-Mãe - Comparador de Preços | PCHubBR",
    description:
      "Compare preços de placas-mãe para Intel e AMD nas melhores lojas do Brasil.",
    type: "website",
  },
};

export default function MotherboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}