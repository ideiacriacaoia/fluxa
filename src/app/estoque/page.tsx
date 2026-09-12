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
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Boxes className="w-5 h-5 text-brand-primary" />
            Saldos de Estoque & Almoxarifado
          </h1>
          <p className="text-xs text-text-muted">
            Visão consolidada de saldos de matéria-prima (por lote) e produtos acabados (por grade).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/estoque/retalhos"
            className="px-3.5 py-2 bg-accent-gold/10 hover:bg-accent-gold/20 border border-accent-gold/30 text-accent-gold rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Scissors className="w-4 h-4 text-accent-gold" />
            Estoque de Retalhos
          </Link>
          <Link
            href="/estoque/lotes"
            className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <QrCode className="w-4 h-4 text-brand-primary" />
            Rastreio de Lotes
          </Link>
          <Link
            href="/estoque/movimentacoes"
            className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <History className="w-4 h-4 text-brand-primary" />
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
                  ? "bg-brand-primary/10 border-brand-primary shadow-xs"
                  : "bg-surface border-border-main hover:border-brand-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                  {dep.codigo}
                </span>
                <span className="text-[10px] uppercase font-semibold text-text-dim">
                  {dep.tipo.replace("_", " ")}
                </span>
              </div>
              <h3 className="font-bold text-xs text-text-main mt-2 truncate">{dep.nome}</h3>
              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-border-subtle">
                <span className="text-[11px] text-text-muted">Saldo Consolidado</span>
                <span className="text-sm font-bold text-text-main font-mono">
                  {formatNumber(totalItens, 1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição de tecido, lote, código ou SKU..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-medium">Depósito:</span>
          <select
            value={filtroDeposito}
            onChange={(e) => setFiltroDeposito(e.target.value)}
            className="bg-surface-hover border border-border-main text-xs rounded-lg px-3 py-1.5 text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
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
      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-hover text-text-muted border-b border-border-main">
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
            <tbody className="divide-y divide-border-subtle text-text-main">
              {saldosFiltrados.map((s) => {
                const disponivel = s.quantidade_atual - (s.quantidade_reservada || 0);

                return (
                  <tr key={s.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-text-main">{s.deposito_nome}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          s.lote_id
                            ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                            : "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                        }`}
                      >
                        {s.lote_id ? "Matéria-Prima" : "Produto Acabado"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.lote_id ? (
                        <div>
                          <strong className="text-text-main">{s.item_codigo}</strong> - {s.item_descricao}
                        </div>
                      ) : (
                        <div>
                          <strong className="text-text-main">{s.produto_referencia}</strong> - {s.produto_nome}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {s.codigo_lote ? (
                        <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                          {s.codigo_lote} ({s.cor_nome || "-"})
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-text-muted bg-surface-hover px-2 py-0.5 rounded border border-border-main">
                          Grade: {s.cor_nome} / {s.tamanho} (SKU: {s.sku})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-text-main font-mono">
                      {formatNumber(s.quantidade_atual, 1)} {s.unidade_medida}
                    </td>
                    <td className="py-3 px-4 text-right text-status-warning font-semibold font-mono">
                      {formatNumber(s.quantidade_reservada || 0, 1)} {s.unidade_medida}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-status-success font-mono">
                      {formatNumber(disponivel, 1)} {s.unidade_medida}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSaldoParaAjuste(s);
                          setModalAjuste(true);
                        }}
                        className="px-2.5 py-1 bg-surface hover:bg-surface-hover border border-border-main text-text-main font-semibold rounded text-[11px] transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-status-warning" />
                Ajuste de Estoque / Inventário
              </h2>
              <button
                onClick={() => setModalAjuste(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarAjuste} className="space-y-4 text-xs">
              <div className="p-3 bg-surface-hover rounded-xl border border-border-main space-y-1">
                <div>
                  <span className="text-text-dim">Depósito: </span>
                  <strong className="text-text-main">{saldoParaAjuste.deposito_nome}</strong>
                </div>
                <div>
                  <span className="text-text-dim">Item/Lote: </span>
                  <strong className="text-text-main">
                    {saldoParaAjuste.codigo_lote || saldoParaAjuste.sku || saldoParaAjuste.item_descricao}
                  </strong>
                </div>
                <div>
                  <span className="text-text-dim">Saldo Atual: </span>
                  <strong className="text-text-main font-mono">
                    {formatNumber(saldoParaAjuste.quantidade_atual, 1)} {saldoParaAjuste.unidade_medida}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">
                  Quantidade a Ajustar (+ entrada ou - perda/ajuste) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: -5 ou 10"
                  value={qtdAjuste}
                  onChange={(e) => setQtdAjuste(Number(e.target.value))}
                  className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs font-bold text-text-main font-mono focus:ring-2 focus:ring-brand-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">
                  Motivo do Ajuste (Obrigatório para Auditoria) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Contagem de inventário cíclico, perda por corte..."
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalAjuste(false)}
                  className="px-4 py-2 bg-surface-hover hover:bg-border-main text-text-main rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground rounded-lg font-semibold transition-colors"
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
