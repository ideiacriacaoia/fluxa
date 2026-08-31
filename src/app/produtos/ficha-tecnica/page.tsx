"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Calculator,
  Shirt,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatNumber } from "@/lib/utils";

export default function FichaTecnicaEditorPage() {
  const { produtos, itensCatalogo, fichasTecnicas, saveFichaTecnica } = useTextilStore();

  const [selectedProdutoId, setSelectedProdutoId] = useState<string>(produtos[0]?.id || "");
  const produtoAtual = produtos.find((p) => p.id === selectedProdutoId) || produtos[0];
  const fichaAtual = fichasTecnicas.find((f) => f.produto_id === produtoAtual?.id);

  // Form State da Ficha Técnica
  const [versao, setVersao] = useState<number>(fichaAtual ? fichaAtual.versao : 1);
  const [status, setStatus] = useState<"rascunho" | "aprovada" | "obsoleta">(
    fichaAtual?.status || "aprovada"
  );
  const [obsCorte, setObsCorte] = useState<string>(
    fichaAtual?.observacoes_corte ||
      "Descansar a malha por no mínimo 24h antes do enfesto para estabilidade dimensional."
  );
  const [obsCostura, setObsCostura] = useState<string>(
    fichaAtual?.observacoes_costura ||
      "Costura overloque 4 fios com reforço de ombro a ombro. Pesponto na gola."
  );
  const [custoMaoDeObra, setCustoMaoDeObra] = useState<number>(
    fichaAtual?.custo_estimado_mo || 4.5
  );

  const [materiais, setMateriais] = useState<
    {
      id: string;
      item_catalogo_id: string;
      aplicacao: string;
      consumo_por_peca: number;
      percentual_perda: number;
      custo_unitario_base: number;
    }[]
  >(
    fichaAtual?.materiais?.map((m) => ({
      id: m.id,
      item_catalogo_id: m.item_catalogo_id,
      aplicacao: m.aplicacao,
      consumo_por_peca: m.consumo_por_peca,
      percentual_perda: m.percentual_perda,
      custo_unitario_base: m.custo_unitario_base,
    })) || [
      {
        id: "m1",
        item_catalogo_id: itensCatalogo[0]?.id || "",
        aplicacao: "Corpo e Mangas",
        consumo_por_peca: 0.23,
        percentual_perda: 8.5,
        custo_unitario_base: itensCatalogo[0]?.custo_medio_unitario || 38.5,
      },
    ]
  );

  const [salvoFeedback, setSalvoFeedback] = useState(false);

  // Cálculos dinâmicos de custos da Ficha Técnica
  const materiaisCalculados = materiais.map((mat) => {
    const item = itensCatalogo.find((i) => i.id === mat.item_catalogo_id);
    const consumoComPerda = mat.consumo_por_peca * (1 + mat.percentual_perda / 100);
    const custoTotalMaterial = consumoComPerda * mat.custo_unitario_base;
    return {
      ...mat,
      item_codigo: item?.codigo,
      item_descricao: item?.descricao,
      unidade_medida: item?.unidade_medida,
      tipo: item?.tipo,
      consumo_com_perda: consumoComPerda,
      custo_total: custoTotalMaterial,
    };
  });

  const totalCustoMP = materiaisCalculados.reduce((acc, curr) => acc + curr.custo_total, 0);
  const totalCustoPeca = totalCustoMP + Number(custoMaoDeObra);
  const precoSugerido = produtoAtual?.preco_venda_sugerido || 0;
  const margemBrutaEstimada =
    precoSugerido > 0
      ? ((precoSugerido - totalCustoPeca) / precoSugerido) * 100
      : 0;

  const handleAddMaterial = () => {
    const itemPadrao = itensCatalogo[0];
    setMateriais([
      ...materiais,
      {
        id: `mat_${Date.now()}`,
        item_catalogo_id: itemPadrao?.id || "",
        aplicacao: "Novo Insumo / Aviamento",
        consumo_por_peca: 1.0,
        percentual_perda: 2.0,
        custo_unitario_base: itemPadrao?.custo_medio_unitario || 10,
      },
    ]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMateriais(materiais.filter((m) => m.id !== id));
  };

  const handleSalvarFicha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoAtual) return;

    saveFichaTecnica({
      produto_id: produtoAtual.id,
      versao: Number(versao),
      status: status,
      observacoes_corte: obsCorte,
      observacoes_costura: obsCostura,
      custo_estimado_mp: totalCustoMP,
      custo_estimado_mo: Number(custoMaoDeObra),
      custo_estimado_total: totalCustoPeca,
      aprovado_por: "João Marcos",
      materiais: materiaisCalculados.map((m) => ({
        id: m.id,
        ficha_tecnica_id: "",
        item_catalogo_id: m.item_catalogo_id,
        item_codigo: m.item_codigo,
        item_descricao: m.item_descricao,
        unidade_medida: m.unidade_medida,
        tipo: m.tipo,
        aplicacao: m.aplicacao,
        consumo_por_peca: m.consumo_por_peca,
        percentual_perda: m.percentual_perda,
        custo_unitario_base: m.custo_unitario_base,
        custo_total_estimado: m.custo_total,
      })),
    });

    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/produtos"
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para Catálogo de Produtos
          </Link>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-600" />
            Engenharia de Produto: Ficha Técnica Versionada
          </h1>
          <p className="text-xs text-slate-500">
            Defina o consumo unitário de tecidos, quebras de enfesto, lista de aviamentos e apure o custo real da peça.
          </p>
        </div>

        {/* Produto Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Modelo:</span>
          <select
            value={selectedProdutoId}
            onChange={(e) => {
              setSelectedProdutoId(e.target.value);
              const f = fichasTecnicas.find((item) => item.produto_id === e.target.value);
              if (f) {
                setVersao(f.versao);
                setStatus(f.status || "aprovada");
                setObsCorte(f.observacoes_corte || "");
                setObsCostura(f.observacoes_costura || "");
                setCustoMaoDeObra(f.custo_estimado_mo || 4.5);
                setMateriais(f.materiais || []);
              }
            }}
            className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-sky-500/20"
          >
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.referencia} - {p.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSalvarFicha} className="space-y-6">
        {/* Top Summary Bar & Cost Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Custo Matéria-Prima / Insumos
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatBRL(totalCustoMP)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tecidos com quebra + aviamentos</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Custo Mão de Obra / Facção
            </span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.1"
                value={custoMaoDeObra}
                onChange={(e) => setCustoMaoDeObra(Number(e.target.value))}
                className="text-xl font-bold text-slate-900 p-1 bg-slate-50 border border-slate-200 rounded w-28 focus:ring-2 focus:ring-sky-500/20"
              />
              <span className="text-xs text-slate-500 font-medium">R$ / peça</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Corte + Costura + Acabamento</p>
          </div>

          <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider">
                Custo Padrão Total
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                Margem: {formatNumber(margemBrutaEstimada, 1)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {formatBRL(totalCustoPeca)}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Venda sugerida: {formatBRL(produtoAtual?.preco_venda_sugerido || 0)}
            </p>
          </div>
        </div>

        {/* Section 1: Materiais e Consumos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-sky-600" />
                Estrutura de Materiais (BOM Têxtil)
              </h2>
              <p className="text-xs text-slate-500">
                Consumo líquido por peça e margem técnica de perda por encaixe no corte
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddMaterial}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Insumo
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Aplicação / Parte</th>
                  <th className="py-2.5 px-3 font-semibold">Insumo do Catálogo</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Consumo Líquido</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Perda Corte (%)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Consumo Bruto</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Custo Unit.</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Subtotal / Pç</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {materiaisCalculados.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={m.aplicacao}
                        onChange={(e) => {
                          const updated = [...materiais];
                          updated[idx].aplicacao = e.target.value;
                          setMateriais(updated);
                        }}
                        className="w-full p-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={m.item_catalogo_id}
                        onChange={(e) => {
                          const updated = [...materiais];
                          const cat = itensCatalogo.find((i) => i.id === e.target.value);
                          updated[idx].item_catalogo_id = e.target.value;
                          if (cat) updated[idx].custo_unitario_base = cat.custo_medio_unitario;
                          setMateriais(updated);
                        }}
                        className="w-full p-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
                      >
                        {itensCatalogo.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.codigo} - {cat.descricao} ({cat.unidade_medida})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="0.001"
                        value={m.consumo_por_peca}
                        onChange={(e) => {
                          const updated = [...materiais];
                          updated[idx].consumo_por_peca = Number(e.target.value);
                          setMateriais(updated);
                        }}
                        className="w-20 p-1 bg-white border border-slate-200 rounded text-xs text-right font-medium"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="0.1"
                        value={m.percentual_perda}
                        onChange={(e) => {
                          const updated = [...materiais];
                          updated[idx].percentual_perda = Number(e.target.value);
                          setMateriais(updated);
                        }}
                        className="w-16 p-1 bg-white border border-slate-200 rounded text-xs text-right"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      {formatNumber(m.consumo_com_perda, 3)} {m.unidade_medida}
                    </td>
                    <td className="py-2.5 px-3 text-right">{formatBRL(m.custo_unitario_base)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatBRL(m.custo_total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(m.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Instruções Operacionais de Corte & Costura */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
            Instruções Operacionais para Chão de Fábrica
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Instruções de Enfesto & Corte
              </label>
              <textarea
                rows={3}
                value={obsCorte}
                onChange={(e) => setObsCorte(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                placeholder="Orientação de sentido do fio, descanso de malha, tipo de lâmina..."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Instruções de Costura & Montagem
              </label>
              <textarea
                rows={3}
                value={obsCostura}
                onChange={(e) => setObsCostura(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                placeholder="Aparelhos de gola, tipo de ponto, reforço ombro a ombro..."
              />
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {salvoFeedback ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Ficha Técnica salva com sucesso!
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Versão {versao} • Status: {status}
            </span>
          )}

          <div className="flex items-center gap-3">
            <Link
              href="/produtos"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Voltar
            </Link>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Salvar Versão da Ficha Técnica
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
