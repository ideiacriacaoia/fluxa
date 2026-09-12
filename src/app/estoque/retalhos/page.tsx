"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scissors,
  Search,
  Filter,
  Plus,
  QrCode,
  Boxes,
  Sparkles,
  ArrowRight,
  Factory,
  CheckCircle2,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatNumber, formatDate } from "@/lib/utils";

export default function RetalhosEstoquePage() {
  const { retalhos, lotes, gerarRetalhoCorte } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("disponivel");
  const [modalNovo, setModalNovo] = useState(false);

  // Form state
  const [loteOrigemId, setLoteOrigemId] = useState(lotes[0]?.id || "");
  const [corNome, setCorNome] = useState("Preto Reativo");
  const [pesoKg, setPesoKg] = useState<number>(3.5);
  const [metragemM, setMetragemM] = useState<number>(10.0);
  const [larguraM, setLarguraM] = useState<number>(1.8);
  const [observacoes, setObservacoes] = useState("");

  const retalhosFiltrados = retalhos.filter((r) => {
    const codBusca = (r.codigo_retalho || "").toLowerCase();
    const loteBusca = (r.codigo_lote_origem || "").toLowerCase();
    const corBusca = (r.cor_nome || r.cor || "").toLowerCase();
    const descBusca = (r.item_descricao || "").toLowerCase();

    const matchBusca =
      codBusca.includes(busca.toLowerCase()) ||
      loteBusca.includes(busca.toLowerCase()) ||
      corBusca.includes(busca.toLowerCase()) ||
      descBusca.includes(busca.toLowerCase());

    const statusVal = r.status || (r.disponivel ? "disponivel" : "consumido");
    const matchStatus = filtroStatus === "todos" || statusVal === filtroStatus;
    return matchBusca && matchStatus;
  });

  const totalKgRetalhoDisponivel = retalhos
    .filter((r) => r.status === "disponivel" || (r.disponivel && !r.status))
    .reduce((acc, curr) => acc + (curr.peso_residual_kg || curr.metragem || 0), 0);

  const handleSalvarRetalho = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loteOrigemId || pesoKg <= 0) return;

    gerarRetalhoCorte({
      lote_origem_id: loteOrigemId,
      cor_nome: corNome,
      peso_residual_kg: Number(pesoKg),
      metragem_residual_m: Number(metragemM),
      largura_aproveitavel_m: Number(larguraM),
      observacoes: observacoes,
    });

    setModalNovo(false);
    setObservacoes("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-accent-gold/10 text-accent-gold text-[11px] font-semibold px-2 py-0.5 rounded border border-accent-gold/20 flex items-center gap-1">
              <Scissors className="w-3 h-3 text-accent-gold" />
              Estoque Controlado de Sobras
            </span>
          </div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            Gestão de Retalhos & Sobras de Corte
          </h1>
          <p className="text-xs text-text-muted">
            Retalhos gerados no corte são itens de estoque rastreáveis ao lote de tecido original e prontos para consumo em novas OPs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/producao"
            className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Factory className="w-4 h-4 text-brand-primary" />
            Consumir em Nova OP
          </Link>
          <button
            onClick={() => setModalNovo(true)}
            className="px-3.5 py-2 bg-accent-gold hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar Retalho Manual
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Total Retalhos Disponíveis
            </span>
            <div className="w-9 h-9 rounded-lg bg-accent-gold/10 text-accent-gold flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-main font-mono">
                {formatNumber(totalKgRetalhoDisponivel, 1)}
              </span>
              <span className="text-xs font-medium text-text-muted">kg em almoxarifado</span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Prontos para reaproveitamento em golas, peitilhos e tiragens menores
            </p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Lotes de Retalho Ativos
            </span>
            <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-main font-mono">
                {retalhos.filter((r) => r.status === "disponivel").length}
              </span>
              <span className="text-xs font-medium text-text-muted">sobras cadastradas</span>
            </div>
            <p className="text-xs text-text-muted mt-1">100% rastreáveis à NF e lote de entrada</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Taxa de Aproveitamento
            </span>
            <div className="w-9 h-9 rounded-lg bg-status-success/10 text-status-success flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-status-success">Zero Descarte</span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Toda sobra do corte é controlada como ativo de estoque
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código do retalho (ex: RET-LT2026-MALHA-PT-01-A), lote original ou cor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-medium">Status:</span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-surface-hover border border-border-main text-xs rounded-lg px-3 py-1.5 text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="todos">Todos os Status</option>
            <option value="disponivel">Disponível em Estoque</option>
            <option value="consumido">Consumido em OP</option>
            <option value="reservado_op">Reservado para OP</option>
          </select>
        </div>
      </div>

      {/* Retalhos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {retalhosFiltrados.map((ret) => (
          <div
            key={ret.id}
            className="bg-surface rounded-xl border border-border-main shadow-sm p-5 space-y-3 hover:border-accent-gold/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-accent-gold bg-accent-gold/10 px-2.5 py-1 rounded border border-accent-gold/20">
                  {ret.codigo_retalho || `RET-${ret.id.substring(0, 6)}`}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    (ret.status === "disponivel" || ret.disponivel)
                      ? "bg-status-success/10 text-status-success border-status-success/20"
                      : "bg-surface-hover text-text-muted border-border-main"
                  }`}
                >
                  {(ret.status === "disponivel" || ret.disponivel) ? "Disponível" : "Consumido"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-xs text-text-main">{ret.item_descricao || "Sobra de Tecido"}</h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-border-main"
                    style={{ backgroundColor: ret.cor_codigo || "#444" }}
                  ></span>
                  <strong className="text-text-main">{ret.cor_nome || ret.cor || "Cor Padrão"}</strong>
                  <span>• Depósito: {ret.deposito_nome || "Almoxarifado"}</span>
                </div>
              </div>

              {/* Technical specs */}
              <div className="p-2.5 bg-surface-hover rounded-lg border border-border-subtle text-[11px] space-y-1 text-text-muted">
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">Lote Origem:</span>
                  <strong className="font-mono text-brand-primary">{ret.codigo_lote_origem || ret.lote_origem_id}</strong>
                </div>
                {ret.numero_op_origem && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-dim">Gerado na OP:</span>
                    <strong className="text-text-main">OP #{ret.numero_op_origem}</strong>
                  </div>
                )}
                {(ret.metragem_residual_m || ret.metragem) && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-dim">Metragem:</span>
                    <strong className="text-text-main">{formatNumber(ret.metragem_residual_m || ret.metragem || 0, 1)} m</strong>
                  </div>
                )}
                {ret.largura_aproveitavel_m && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-dim">Largura Aproveitável:</span>
                    <strong className="text-text-main">{ret.largura_aproveitavel_m} m</strong>
                  </div>
                )}
              </div>

              {ret.observacoes && (
                <p className="text-[11px] text-text-muted italic bg-accent-gold/5 p-2 rounded border border-accent-gold/10">
                  "{ret.observacoes}"
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-text-dim">
                Registrado em {formatDate(ret.created_at)}
              </span>
              <span className="text-sm font-bold text-text-main font-mono">
                {formatNumber(ret.peso_residual_kg || ret.metragem || 0, 2)} kg
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Retalho Manual */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <Scissors className="w-5 h-5 text-accent-gold" />
                Registrar Retalho / Sobra de Tecido
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarRetalho} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-main mb-1">
                  Lote de Tecido de Origem *
                </label>
                <select
                  value={loteOrigemId}
                  onChange={(e) => {
                    setLoteOrigemId(e.target.value);
                    const l = lotes.find((item) => item.id === e.target.value);
                    if (l) setCorNome(l.cor_nome || "Cor Padrão");
                  }}
                  className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  required
                >
                  {lotes.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.codigo_lote} ({l.cor_nome}) - {l.item_descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Cor / Tonalidade</label>
                <input
                  type="text"
                  value={corNome}
                  onChange={(e) => setCorNome(e.target.value)}
                  className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Peso Residual (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pesoKg}
                    onChange={(e) => setPesoKg(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs font-bold text-text-main font-mono focus:ring-2 focus:ring-brand-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Metragem Residual (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={metragemM}
                    onChange={(e) => setMetragemM(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">
                  Largura Aproveitável (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={larguraM}
                  onChange={(e) => setLarguraM(Number(e.target.value))}
                  className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Ponta de rolo com 10 metros, ótima para detalhes."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                />
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
                  className="px-4 py-2 bg-accent-gold hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  Lançar no Estoque de Retalhos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
