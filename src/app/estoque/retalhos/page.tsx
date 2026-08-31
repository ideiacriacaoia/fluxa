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
            <span className="bg-amber-500/20 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              <Scissors className="w-3 h-3 text-amber-600" />
              Estoque Controlado de Sobras
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Gestão de Retalhos & Sobras de Corte
          </h1>
          <p className="text-xs text-slate-500">
            Retalhos gerados no corte são itens de estoque rastreáveis ao lote de tecido original e prontos para consumo em novas OPs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/producao"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Factory className="w-4 h-4 text-sky-600" />
            Consumir em Nova OP
          </Link>
          <button
            onClick={() => setModalNovo(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar Retalho Manual
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Retalhos Disponíveis
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {formatNumber(totalKgRetalhoDisponivel, 1)}
              </span>
              <span className="text-xs font-medium text-slate-500">kg em almoxarifado</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Prontos para reaproveitamento em golas, peitilhos e tiragens menores
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Lotes de Retalho Ativos
            </span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {retalhos.filter((r) => r.status === "disponivel").length}
              </span>
              <span className="text-xs font-medium text-slate-500">sobras cadastradas</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">100% rastreáveis à NF e lote de entrada</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Taxa de Aproveitamento
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">Zero Descarte</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Toda sobra do corte é controlada como ativo de estoque
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código do retalho (ex: RET-LT2026-MALHA-PT-01-A), lote original ou cor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                  {ret.codigo_retalho || `RET-${ret.id.substring(0, 6)}`}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    (ret.status === "disponivel" || ret.disponivel)
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {(ret.status === "disponivel" || ret.disponivel) ? "Disponível" : "Consumido"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-900">{ret.item_descricao || "Sobra de Tecido"}</h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                    style={{ backgroundColor: ret.cor_codigo || "#444" }}
                  ></span>
                  <strong className="text-slate-700">{ret.cor_nome || ret.cor || "Cor Padrão"}</strong>
                  <span>• Depósito: {ret.deposito_nome || "Almoxarifado"}</span>
                </div>
              </div>

              {/* Technical specs */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Lote Origem:</span>
                  <strong className="font-mono text-sky-800">{ret.codigo_lote_origem || ret.lote_origem_id}</strong>
                </div>
                {ret.numero_op_origem && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Gerado na OP:</span>
                    <strong className="text-slate-800">OP #{ret.numero_op_origem}</strong>
                  </div>
                )}
                {(ret.metragem_residual_m || ret.metragem) && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Metragem:</span>
                    <strong className="text-slate-800">{formatNumber(ret.metragem_residual_m || ret.metragem || 0, 1)} m</strong>
                  </div>
                )}
                {ret.largura_aproveitavel_m && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Largura Aproveitável:</span>
                    <strong className="text-slate-800">{ret.largura_aproveitavel_m} m</strong>
                  </div>
                )}
              </div>

              {ret.observacoes && (
                <p className="text-[11px] text-slate-500 italic bg-amber-50/40 p-2 rounded border border-amber-100">
                  "{ret.observacoes}"
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Registrado em {formatDate(ret.created_at)}
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {formatNumber(ret.peso_residual_kg || ret.metragem || 0, 2)} kg
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Retalho Manual */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-600" />
                Registrar Retalho / Sobra de Tecido
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarRetalho} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lote de Tecido de Origem *
                </label>
                <select
                  value={loteOrigemId}
                  onChange={(e) => {
                    setLoteOrigemId(e.target.value);
                    const l = lotes.find((item) => item.id === e.target.value);
                    if (l) setCorNome(l.cor_nome || "Cor Padrão");
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
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
                <label className="block font-semibold text-slate-700 mb-1">Cor / Tonalidade</label>
                <input
                  type="text"
                  value={corNome}
                  onChange={(e) => setCorNome(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peso Residual (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pesoKg}
                    onChange={(e) => setPesoKg(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Metragem Residual (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={metragemM}
                    onChange={(e) => setMetragemM(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Largura Aproveitável (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={larguraM}
                  onChange={(e) => setLarguraM(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Ponta de rolo com 10 metros, ótima para detalhes."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
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
