import type { Metadata } from "next";
import { Sidebar, Topbar } from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnboardIA | Copiloto de Onboarding",
  description: "Copiloto inteligente para operações de onboarding e sucesso do cliente.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="main-area">
            <Topbar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
