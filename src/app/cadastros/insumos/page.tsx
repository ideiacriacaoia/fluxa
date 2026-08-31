"use client";

import React, { useState } from "react";
import {
  Tags,
  Plus,
  Search,
  Layers,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { calcularRendimentoTecido, formatBRL, formatNumber } from "@/lib/utils";

export default function InsumosCatalogoPage() {
  const { itensCatalogo, addItemCatalogo } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [modalNovo, setModalNovo] = useState(false);

  // Form State
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"tecido" | "aviamento" | "fio" | "embalagem">("tecido");
  const [unidade, setUnidade] = useState<"kg" | "metro" | "unidade" | "cento" | "cone">("kg");
  const [composicao, setComposicao] = useState("100% Algodão");
  const [gramatura, setGramatura] = useState<number>(165.0);
  const [largura, setLargura] = useState<number>(1.8);
  const [estoqueMin, setEstoqueMin] = useState<number>(50.0);
  const [pontoPedido, setPontoPedido] = useState<number>(100.0);
  const [custoMedio, setCustoMedio] = useState<number>(38.5);

  const itensFiltrados = itensCatalogo.filter((item) => {
    const matchBusca =
      item.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (item.composicao && item.composicao.toLowerCase().includes(busca.toLowerCase()));
    const matchTipo = filtroTipo === "todos" || item.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  const rendimentoEstimado =
    tipo === "tecido" && gramatura > 0 && largura > 0
      ? calcularRendimentoTecido(gramatura, largura)
      : 0;

  const handleSalvarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !descricao) return;

    addItemCatalogo({
      codigo,
      descricao,
      tipo,
      unidade_medida: unidade,
      composicao: composicao || undefined,
      gramatura_g_m2: tipo === "tecido" ? Number(gramatura) : undefined,
      largura_padrao_m: tipo === "tecido" ? Number(largura) : undefined,
      rendimento_m_kg: rendimentoEstimado > 0 ? rendimentoEstimado : undefined,
      estoque_minimo: Number(estoqueMin),
      ponto_pedido: Number(pontoPedido),
      custo_medio_unitario: Number(custoMedio),
      ativo: true,
    });

    setModalNovo(false);
    setCodigo("");
    setDescricao("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tags className="w-5 h-5 text-sky-600" />
            Catálogo de Matérias-Primas & Insumos
          </h1>
          <p className="text-xs text-slate-500">
            Cadastre tecidos, malhas, linhas, botões, etiquetas e configure as especificações de rendimento.
          </p>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Insumo
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código (ex: TEC-MALHA-30-1), descrição ou composição..."
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
            <option value="todos">Todos os Insumos</option>
            <option value="tecido">Tecidos / Malhas</option>
            <option value="aviamento">Aviamentos</option>
            <option value="fio">Fios</option>
            <option value="embalagem">Embalagens</option>
          </select>
        </div>
      </div>

      {/* Insumos Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Descrição do Insumo</th>
                <th className="py-3 px-4 font-semibold">Composição</th>
                <th className="py-3 px-4 font-semibold text-right">Gramatura / Largura</th>
                <th className="py-3 px-4 font-semibold text-right">Rendimento Teórico</th>
                <th className="py-3 px-4 font-semibold text-right">Custo Médio</th>
                <th className="py-3 px-4 font-semibold text-right">Pto Pedido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {itensFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {item.codigo}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.tipo === "tecido"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.descricao}</td>
                  <td className="py-3 px-4 text-slate-500">{item.composicao || "-"}</td>
                  <td className="py-3 px-4 text-right">
                    {item.gramatura_g_m2 ? (
                      <span>
                        {item.gramatura_g_m2} g/m² • {item.largura_padrao_m} m
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    {item.rendimento_m_kg ? `${formatNumber(item.rendimento_m_kg, 3)} m/kg` : "-"}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatBRL(item.custo_medio_unitario)} / {item.unidade_medida}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 font-mono">
                    {formatNumber(item.ponto_pedido, 1)} {item.unidade_medida}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Insumo */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tags className="w-5 h-5 text-sky-600" />
                Cadastrar Matéria-Prima / Insumo
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código do Insumo *</label>
                  <input
                    type="text"
                    placeholder="Ex: TEC-VISCOSE-40"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Insumo *</label>
                  <select
                    value={tipo}
                    onChange={(e: any) => {
                      setTipo(e.target.value);
                      if (e.target.value === "tecido") setUnidade("kg");
                      else if (e.target.value === "aviamento") setUnidade("unidade");
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="tecido">Tecido / Malha</option>
                    <option value="aviamento">Aviamento</option>
                    <option value="fio">Fio de Costura / Bordado</option>
                    <option value="embalagem">Embalagem</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Descrição Completa *</label>
                  <input
                    type="text"
                    placeholder="Ex: Viscose Vortex com Elastano Estampada"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unidade de Medida *</label>
                  <select
                    value={unidade}
                    onChange={(e: any) => setUnidade(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="kg">Quilograma (kg)</option>
                    <option value="metro">Metro linear (m)</option>
                    <option value="unidade">Unidade (un)</option>
                    <option value="cento">Cento (100 un)</option>
                    <option value="cone">Cone</option>
                    <option value="rolo">Rolo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Composição Têxtil</label>
                  <input
                    type="text"
                    placeholder="Ex: 96% Viscose 4% Elastano"
                    value={composicao}
                    onChange={(e) => setComposicao(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {tipo === "tecido" && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Gramatura (g/m²)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={gramatura}
                        onChange={(e) => setGramatura(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Largura Padrão (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={largura}
                        onChange={(e) => setLargura(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custo Médio Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoMedio}
                    onChange={(e) => setCustoMedio(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ponto de Pedido (Alerta)</label>
                  <input
                    type="number"
                    value={pontoPedido}
                    onChange={(e) => setPontoPedido(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {tipo === "tecido" && rendimentoEstimado > 0 && (
                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-xs flex items-center justify-between">
                  <span className="text-sky-900 font-semibold">Rendimento Calculado:</span>
                  <strong className="text-sky-800 font-mono text-sm">
                    {formatNumber(rendimentoEstimado, 3)} m/kg
                  </strong>
                </div>
              )}

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
                  Salvar no Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
