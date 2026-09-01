import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TextilStoreProvider } from "@/lib/store/textil-store";

export const metadata: Metadata = {
  title: "Fluxa Têxtil — ERP para Indústria Têxtil e Confecção",
  description: "Do fio ao produto acabado, sem planilha paralela. ERP Cloud-native vertical para confecções.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="padrao">
      <body className="antialiased bg-background text-foreground flex h-screen overflow-hidden">
        <TextilStoreProvider>
          {/* Sidebar Retrátil */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 bg-background">
              {children}
            </main>
          </div>
        </TextilStoreProvider>
      </body>
    </html>
  );
}
