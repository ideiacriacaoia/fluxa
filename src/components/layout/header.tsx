"use client";

import React from "react";
import { Bell, Search, UserCheck, Sparkles, Building2, HelpCircle } from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";

export function Header() {
  const { empresa, usuarios, saldos, ordensProducao } = useTextilStore();
  const opsEmProducao = ordensProducao.filter((op) => op.status !== "finalizada" && op.status !== "cancelada").length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Search and context */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar OP, Lote de tecido, NF, SKU..."
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Right KPIs & User Profile */}
      <div className="flex items-center gap-4">
        {/* Quick status indicators */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-slate-600 font-medium">OPs em Chão:</span>
            <span className="font-bold text-blue-700">{opsEmProducao}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Saldos Ativos:</span>
            <span className="font-bold text-emerald-700">{saldos.length} lotes/itens</span>
          </div>
        </div>

        {/* Notifications & Help */}
        <button
          title="Notificações"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs border border-sky-200">
            JM
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {usuarios[0]?.nome || "João Marcos"}
            </p>
            <p className="text-[10px] text-slate-500">Diretor de Produção</p>
          </div>
        </div>
      </div>
    </header>
  );
}
