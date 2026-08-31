"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Boxes,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function MovimentacoesEstoquePage() {
  const { movimentacoes, depositos } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const movimentacoesFiltradas = movimentacoes.filter((m) => {
    const matchBusca =
      (m.item_descricao && m.item_descricao.toLowerCase().includes(busca.toLowerCase())) ||
      (m.codigo_lote && m.codigo_lote.toLowerCase().includes(busca.toLowerCase())) ||
      (m.motivo_ajuste && m.motivo_ajuste.toLowerCase().includes(busca.toLowerCase())) ||
      (m.usuario_nome && m.usuario_nome.toLowerCase().includes(busca.toLowerCase()));
    const matchTipo = filtroTipo === "todos" || m.tipo_movimento === filtroTipo;
    return matchBusca && matchTipo;
  });

  const getTipoBadge = (tipo: string) => {
    const config: Record<string, { label: string; bg: string; text: string; icon: any }> = {
      entrada_compra: { label: "Entrada por Compra", bg: "bg-emerald-50", text: "text-emerald-700", icon: ArrowUpRight },
      saida_corte_op: { label: "Consumo Corte OP", bg: "bg-amber-50", text: "text-amber-700", icon: ArrowDownRight },
      retorno_sobra_op: { label: "Retorno de Sobra", bg: "bg-blue-50", text: "text-blue-700", icon: RefreshCw },
      ajuste_inventario: { label: "Ajuste de Inventário", bg: "bg-purple-50", text: "text-purple-700", icon: FileText },
      entrada_producao_pa: { label: "Entrada Produto Acabado", bg: "bg-teal-50", text: "text-teal-700", icon: ArrowUpRight },
      saida_venda: { label: "Saída por Venda", bg: "bg-rose-50", text: "text-rose-700", icon: ArrowDownRight },
    };
    const c = config[tipo] || { label: tipo, bg: "bg-slate-100", text: "text-slate-700", icon: FileText };
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Auditoria de Estoque (Ledger de Movimentações)
          </h1>
          <p className="text-xs text-slate-500">
            Registro imutável de todas as entradas, consumos de OP, ajustes e transferências com rastreio de saldos.
          </p>
        </div>

        <Link
          href="/estoque"
          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Boxes className="w-4 h-4 text-sky-600" />
          Ver Saldos Atuais
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por lote, item, motivo de ajuste ou operador..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Tipo:</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="todos">Todos os Movimentos</option>
            <option value="entrada_compra">Entrada por Compra</option>
            <option value="saida_corte_op">Consumo Corte OP</option>
            <option value="ajuste_inventario">Ajuste de Inventário</option>
            <option value="entrada_producao_pa">Entrada Produto Acabado</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Data / Hora</th>
                <th className="py-3 px-4 font-semibold">Tipo Movimento</th>
                <th className="py-3 px-4 font-semibold">Depósito</th>
                <th className="py-3 px-4 font-semibold">Lote / Insumo</th>
                <th className="py-3 px-4 font-semibold text-right">Saldo Ant.</th>
                <th className="py-3 px-4 font-semibold text-right">Movimentação</th>
                <th className="py-3 px-4 font-semibold text-right">Saldo Post.</th>
                <th className="py-3 px-4 font-semibold">Motivo / Auditoria</th>
                <th className="py-3 px-4 font-semibold">Usuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {movimentacoesFiltradas.map((m) => {
                const isPositivo = m.quantidade > 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {formatDateTime(m.created_at)}
                    </td>
                    <td className="py-3 px-4">{getTipoBadge(m.tipo_movimento)}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{m.deposito_nome}</td>
                    <td className="py-3 px-4">
                      {m.codigo_lote ? (
                        <div>
                          <span className="font-mono font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded text-[11px]">
                            {m.codigo_lote}
                          </span>
                          <span className="block text-[11px] text-slate-500">{m.item_descricao}</span>
                        </div>
                      ) : (
                        <span>{m.item_descricao}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono">
                      {formatNumber(m.saldo_anterior, 1)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={isPositivo ? "text-emerald-600" : "text-rose-600"}>
                        {isPositivo ? "+" : ""}
                        {formatNumber(m.quantidade, 1)} {m.unidade_medida}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {formatNumber(m.saldo_posterior, 1)}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate">
                      {m.motivo_ajuste || m.documento_origem_tipo || "-"}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                      {m.usuario_nome || "Sistema"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
