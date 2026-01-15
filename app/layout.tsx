import "./globals.css";
import Link from "next/link";
import { Providers } from "./providers";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "PCHubBR",
  description: "Comparador de preços de hardware (MVP)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          <header className="border-b">
            <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
              <Link href="/" className="font-semibold">
                PCHubBR
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
            <Separator />
          </header>

          <div className="mx-auto max-w-5xl p-6">{children}</div>
        </Providers>
      </body>
    </html>
  );
}