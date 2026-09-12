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
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Tags className="w-5 h-5 text-brand-primary" />
            Catálogo de Matérias-Primas & Insumos
          </h1>
          <p className="text-xs text-text-muted">
            Cadastre tecidos, malhas, linhas, botões, etiquetas e configure as especificações de rendimento.
          </p>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="px-3.5 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Insumo
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código (ex: TEC-MALHA-30-1), descrição ou composição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-medium">Tipo:</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-surface-hover border border-border-main text-xs rounded-lg px-3 py-1.5 text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
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
      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-hover text-text-muted border-b border-border-main">
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
            <tbody className="divide-y divide-border-subtle text-text-main">
              {itensFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                      {item.codigo}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.tipo === "tecido"
                          ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                          : "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                      }`}
                    >
                      {item.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-text-main">{item.descricao}</td>
                  <td className="py-3 px-4 text-text-muted">{item.composicao || "-"}</td>
                  <td className="py-3 px-4 text-right">
                    {item.gramatura_g_m2 ? (
                      <span className="text-text-muted">
                        {item.gramatura_g_m2} g/m² • {item.largura_padrao_m} m
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-text-main">
                    {item.rendimento_m_kg ? `${formatNumber(item.rendimento_m_kg, 3)} m/kg` : "-"}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-brand-primary">
                    {formatBRL(item.custo_medio_unitario)} / {item.unidade_medida}
                  </td>
                  <td className="py-3 px-4 text-right text-text-muted font-mono">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <Tags className="w-5 h-5 text-brand-primary" />
                Cadastrar Matéria-Prima / Insumo
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Código do Insumo *</label>
                  <input
                    type="text"
                    placeholder="Ex: TEC-VISCOSE-40"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs font-mono font-bold text-text-main focus:ring-2 focus:ring-brand-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Tipo de Insumo *</label>
                  <select
                    value={tipo}
                    onChange={(e: any) => {
                      setTipo(e.target.value);
                      if (e.target.value === "tecido") setUnidade("kg");
                      else if (e.target.value === "aviamento") setUnidade("unidade");
                    }}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs font-medium text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  >
                    <option value="tecido">Tecido / Malha</option>
                    <option value="aviamento">Aviamento</option>
                    <option value="fio">Fio de Costura / Bordado</option>
                    <option value="embalagem">Embalagem</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-text-main mb-1">Descrição Completa *</label>
                  <input
                    type="text"
                    placeholder="Ex: Viscose Vortex com Elastano Estampada"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Unidade de Medida *</label>
                  <select
                    value={unidade}
                    onChange={(e: any) => setUnidade(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs font-medium text-text-main focus:ring-2 focus:ring-brand-primary/20"
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
                  <label className="block font-semibold text-text-main mb-1">Composição Têxtil</label>
                  <input
                    type="text"
                    placeholder="Ex: 96% Viscose 4% Elastano"
                    value={composicao}
                    onChange={(e) => setComposicao(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                {tipo === "tecido" && (
                  <>
                    <div>
                      <label className="block font-semibold text-text-main mb-1">Gramatura (g/m²)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={gramatura}
                        onChange={(e) => setGramatura(Number(e.target.value))}
                        className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-text-main mb-1">Largura Padrão (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={largura}
                        onChange={(e) => setLargura(Number(e.target.value))}
                        className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-text-main mb-1">Custo Médio Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoMedio}
                    onChange={(e) => setCustoMedio(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Ponto de Pedido (Alerta)</label>
                  <input
                    type="number"
                    value={pontoPedido}
                    onChange={(e) => setPontoPedido(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              {tipo === "tecido" && rendimentoEstimado > 0 && (
                <div className="p-3 bg-brand-primary/10 rounded-lg border border-brand-primary/20 text-xs flex items-center justify-between">
                  <span className="text-brand-primary font-semibold">Rendimento Calculado:</span>
                  <strong className="text-brand-primary font-mono text-sm">
                    {formatNumber(rendimentoEstimado, 3)} m/kg
                  </strong>
                </div>
              )}

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
