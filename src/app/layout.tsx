import type { Metadata } from "next";
import "./globals.css";
import { LayoutContainer } from "@/components/layout/layout-container";
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
      <body className="antialiased bg-background text-foreground overflow-hidden">
        <TextilStoreProvider>
          <LayoutContainer>{children}</LayoutContainer>
        </TextilStoreProvider>
      </body>
    </html>
  );
}
