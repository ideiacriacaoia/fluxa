"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Scissors,
  FileText,
  Receipt,
  Palette,
  ClipboardCheck,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavGroup {
  name: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    description?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    name: "Compras & Insumos",
    items: [
      { name: "Pedidos de Compra", href: "/compras", icon: ShoppingCart, description: "Ordens e acompanhamento" },
      { name: "Cotações & Comparativo", href: "/compras/cotacoes", icon: FileText, description: "Propostas multi-fornecedor" },
      { name: "Recebimento & Lotes", href: "/compras/recebimento", icon: PackagePlus, description: "Triagem física e conferência" },
      { name: "Central Fiscal / NF-e", href: "/compras/fiscal", icon: Receipt, description: "Sefaz e CNPJ Alfanumérico" },
    ],
  },
  {
    name: "Estoque & Almoxarifado",
    items: [
      { name: "Saldos & Depósitos", href: "/estoque", icon: Boxes, description: "Multi-depósitos e inventário" },
      { name: "Estoque de Retalhos", href: "/estoque/retalhos", icon: Scissors, description: "Sobras de corte e pesagem" },
      { name: "Rastreio de Lotes", href: "/estoque/lotes", icon: QrCode, description: "QR Code e genealogia de lote" },
      { name: "Auditoria / Ledger", href: "/estoque/movimentacoes", icon: History, description: "Kardex e rastreamento imutável" },
    ],
  },
  {
    name: "Engenharia de Produto",
    items: [
      { name: "Produtos & Grades", href: "/produtos", icon: Shirt, description: "Modelos, cores e variações" },
      { name: "Ficha Técnica", href: "/produtos/ficha-tecnica", icon: FileSpreadsheet, description: "Consumo de malha e aviamentos" },
    ],
  },
  {
    name: "PCP & Produção",
    items: [
      { name: "Ordens de Produção", href: "/producao", icon: Factory, description: "Planejamento e Chão de Fábrica" },
      { name: "Personalização / OS", href: "/producao/personalizacao", icon: Palette, description: "Peça pronta, bordado e tags" },
    ],
  },
  {
    name: "Cadastros Base",
    items: [
      { name: "Controle de Pendências", href: "/cadastros/pendencias", icon: ClipboardCheck, description: "Tarefas, prazos e auditoria" },
      { name: "Fornecedores & Facções", href: "/cadastros/fornecedores", icon: Building2, description: "Parceiros e terceirizados" },
      { name: "Catálogo de Insumos", href: "/cadastros/insumos", icon: Tags, description: "Fios, tecidos e aviamentos" },
      { name: "Depósitos", href: "/cadastros/depositos", icon: Warehouse, description: "Locais de estocagem física" },
      { name: "Usuários & Acessos", href: "/cadastros/usuarios", icon: Users, description: "Matriz granular e papéis" },
    ],
  },
];

export function NavbarHorizontal() {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      ref={containerRef}
      className="bg-sidebar text-sidebar-text border-b border-border-main px-6 py-2 flex items-center gap-1 relative z-30 transition-colors shadow-xs"
    >
      {/* Link Dashboard Direto */}
      <Link
        href="/"
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
          pathname === "/"
            ? "bg-sidebar-active text-white"
            : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
        )}
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </Link>

      {/* Menus Dropdown das Categorias */}
      {navGroups.map((group) => {
        const isGroupActive = group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
        const isOpen = activeDropdown === group.name;

        return (
          <div key={group.name} className="relative">
            <button
              onClick={() => setActiveDropdown(isOpen ? null : group.name)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none",
                isGroupActive
                  ? "bg-sidebar-active/20 text-white font-semibold border border-brand-primary/30"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-white",
                isOpen && "bg-sidebar-hover text-white"
              )}
            >
              <span>{group.name}</span>
              <ChevronDown
                className={cn("w-3 h-3 text-text-dim transition-transform duration-200", isOpen && "rotate-180")}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-surface border border-border-main rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-2.5 py-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-text-dim">
                  {group.name}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className={cn(
                          "flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors group",
                          isActive
                            ? "bg-brand-primary/10 text-brand-primary font-semibold border border-brand-primary/30"
                            : "text-text-main hover:bg-surface-hover"
                        )}
                      >
                        <div
                          className={cn(
                            "p-1.5 rounded-md mt-0.5 transition-colors",
                            isActive
                              ? "bg-brand-primary text-brand-foreground"
                              : "bg-surface-hover text-text-muted group-hover:text-brand-primary group-hover:bg-brand-primary/10"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        </div>
                        <div>
                          <p className="font-semibold leading-tight text-text-main group-hover:text-brand-primary">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-[10px] text-text-muted leading-tight mt-0.5 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
