"use client";

import React from "react";
import Link from "next/link";
import {
  Boxes,
  Factory,
  PackagePlus,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  Shirt,
  ArrowUpRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Scissors,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatNumber, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { saldos, ordensProducao, lotes, retalhos, pedidosCompra, produtos } = useTextilStore();

  // Cálculos de Indicadores
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

  const totalPecasCortadas = ordensProducao.reduce(
    (acc, curr) => acc + (curr.quantidade_cortada || 0),
    0
  );

  const opsAtivas = ordensProducao.filter(
    (op) => op.status !== "finalizada" && op.status !== "cancelada"
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-sky-500/20 text-sky-400 text-xs font-semibold px-2 py-0.5 rounded border border-sky-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Painel Operacional Têxtil
              </span>
              <span className="text-slate-400 text-xs">• Coleção Verão 2026/2027</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Controle Geral de Produção & Estoque
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              Rastreabilidade do lote de compra até a peça final por grade, sem planilhas paralelas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/estoque/retalhos"
              className="px-3.5 py-2 bg-amber-600/90 hover:bg-amber-600 text-white font-medium text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              <Scissors className="w-3.5 h-3.5" />
              Retalhos ({formatNumber(totalKgRetalhos, 1)} kg)
            </Link>
            <Link
              href="/producao"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              <Factory className="w-4 h-4" />
              Abrir Nova OP
            </Link>
            <Link
              href="/compras/recebimento"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-medium text-xs rounded-lg transition-all flex items-center gap-1.5"
            >
              <PackagePlus className="w-4 h-4 text-sky-400" />
              Conferir Lote / NF
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tecido em Estoque */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tecidos em Estoque (MP)
            </span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {formatNumber(totalKgTecidoEstoque, 1)}
              </span>
              <span className="text-xs font-medium text-slate-500">kg disponíveis</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Valor estimado: <strong className="text-slate-700">{formatBRL(totalValorLotesEstoque)}</strong>
            </p>
          </div>
        </div>

        {/* Card 2: OPs Ativas em Chão */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Ordens de Produção Ativas
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{opsAtivas.length}</span>
              <span className="text-xs font-medium text-slate-500">OPs em andamento</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total programado: <strong className="text-slate-700">{totalPecasPlanejadas} peças</strong>
            </p>
          </div>
        </div>

        {/* Card 3: Eficiência de Produção / Corte */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Peças Cortadas x Prontas
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalPecasProduzidas}</span>
              <span className="text-xs font-medium text-slate-500">/ {totalPecasCortadas} cortadas</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{
                  width: `${totalPecasCortadas > 0 ? (totalPecasProduzidas / totalPecasCortadas) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 4: Modelos Cadastrados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Catálogo de Produtos
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{produtos.length}</span>
              <span className="text-xs font-medium text-slate-500">modelos com grade</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Fichas Técnicas versionadas e ativas
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: OPs em Andamento e Rastreabilidade de Lotes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ordens de Produção em Destaque */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Factory className="w-4 h-4 text-sky-600" />
                Ordens de Produção no Chão de Fábrica
              </h2>
              <p className="text-xs text-slate-500">Acompanhe o estágio de corte, costura e finalização</p>
            </div>
            <Link
              href="/producao"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Ver Kanban Completo
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {ordensProducao.map((op) => {
              const statusColors: Record<string, { bg: string; text: string; label: string }> = {
                planejada: { bg: "bg-slate-100", text: "text-slate-700", label: "Planejada" },
                em_corte: { bg: "bg-amber-100", text: "text-amber-800", label: "Em Corte / Enfesto" },
                em_costura: { bg: "bg-blue-100", text: "text-blue-800", label: "Em Costura / Facção" },
                em_acabamento: { bg: "bg-purple-100", text: "text-purple-800", label: "Acabamento & Embalagem" },
                finalizada: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Finalizada" },
              };
              const statusInfo = statusColors[op.status] || statusColors.planejada;
              const progresso = Math.round(
                ((op.quantidade_produzida || 0) / (op.quantidade_planejada || 1)) * 100
              );

              return (
                <div
                  key={op.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        OP #{op.numero_op}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{op.produto_nome}</p>
                    <p className="text-[11px] text-slate-500">
                      Ref: <strong className="text-slate-600">{op.produto_referencia}</strong> • Entrega:{" "}
                      {formatDate(op.data_fim_prevista || "")}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 min-w-[240px]">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Progresso</span>
                        <span className="font-bold text-slate-800">
                          {op.quantidade_produzida} / {op.quantidade_planejada} pçs ({progresso}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-sky-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progresso}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      href={`/producao`}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Apontar
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Lotes de Matéria-Prima & Rastreabilidade */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-sky-600" />
                Lotes de Tecido Ativos
              </h2>
              <p className="text-xs text-slate-500">NF de Entrada e Rendimento Real</p>
            </div>
            <Link
              href="/estoque/lotes"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Ver Todos
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {lotes.slice(0, 4).map((lote) => (
              <div
                key={lote.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {lote.codigo_lote}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {lote.nota_fiscal}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800 truncate">{lote.item_descricao}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                      style={{ backgroundColor: lote.cor_codigo || "#ccc" }}
                    ></span>
                    <span>{lote.cor_nome}</span>
                    <span>• Fornecedor: {lote.fornecedor_nome}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">
                    Largura: <strong>{lote.largura_real_m}m</strong> | Gramatura:{" "}
                    <strong>{lote.gramatura_real}g/m²</strong>
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatNumber(lote.quantidade_atual || 0, 1)} {lote.unidade_medida}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/compras/recebimento"
            className="w-full block text-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            + Registrar Novo Recebimento de Lote
          </Link>
        </div>
      </div>
    </div>
  );
}
