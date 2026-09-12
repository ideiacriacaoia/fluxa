"use client";

import React, { useState } from "react";
import {
  Warehouse,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatNumber } from "@/lib/utils";

export default function DepositosPage() {
  const { depositos, saldos, addDeposito } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [modalNovo, setModalNovo] = useState(false);

  // Form State
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<
    "materia_prima" | "retalho" | "wip" | "produto_acabado"
  >("materia_prima");
  const [permiteNegativo, setPermiteNegativo] = useState(false);

  const depositosFiltrados = depositos.filter((d) => {
    return (
      (d.codigo && d.codigo.toLowerCase().includes(busca.toLowerCase())) ||
      d.nome.toLowerCase().includes(busca.toLowerCase()) ||
      d.tipo.toLowerCase().includes(busca.toLowerCase())
    );
  });

  const handleSalvarDeposito = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    addDeposito({
      codigo: codigo || undefined,
      nome,
      tipo,
      permite_saldo_negativo: permiteNegativo,
      ativo: true,
    });

    setModalNovo(false);
    setCodigo("");
    setNome("");
    setPermiteNegativo(false);
  };

  const getTipoBadge = (t: string) => {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      materia_prima: { label: "Matéria-Prima & Tecidos", bg: "bg-brand-primary/10", text: "text-brand-primary" },
      retalho: { label: "Almoxarifado de Retalhos & Sobras", bg: "bg-accent-gold/10", text: "text-accent-gold" },
      wip: { label: "Produção em Processo (WIP)", bg: "bg-brand-primary/10", text: "text-brand-primary" },
      produto_acabado: { label: "Produto Acabado (Expedição)", bg: "bg-status-success/10", text: "text-status-success" },
    };
    const c = map[t] || { label: t, bg: "bg-surface-hover", text: "text-text-muted" };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-border-main/50 ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-brand-primary" />
            Depósitos & Almoxarifados (Multi-Depósito)
          </h1>
          <p className="text-xs text-text-muted">
            Gerencie locais físicos e virtuais de armazenamento (Almoxarifado MP, Chão de Fábrica WIP, Facções e Expedição).
          </p>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="px-3.5 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Depósito
        </button>
      </div>

      {/* Search */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código ou nome do depósito..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Depósitos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {depositosFiltrados.map((dep) => {
          const saldosDoDep = saldos.filter((s) => s.deposito_id === dep.id);
          const totalItens = saldosDoDep.reduce((acc, curr) => acc + curr.quantidade_atual, 0);

          return (
            <div
              key={dep.id}
              className="bg-surface rounded-xl border border-border-main shadow-sm p-5 space-y-3 hover:border-brand-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded border border-brand-primary/20">
                    {dep.codigo}
                  </span>
                  {getTipoBadge(dep.tipo)}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-text-main leading-tight">{dep.nome}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        dep.permite_saldo_negativo
                          ? "bg-status-warning/10 text-status-warning border-status-warning/20"
                          : "bg-status-success/10 text-status-success border-status-success/20"
                      }`}
                    >
                      {dep.permite_saldo_negativo
                        ? "Permite saldo negativo"
                        : "Bloqueia saldo negativo (Rigoroso)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-text-muted">{saldosDoDep.length} lotes/grades armazenados</span>
                <span className="font-bold text-text-main font-mono">
                  Saldo Total: {formatNumber(totalItens, 1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Depósito */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-brand-primary" />
                Cadastrar Depósito
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarDeposito} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-main mb-1">Código do Depósito *</label>
                <input
                  type="text"
                  placeholder="Ex: ALM-TEC-02"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs font-mono font-bold text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Nome do Depósito *</label>
                <input
                  type="text"
                  placeholder="Ex: Almoxarifado Secundário de Malhas"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Tipo de Armazenamento *</label>
                <select
                  value={tipo}
                  onChange={(e: any) => setTipo(e.target.value)}
                  className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs font-medium text-text-main focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="materia_prima">Matéria-Prima & Tecidos</option>
                  <option value="retalho">Almoxarifado de Retalhos & Sobras</option>
                  <option value="wip">Produção em Processo (WIP)</option>
                  <option value="produto_acabado">Produto Acabado (Expedição)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="negativo"
                  checked={permiteNegativo}
                  onChange={(e) => setPermiteNegativo(e.target.checked)}
                  className="rounded text-brand-primary"
                />
                <label htmlFor="negativo" className="font-semibold text-text-main">
                  Permitir saldo negativo neste depósito
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 bg-surface-hover hover:bg-border-main text-text-main rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground rounded-lg font-semibold transition-colors"
                >
                  Criar Depósito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
