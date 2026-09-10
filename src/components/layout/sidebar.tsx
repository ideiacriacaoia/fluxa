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
  Users,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Scissors,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Receipt,
  Palette,
  ClipboardCheck,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
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
      { name: "Cotações & Comparativo", href: "/compras/cotacoes", icon: FileText },
      { name: "Recebimento & Lotes", href: "/compras/recebimento", icon: PackagePlus },
      { name: "Central Fiscal / NF-e", href: "/compras/fiscal", icon: Receipt },
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
      { name: "Personalização / OS", href: "/producao/personalizacao", icon: Palette },
    ],
  },
  {
    category: "Cadastros Base",
    items: [
      { name: "Controle de Pendências", href: "/cadastros/pendencias", icon: ClipboardCheck },
      { name: "Fornecedores & Facções", href: "/cadastros/fornecedores", icon: Building2 },
      { name: "Catálogo de Insumos", href: "/cadastros/insumos", icon: Tags },
      { name: "Depósitos", href: "/cadastros/depositos", icon: Warehouse },
      { name: "Usuários & Acessos", href: "/cadastros/usuarios", icon: Users },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarRecolhida, toggleSidebarRecolhida } = useTextilStore();

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-text flex flex-col h-screen border-r border-border-main flex-shrink-0 select-none transition-all duration-300 ease-in-out relative z-30",
        sidebarRecolhida ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between min-h-[65px]">
        <div className={cn("flex items-center gap-3", sidebarRecolhida && "justify-center w-full")}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20 flex-shrink-0">
            FT
          </div>

          {!sidebarRecolhida && (
            <div className="overflow-hidden transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-wide text-base whitespace-nowrap">
                  Fluxa Têxtil
                </span>
                <span className="bg-sky-500/20 text-sky-400 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-sky-500/30">
                  ERP
                </span>
              </div>
              <p className="text-xs text-text-dim truncate">Indústria & Confecção</p>
            </div>
          )}
        </div>

        {!sidebarRecolhida && (
          <button
            onClick={toggleSidebarRecolhida}
            title="Recolher Menu Lateral"
            className="p-1.5 rounded-lg text-text-dim hover:text-white hover:bg-sidebar-hover transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Botão de Expansão quando Recolhida */}
      {sidebarRecolhida && (
        <div className="px-3 pt-2 pb-1 flex justify-center">
          <button
            onClick={toggleSidebarRecolhida}
            title="Expandir Menu Lateral"
            className="p-2 rounded-lg text-text-dim hover:text-white hover:bg-sidebar-hover transition-colors w-full flex justify-center"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navigation.map((group) => (
          <div key={group.category} className="space-y-1">
            {!sidebarRecolhida ? (
              <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-dim">
                {group.category}
              </div>
            ) : (
              <div className="my-2 border-t border-border-subtle/50" />
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-xl text-xs font-medium transition-all duration-150",
                        sidebarRecolhida
                          ? "justify-center p-2.5"
                          : "justify-between px-3 py-2",
                        isActive
                          ? "bg-sidebar-active text-white shadow-sm font-semibold"
                          : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0 transition-colors",
                            isActive
                              ? "text-white"
                              : "text-text-dim group-hover:text-brand-primary"
                          )}
                        />
                        {!sidebarRecolhida && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>

                      {!sidebarRecolhida && isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
                      )}
                    </Link>

                    {/* Tooltip com Delay Inteligente quando Recolhida */}
                    {sidebarRecolhida && (
                      <div className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 delay-200 absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50">
                        <div className="bg-tooltip-bg text-tooltip-text border border-tooltip-border px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xl whitespace-nowrap flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info / Tenant badge */}
      <div className="p-3 border-t border-border-subtle bg-sidebar/50 text-xs">
        {!sidebarRecolhida ? (
          <div>
            <div className="flex items-center justify-between text-text-dim mb-1">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3 h-3 text-brand-primary" />
                Empresa Ativa
              </span>
              <span className="text-[10px] bg-status-success/20 text-status-success px-1.5 py-0.2 rounded font-mono font-semibold">
                ONLINE
              </span>
            </div>
            <p className="font-semibold text-white truncate">Fluxa Têxtil Santa Catarina</p>
            <p className="text-[11px] text-text-dim truncate">CNPJ: 12.345.678/0001-90</p>
          </div>
        ) : (
          <div className="flex justify-center group relative">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
            <div className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-3 bottom-0 bg-tooltip-bg text-tooltip-text border border-tooltip-border px-2.5 py-1 rounded text-[11px] whitespace-nowrap shadow-xl">
              Fluxa Têxtil (ONLINE)
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
