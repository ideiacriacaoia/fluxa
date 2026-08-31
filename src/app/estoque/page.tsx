"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Warehouse,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  QrCode,
  History,
  AlertTriangle,
  Layers,
  Scissors,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatNumber, formatBRL } from "@/lib/utils";

export default function EstoqueSaldosPage() {
  const { saldos, depositos, lotes, itensCatalogo, ajustarEstoque } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroDeposito, setFiltroDeposito] = useState<string>("todos");
  const [modalAjuste, setModalAjuste] = useState(false);
  const [saldoParaAjuste, setSaldoParaAjuste] = useState<any>(null);
  const [qtdAjuste, setQtdAjuste] = useState<number>(0);
  const [motivoAjuste, setMotivoAjuste] = useState<string>("");

  const saldosFiltrados = saldos.filter((s) => {
    const matchBusca =
      (s.item_descricao && s.item_descricao.toLowerCase().includes(busca.toLowerCase())) ||
      (s.codigo_lote && s.codigo_lote.toLowerCase().includes(busca.toLowerCase())) ||
      (s.produto_nome && s.produto_nome.toLowerCase().includes(busca.toLowerCase())) ||
      (s.sku && s.sku.toLowerCase().includes(busca.toLowerCase()));
    const matchDep = filtroDeposito === "todos" || s.deposito_id === filtroDeposito;
    return matchBusca && matchDep;
  });

  const handleSalvarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saldoParaAjuste || qtdAjuste === 0 || !motivoAjuste) return;

    ajustarEstoque({
      deposito_id: saldoParaAjuste.deposito_id,
      item_catalogo_id: saldoParaAjuste.item_catalogo_id,
      lote_id: saldoParaAjuste.lote_id,
      produto_variacao_id: saldoParaAjuste.produto_variacao_id,
      quantidade_ajuste: Number(qtdAjuste),
      motivo: motivoAjuste,
    });

    setModalAjuste(false);
    setSaldoParaAjuste(null);
    setQtdAjuste(0);
    setMotivoAjuste("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-sky-600" />
            Estoque & Almoxarifado (Multi-Depósito)
          </h1>
          <p className="text-xs text-slate-500">
            Visão consolidada de saldos de matéria-prima (por lote) e produtos acabados (por grade).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/estoque/retalhos"
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Scissors className="w-4 h-4 text-amber-600" />
            Estoque de Retalhos
          </Link>
          <Link
            href="/estoque/lotes"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <QrCode className="w-4 h-4 text-sky-600" />
            Rastreio de Lotes
          </Link>
          <Link
            href="/estoque/movimentacoes"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <History className="w-4 h-4 text-indigo-600" />
            Auditoria / Ledger
          </Link>
        </div>
      </div>

      {/* Depósitos Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {depositos.map((dep) => {
          const saldosDoDep = saldos.filter((s) => s.deposito_id === dep.id);
          const totalItens = saldosDoDep.reduce((acc, curr) => acc + curr.quantidade_atual, 0);

          return (
            <div
              key={dep.id}
              onClick={() => setFiltroDeposito(dep.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                filtroDeposito === dep.id
                  ? "bg-sky-50/60 border-sky-400 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {dep.codigo}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  {dep.tipo.replace("_", " ")}
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-800 mt-2 truncate">{dep.nome}</h3>
              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">Saldo Consolidado</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatNumber(totalItens, 1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição de tecido, lote, código ou SKU..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Depósito:</span>
          <select
            value={filtroDeposito}
            onChange={(e) => setFiltroDeposito(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="todos">Todos os Depósitos</option>
            {depositos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome} ({d.codigo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Depósito</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Item / Descrição</th>
                <th className="py-3 px-4 font-semibold">Rastreio (Lote / Grade)</th>
                <th className="py-3 px-4 font-semibold text-right">Saldo Físico</th>
                <th className="py-3 px-4 font-semibold text-right">Reservado OP</th>
                <th className="py-3 px-4 font-semibold text-right">Disponível</th>
                <th className="py-3 px-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {saldosFiltrados.map((s) => {
                const disponivel = s.quantidade_atual - (s.quantidade_reservada || 0);

                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{s.deposito_nome}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          s.lote_id
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {s.lote_id ? "Matéria-Prima" : "Produto Acabado"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.lote_id ? (
                        <div>
                          <strong className="text-slate-900">{s.item_codigo}</strong> - {s.item_descricao}
                        </div>
                      ) : (
                        <div>
                          <strong className="text-slate-900">{s.produto_referencia}</strong> - {s.produto_nome}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {s.codigo_lote ? (
                        <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50/60 px-2 py-0.5 rounded border border-sky-200">
                          {s.codigo_lote} ({s.cor_nome || "-"})
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          Grade: {s.cor_nome} / {s.tamanho} (SKU: {s.sku})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatNumber(s.quantidade_atual, 1)} {s.unidade_medida}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-600 font-semibold">
                      {formatNumber(s.quantidade_reservada || 0, 1)} {s.unidade_medida}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {formatNumber(disponivel, 1)} {s.unidade_medida}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSaldoParaAjuste(s);
                          setModalAjuste(true);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                      >
                        Ajustar / Inventário
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajuste de Inventário com Auditoria */}
      {modalAjuste && saldoParaAjuste && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Ajuste de Estoque / Inventário
              </h2>
              <button
                onClick={() => setModalAjuste(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarAjuste} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div>
                  <span className="text-slate-400">Depósito: </span>
                  <strong className="text-slate-800">{saldoParaAjuste.deposito_nome}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Item/Lote: </span>
                  <strong className="text-slate-900">
                    {saldoParaAjuste.codigo_lote || saldoParaAjuste.sku || saldoParaAjuste.item_descricao}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Saldo Atual: </span>
                  <strong className="text-slate-900">
                    {formatNumber(saldoParaAjuste.quantidade_atual, 1)} {saldoParaAjuste.unidade_medida}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantidade a Ajustar (+ entrada ou - perda/ajuste) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: -5 ou 10"
                  value={qtdAjuste}
                  onChange={(e) => setQtdAjuste(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo do Ajuste (Obrigatório para Auditoria) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Contagem de inventário cíclico, perda por corte..."
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAjuste(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold"
                >
                  Confirmar e Gravar no Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
