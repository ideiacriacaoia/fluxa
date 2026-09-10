"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { NavbarHorizontal } from "@/components/layout/navbar-horizontal";
import { Header } from "@/components/layout/header";
import { useTextilStore } from "@/lib/store/textil-store";

export function LayoutContainer({ children }: { children: React.ReactNode }) {
  const { posicaoMenu } = useTextilStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar (Modo Menu Lateral) */}
      {posicaoMenu === "lateral" && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        {/* Navbar Horizontal (Modo Menu Superior) */}
        {posicaoMenu === "superior" && <NavbarHorizontal />}

        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
