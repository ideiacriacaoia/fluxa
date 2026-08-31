"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  PackagePlus,
  Boxes,
  QrCode,
  History,
  Shirt,
  FileSpreadsheet,
  Factory,
  Building2,
  Tags,
  Warehouse,
  ChevronRight,
  Sparkles,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    category: "Visão Geral",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    category: "Compras & Insumos",
    items: [
      { name: "Pedidos de Compra", href: "/compras", icon: ShoppingCart },
      { name: "Recebimento & Lotes", href: "/compras/recebimento", icon: PackagePlus },
    ],
  },
  {
    category: "Estoque & Almoxarifado",
    items: [
      { name: "Saldos & Depósitos", href: "/estoque", icon: Boxes },
      { name: "Estoque de Retalhos", href: "/estoque/retalhos", icon: Scissors },
      { name: "Rastreio de Lotes", href: "/estoque/lotes", icon: QrCode },
      { name: "Auditoria / Ledger", href: "/estoque/movimentacoes", icon: History },
    ],
  },
  {
    category: "Engenharia de Produto",
    items: [
      { name: "Produtos & Grades", href: "/produtos", icon: Shirt },
      { name: "Ficha Técnica", href: "/produtos/ficha-tecnica", icon: FileSpreadsheet },
    ],
  },
  {
    category: "PCP & Chão de Fábrica",
    items: [
      { name: "Ordens de Produção", href: "/producao", icon: Factory },
    ],
  },
  {
    category: "Cadastros Base",
    items: [
      { name: "Fornecedores & Facções", href: "/cadastros/fornecedores", icon: Building2 },
      { name: "Catálogo de Insumos", href: "/cadastros/insumos", icon: Tags },
      { name: "Depósitos", href: "/cadastros/depositos", icon: Warehouse },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar-bg text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
            FT
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-wide text-base">Fluxa Têxtil</span>
              <span className="bg-sky-500/20 text-sky-400 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-sky-500/30">
                ERP
              </span>
            </div>
            <p className="text-xs text-slate-400">Indústria & Confecção</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navigation.map((group) => (
          <div key={group.category}>
            <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.category}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group",
                      isActive
                        ? "bg-sky-600/90 text-white shadow-sm font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-sky-400")} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info / Tenant badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3 h-3 text-sky-400" />
            Empresa Ativa
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
            ONLINE
          </span>
        </div>
        <p className="font-semibold text-slate-200 truncate">Fluxa Têxtil Santa Catarina</p>
        <p className="text-[11px] text-slate-400 truncate">CNPJ: 12.345.678/0001-90</p>
      </div>
    </aside>
  );
}
