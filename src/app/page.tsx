"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Factory,
  PackagePlus,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  Shirt,
  ArrowUpRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Scissors,
  Briefcase,
  FileText,
  Truck,
  ChevronRight,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatNumber, formatDate, cn } from "@/lib/utils";
import { KpisEstrategicosCompras } from "@/components/compras/kpis-estrategicos-compras";
import { KpisComercial } from "@/components/dashboard/kpis-comercial";
import { KpisProducao } from "@/components/dashboard/kpis-producao";

// ==============================================================================
// ESTRUTURA EXTENSÍVEL DE SUB-ABAS DO DASHBOARD POR SETOR
// ==============================================================================
export type SetorDashboard = "compras" | "comercial" | "producao";

interface SetorTabConfig {
  id: SetorDashboard;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: string;
}

const SETORES_DASHBOARD: SetorTabConfig[] = [
  {
    id: "compras",
    label: "Compras & Suprimentos",
    sublabel: "Giro, Saving, Dependência e TCO",
    icon: ShoppingCart,
  },
  {
    id: "comercial",
    label: "Comercial & Vendas",
    sublabel: "Faturamento, Ticket Médio e Conversão",
    icon: DollarSign,
  },
  {
    id: "producao",
    label: "Produção & Módulos",
    sublabel: "Aderência, Tempo de Ciclo e Qualidade",
    icon: Factory,
  },
];

export default function DashboardPage() {
  const [setorAtivo, setSetorAtivo] = useState<SetorDashboard>("compras");

  const {
    saldos,
    ordensProducao,
    lotes,
    retalhos,
    pedidosCompra,
    produtos,
    ordensPersonalizacao,
  } = useTextilStore();

  // Cálculos Consolidados de Cabeçalho
  const totalKgTecidoEstoque = saldos
    .filter((s) => s.unidade_medida === "kg")
    .reduce((acc, curr) => acc + (curr.quantidade_atual || 0), 0);

  const totalKgRetalhos = retalhos
    .filter((r) => r.status === "disponivel" || (r.disponivel && !r.status))
    .reduce((acc, curr) => acc + (curr.peso_residual_kg || curr.metragem || 0), 0);

  const totalValorLotesEstoque = lotes.reduce(
    (acc, curr) => acc + (curr.quantidade_atual || 0) * (curr.custo_unitario || 0),
    0
  );

  const totalPecasPlanejadas = ordensProducao.reduce(
    (acc, curr) => acc + (curr.quantidade_planejada || 0),
    0
  );

  const totalPecasProduzidas = ordensProducao.reduce(
    (acc, curr) => acc + (curr.quantidade_produzida || 0),
    0
  );

  const opsAtivas = ordensProducao.filter(
    (op) => op.status !== "finalizada" && op.status !== "cancelada"
  );

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* HEADER BANNER EXECUTIVO */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-surface-elevated via-surface to-surface-elevated rounded-2xl p-6 text-text-main shadow-sm relative overflow-hidden border border-border-main">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-brand-primary/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Painel Executivo Têxtil
              </span>
              <span className="text-text-muted text-xs">• Gestão Integrada por Setores</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Dashboard Estratégico & Operacional
            </h1>
            <p className="text-text-muted text-xs mt-1">
              Métricas executivas em tempo real com rastreabilidade de compras, comercial e chão de fábrica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/estoque/retalhos"
              className="px-3.5 py-2 bg-accent-gold/15 hover:bg-accent-gold/25 text-accent-gold border border-accent-gold/30 font-medium text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Scissors className="w-3.5 h-3.5" />
              Retalhos ({formatNumber(totalKgRetalhos, 1)} kg)
            </Link>
            <Link
              href="/producao"
              className="px-3.5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Factory className="w-3.5 h-3.5" />
              Nova OP
            </Link>
            <Link
              href="/compras/recebimento"
              className="px-3.5 py-2 bg-surface hover:bg-surface-hover text-text-main border border-border-main font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <PackagePlus className="w-3.5 h-3.5 text-brand-primary" />
              Conferir Lote / NF
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MENU DE SUB-ABAS HORIZONTAL POR SETOR (EXTENSÍVEL) */}
      {/* ==================================================================== */}
      <div className="bg-surface rounded-2xl border border-border-main p-2 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SETORES_DASHBOARD.map((setor) => {
            const Icon = setor.icon;
            const isAtivo = setorAtivo === setor.id;

            return (
              <button
                key={setor.id}
                onClick={() => setSetorAtivo(setor.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl text-left transition-all relative overflow-hidden cursor-pointer",
                  isAtivo
                    ? "bg-brand-primary text-white shadow-md font-semibold"
                    : "bg-surface-hover/60 hover:bg-surface-hover text-text-muted hover:text-text-main"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    isAtivo
                      ? "bg-white/20 text-white"
                      : "bg-surface border border-border-main text-text-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate block">{setor.label}</span>
                    {isAtivo && (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] truncate block mt-0.5",
                      isAtivo ? "text-white/80" : "text-text-dim"
                    )}
                  >
                    {setor.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CONTEÚDO ESPECÍFICO DO SETOR SELECIONADO */}
      {/* ==================================================================== */}
      <div className="transition-all duration-200">
        {setorAtivo === "compras" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <KpisEstrategicosCompras />

            {/* Ações Rápidas & Pedidos Recentes de Compras */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-main p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-main/50">
                  <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-brand-primary" />
                    Últimos Pedidos de Compra (Tecidos & Aviamentos)
                  </h3>
                  <Link
                    href="/compras/pedidos"
                    className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                  >
                    Ver Todos
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {pedidosCompra.slice(0, 3).map((pc) => (
                    <div
                      key={pc.id}
                      className="p-3 bg-surface-hover/70 rounded-xl border border-border-subtle flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-main">
                            Pedido #{pc.numero_pedido}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-primary/10 text-brand-primary">
                            {pc.status}
                          </span>
                        </div>
                        <p className="text-text-dim text-[11px]">
                          {pc.fornecedor_nome} • Emissão: {formatDate(pc.data_emissao || "")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-text-main block">
                          {formatBRL(pc.valor_total || 0)}
                        </span>
                        <span className="text-[10px] text-text-dim">
                          {pc.itens?.length || 0} itens
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rastreabilidade de Estoque */}
              <div className="bg-surface rounded-2xl border border-border-main p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border-main/50">
                    <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-accent-teal" />
                      Posição de Estoque MP
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-surface-hover/70 rounded-xl border border-border-subtle flex justify-between items-center">
                      <span className="text-xs text-text-muted">Tecidos em Rolo:</span>
                      <strong className="text-xs font-mono text-text-main">
                        {formatNumber(totalKgTecidoEstoque, 1)} kg
                      </strong>
                    </div>
                    <div className="p-3 bg-surface-hover/70 rounded-xl border border-border-subtle flex justify-between items-center">
                      <span className="text-xs text-text-muted">Valor em Lotes:</span>
                      <strong className="text-xs font-mono text-emerald-400">
                        {formatBRL(totalValorLotesEstoque)}
                      </strong>
                    </div>
                  </div>
                </div>

                <Link
                  href="/compras/cotacoes"
                  className="w-full text-center py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-xl text-xs font-semibold transition-colors mt-2"
                >
                  + Abrir Nova Cotação Multi-Fornecedor
                </Link>
              </div>
            </div>
          </div>
        )}

        {setorAtivo === "comercial" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <KpisComercial />

            {/* Ações Rápidas & Ordens de Personalização Recentes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-main p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-main/50">
                  <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-accent-gold" />
                    Ordens de Serviço de Personalização Ativas
                  </h3>
                  <Link
                    href="/compras/personalizacao"
                    className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                  >
                    Ver Todas
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {ordensPersonalizacao.slice(0, 3).map((os) => (
                    <div
                      key={os.id}
                      className="p-3 bg-surface-hover/70 rounded-xl border border-border-subtle flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-main">
                            OS #{os.numero_os}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-gold/10 text-accent-gold">
                            {os.status}
                          </span>
                        </div>
                        <p className="text-text-dim text-[11px]">
                          Cliente: <strong>{os.cliente_nome}</strong> • {os.peca_base_nome}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-emerald-400 block">
                          {formatBRL(os.valor_total_os || 0)}
                        </span>
                        <span className="text-[10px] text-text-dim">
                          {os.quantidade_total_pecas} peças
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Atalho Comercial */}
              <div className="bg-surface rounded-2xl border border-border-main p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border-main/50">
                    <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-primary" />
                      Central de Vendas
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Crie orçamentos de personalização vinculados a cotações de tecidos com margem comercial garantida.
                  </p>
                </div>

                <Link
                  href="/compras/personalizacao"
                  className="w-full text-center py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-semibold transition-colors mt-2"
                >
                  + Nova OS de Personalização
                </Link>
              </div>
            </div>
          </div>
        )}

        {setorAtivo === "producao" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <KpisProducao />

            {/* Ações Rápidas & OPs em Chão de Fábrica */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-main p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-main/50">
                  <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                    <Factory className="w-4 h-4 text-brand-primary" />
                    Ordens de Produção no Chão de Fábrica
                  </h3>
                  <Link
                    href="/producao"
                    className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                  >
                    Ver Kanban
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {ordensProducao.slice(0, 3).map((op) => {
                    const progresso = Math.round(
                      ((op.quantidade_produzida || 0) / (op.quantidade_planejada || 1)) * 100
                    );
                    return (
                      <div
                        key={op.id}
                        className="p-3 bg-surface-hover/70 rounded-xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-main">
                              OP #{op.numero_op}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-primary/10 text-brand-primary">
                              {op.status}
                            </span>
                          </div>
                          <p className="text-text-dim text-[11px]">
                            {op.produto_nome} • Ref: {op.produto_referencia}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-bold font-mono text-text-main block">
                              {op.quantidade_produzida} / {op.quantidade_planejada} pçs
                            </span>
                            <span className="text-[10px] text-text-dim">{progresso}% pronto</span>
                          </div>
                          <Link
                            href="/producao"
                            className="px-3 py-1 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-lg text-xs font-semibold transition-colors"
                          >
                            Apontar
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Atalho PCP */}
              <div className="bg-surface rounded-2xl border border-border-main p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border-main/50">
                    <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                      <Layers className="w-4 h-4 text-accent-gold" />
                      Status do Chão de Fábrica
                    </h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-text-muted">
                      <span>OPs Ativas:</span>
                      <strong className="text-text-main">{opsAtivas.length} ordens</strong>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Total Programado:</span>
                      <strong className="text-text-main font-mono">
                        {totalPecasPlanejadas} peças
                      </strong>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Total Concluído:</span>
                      <strong className="text-emerald-400 font-mono">
                        {totalPecasProduzidas} peças
                      </strong>
                    </div>
                  </div>
                </div>

                <Link
                  href="/producao"
                  className="w-full text-center py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-semibold transition-colors mt-2"
                >
                  + Abrir Nova Ordem de Produção
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
