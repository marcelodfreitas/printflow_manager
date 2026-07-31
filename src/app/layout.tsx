import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "PrintFlow Manager - Gerenciamento de Impressão 3D",
  description: "Sistema de gerenciamento para serviços de impressão 3D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={ubuntu.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
