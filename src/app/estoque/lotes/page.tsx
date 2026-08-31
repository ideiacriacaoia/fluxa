"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Search,
  Filter,
  Layers,
  FileText,
  Calendar,
  Building2,
  Boxes,
  Factory,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import {
  calcularRendimentoTecido,
  converterKgParaMetros,
  formatBRL,
  formatDate,
  formatNumber,
} from "@/lib/utils";

export default function RastreioLotesPage() {
  const { lotes, ordensProducao } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [loteSelecionado, setLoteSelecionado] = useState<any>(null);

  const lotesFiltrados = lotes.filter((l) => {
    return (
      l.codigo_lote.toLowerCase().includes(busca.toLowerCase()) ||
      (l.item_descricao && l.item_descricao.toLowerCase().includes(busca.toLowerCase())) ||
      (l.nota_fiscal && l.nota_fiscal.toLowerCase().includes(busca.toLowerCase())) ||
      (l.fornecedor_nome && l.fornecedor_nome.toLowerCase().includes(busca.toLowerCase())) ||
      (l.cor_nome && l.cor_nome.toLowerCase().includes(busca.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-600" />
            Rastreabilidade de Lotes Têxteis
          </h1>
          <p className="text-xs text-slate-500">
            Acompanhe o histórico completo de cada lote: NF de entrada, largura/rendimento real e OPs que consumiram o tecido.
          </p>
        </div>

        <Link
          href="/compras/recebimento"
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          + Novo Recebimento de Lote
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código de lote (ex: LT-2026-MALHA-PT-01), NF, fornecedor, cor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lotesFiltrados.map((lote) => {
          const rendimento =
            lote.gramatura_real && lote.largura_real_m
              ? calcularRendimentoTecido(lote.gramatura_real, lote.largura_real_m)
              : 0;

          const metrosAtuais =
            rendimento > 0 && lote.quantidade_atual
              ? converterKgParaMetros(lote.quantidade_atual, rendimento)
              : 0;

          // Procurar OPs que consumiram este lote
          const opsVinculadas = ordensProducao.filter((op) =>
            op.consumos?.some((c) => c.lote_id === lote.id || c.codigo_lote === lote.codigo_lote)
          );

          const qtdTotalLote = lote.quantidade_inicial || lote.quantidade_recebida || 1;
          const percentualRestante = Math.round(
            ((lote.quantidade_atual || 0) / qtdTotalLote) * 100
          );

          return (
            <div
              key={lote.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    {lote.codigo_lote}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {lote.nota_fiscal}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-slate-900 leading-snug">
                    {lote.item_descricao}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                      style={{ backgroundColor: lote.cor_codigo || "#666" }}
                    ></span>
                    <strong className="text-slate-700">{lote.cor_nome || lote.cor || "Cor Padrão"}</strong>
                    <span>• {lote.fornecedor_nome}</span>
                  </div>
                </div>

                {/* Technical specs */}
                {lote.largura_real_m && lote.gramatura_real && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Largura Medida:</span>
                      <strong className="text-slate-800">{lote.largura_real_m} m</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gramatura Real:</span>
                      <strong className="text-slate-800">{lote.gramatura_real} g/m²</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rendimento Real:</span>
                      <strong className="text-sky-700 font-bold">{formatNumber(rendimento, 3)} m/kg</strong>
                    </div>
                  </div>
                )}

                {/* Balance and Progress */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Saldo Atual:</span>
                    <span className="font-bold text-slate-900">
                      {formatNumber(lote.quantidade_atual || 0, 1)} / {formatNumber(qtdTotalLote, 1)}{" "}
                      {lote.unidade_medida || lote.unidade || "kg"}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        percentualRestante > 50
                          ? "bg-emerald-500"
                          : percentualRestante > 20
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${percentualRestante}%` }}
                    ></div>
                  </div>

                  {metrosAtuais > 0 && (
                    <p className="text-[11px] text-slate-400 text-right">
                      ≈ {formatNumber(metrosAtuais, 1)} metros lineares disponíveis
                    </p>
                  )}
                </div>
              </div>

              {/* Footer OPs link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {opsVinculadas.length > 0 ? (
                    <strong className="text-indigo-600">{opsVinculadas.length} OP(s) vinculada(s)</strong>
                  ) : (
                    "Lote íntegro / sem corte"
                  )}
                </span>

                <button
                  onClick={() => setLoteSelecionado(lote)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  Ver Rastreio
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Árvore de Rastreabilidade Ponta a Ponta */}
      {loteSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Rastreabilidade Ponta a Ponta do Lote {loteSelecionado.codigo_lote}
                </h2>
              </div>
              <button
                onClick={() => setLoteSelecionado(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Trace Tree Steps */}
            <div className="space-y-4 text-xs">
              {/* Step 1: Compra e Entrada */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-sky-700">
                    <Building2 className="w-4 h-4" /> 1. Origem de Compra & NF de Entrada
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Recebido em {formatDate(loteSelecionado.data_recebimento)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Fornecedor:</span>
                    <strong className="text-slate-800">{loteSelecionado.fornecedor_nome}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nota Fiscal:</span>
                    <strong className="text-slate-800">{loteSelecionado.nota_fiscal}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lote Fornecedor:</span>
                    <strong className="text-slate-800">{loteSelecionado.lote_fornecedor || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Qtd Recebida:</span>
                    <strong className="text-slate-800">
                      {loteSelecionado.quantidade_inicial} {loteSelecionado.unidade_medida}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Custo Unitário:</span>
                    <strong className="text-slate-800">{formatBRL(loteSelecionado.custo_unitario)}</strong>
                  </div>
                </div>
              </div>

              {/* Step 2: Parâmetros Têxteis */}
              <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2">
                <div className="font-bold text-sky-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" /> 2. Especificação Técnica & Rendimento
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Cor / Tonalidade:</span>
                    <strong className="text-slate-800">{loteSelecionado.cor_nome}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Largura Medida:</span>
                    <strong className="text-slate-800">{loteSelecionado.largura_real_m || "-"} m</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gramatura Real:</span>
                    <strong className="text-slate-800">{loteSelecionado.gramatura_real || "-"} g/m²</strong>
                  </div>
                </div>
              </div>

              {/* Step 3: Ordens de Produção que consumiram este lote */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-indigo-600" /> 3. Consumo em Ordens de Produção (PCP)
                </div>

                {ordensProducao
                  .filter((op) =>
                    op.consumos?.some(
                      (c) => c.lote_id === loteSelecionado.id || c.codigo_lote === loteSelecionado.codigo_lote
                    )
                  )
                  .map((op) => {
                    const consumo = op.consumos?.find(
                      (c) => c.lote_id === loteSelecionado.id || c.codigo_lote === loteSelecionado.codigo_lote
                    );
                    return (
                      <div
                        key={op.id}
                        className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-900">OP #{op.numero_op}</strong> - {op.produto_nome}
                          <p className="text-[11px] text-slate-500">
                            Ref: {op.produto_referencia} • Quantidade: {op.quantidade_planejada} peças
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-indigo-600">
                            {consumo?.quantidade_consumida} {consumo?.unidade_medida || "kg"} consumidos
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {formatDate(consumo?.data_consumo || "")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setLoteSelecionado(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
