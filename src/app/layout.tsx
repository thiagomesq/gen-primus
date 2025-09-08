import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  title: "Genealogia Primus",
  description: "Árvore genealógica dos Primus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body cz-shortcut-listen="true">
        <Providers>
          <Header />
          <Toaster />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
