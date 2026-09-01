"use client";

import React from "react";
import { Bell, Search, UserCheck, Sparkles, Building2, HelpCircle } from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { ThemeSelector } from "@/components/layout/theme-selector";

export function Header() {
  const { empresa, usuarios, usuarioLogado, saldos, ordensProducao } = useTextilStore();
  const opsEmProducao = ordensProducao.filter((op) => op.status !== "finalizada" && op.status !== "cancelada").length;

  return (
    <header className="h-16 bg-header border-b border-border-main px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs transition-colors">
      {/* Search and context */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar OP, Lote de tecido, NF, SKU..."
            className="w-full bg-surface border border-border-main text-xs rounded-lg pl-9 pr-4 py-2 text-text-main placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Right KPIs, Theme Selector & User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick status indicators */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border-main rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
            <span className="text-text-muted font-medium">OPs em Chão:</span>
            <span className="font-bold text-text-main">{opsEmProducao}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border-main rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-status-success"></span>
            <span className="text-text-muted font-medium">Saldos Ativos:</span>
            <span className="font-bold text-text-main">{saldos.length} lotes</span>
          </div>
        </div>

        {/* Seletor de Temas */}
        <ThemeSelector />

        {/* Notificações */}
        <button
          title="Notificações"
          className="p-2 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors relative border border-border-main bg-surface shadow-xs"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full ring-2 ring-surface"></span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border-main">
          <div className="w-8 h-8 rounded-full bg-brand-primary/15 text-brand-primary flex items-center justify-center font-bold text-xs border border-brand-primary/30">
            {usuarioLogado.nome
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-text-main leading-tight">
              {usuarioLogado.nome}
            </p>
            <p className="text-[10px] text-text-muted">{usuarioLogado.papel_nome || usuarioLogado.cargo}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
