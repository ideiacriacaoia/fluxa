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
      materia_prima: { label: "Matéria-Prima & Tecidos", bg: "bg-sky-50", text: "text-sky-700" },
      retalho: { label: "Almoxarifado de Retalhos & Sobras", bg: "bg-amber-50", text: "text-amber-700" },
      wip: { label: "Produção em Processo (WIP)", bg: "bg-blue-50", text: "text-blue-700" },
      produto_acabado: { label: "Produto Acabado (Expedição)", bg: "bg-emerald-50", text: "text-emerald-700" },
    };
    const c = map[t] || { label: t, bg: "bg-slate-100", text: "text-slate-700" };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
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
            <Warehouse className="w-5 h-5 text-sky-600" />
            Depósitos & Almoxarifados (Multi-Depósito)
          </h1>
          <p className="text-xs text-slate-500">
            Gerencie locais físicos e virtuais de armazenamento (Almoxarifado MP, Chão de Fábrica WIP, Facções e Expedição).
          </p>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Depósito
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código ou nome do depósito..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
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
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                    {dep.codigo}
                  </span>
                  {getTipoBadge(dep.tipo)}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">{dep.nome}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        dep.permite_saldo_negativo
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {dep.permite_saldo_negativo
                        ? "Permite saldo negativo"
                        : "Bloqueia saldo negativo (Rigoroso)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{saldosDoDep.length} lotes/grades armazenados</span>
                <span className="font-bold text-slate-900 font-mono">
                  Saldo Total: {formatNumber(totalItens, 1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Depósito */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-sky-600" />
                Cadastrar Depósito
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarDeposito} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código do Depósito *</label>
                <input
                  type="text"
                  placeholder="Ex: ALM-TEC-02"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Depósito *</label>
                <input
                  type="text"
                  placeholder="Ex: Almoxarifado Secundário de Malhas"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Armazenamento *</label>
                <select
                  value={tipo}
                  onChange={(e: any) => setTipo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
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
                  className="rounded text-sky-600"
                />
                <label htmlFor="negativo" className="font-semibold text-slate-800">
                  Permitir saldo negativo neste depósito
                </label>
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
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold"
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
