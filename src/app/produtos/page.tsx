"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shirt,
  Plus,
  Search,
  Layers,
  FileSpreadsheet,
  ArrowUpRight,
  Sparkles,
  Tag,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL } from "@/lib/utils";

export default function ProdutosPage() {
  const { produtos, fichasTecnicas, addProduto } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [modalNovo, setModalNovo] = useState(false);

  // Form state
  const [referencia, setReferencia] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Camisaria Básica");
  const [colecao, setColecao] = useState("Verão 2026/2027");
  const [descricao, setDescricao] = useState("");
  const [precoVenda, setPrecoVenda] = useState(79.9);
  const [gradeCores, setGradeCores] = useState("Preto, Branco, Marinho");
  const [gradeTamanhos, setGradeTamanhos] = useState("P, M, G, GG");

  const produtosFiltrados = produtos.filter((p) => {
    return (
      (p.referencia && p.referencia.toLowerCase().includes(busca.toLowerCase())) ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.categoria && p.categoria.toLowerCase().includes(busca.toLowerCase()))
    );
  });

  const handleSalvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referencia || !nome) return;

    const cores = gradeCores.split(",").map((c) => c.trim()).filter(Boolean);
    const tamanhos = gradeTamanhos.split(",").map((t) => t.trim()).filter(Boolean);

    const variacoes = [];
    for (const cor of cores) {
      for (const tam of tamanhos) {
        variacoes.push({
          id: `var_${Math.random().toString(36).substr(2, 7)}`,
          produto_id: "",
          sku: `${referencia}-${cor.substring(0, 2).toUpperCase()}-${tam}`,
          cor_nome: cor,
          tamanho: tam,
          estoque_minimo: 20,
          estoque_atual: 0,
          ativo: true,
        });
      }
    }

    addProduto({
      referencia,
      nome,
      categoria,
      colecao,
      descricao,
      preco_venda_sugerido: Number(precoVenda),
      ativo: true,
      variacoes,
    });

    setModalNovo(false);
    setReferencia("");
    setNome("");
    setDescricao("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shirt className="w-5 h-5 text-sky-600" />
            Produtos & Matriz de Grade
          </h1>
          <p className="text-xs text-slate-500">
            Cadastre modelos, configure a matriz de grade (cor x tamanho) e acesse suas Fichas Técnicas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/produtos/ficha-tecnica"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            Editor de Ficha Técnica
          </Link>
          <button
            onClick={() => setModalNovo(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Produto
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por referência (ex: CAM-BASIC-01), nome do modelo ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {produtosFiltrados.map((produto) => {
          const ficha = fichasTecnicas.find((f) => f.produto_id === produto.id);

          // Matriz de cores e tamanhos únicos
          const coresUnicas = Array.from(new Set(produto.variacoes?.map((v) => v.cor_nome) || []));
          const tamanhosUnicos = Array.from(new Set(produto.variacoes?.map((v) => v.tamanho) || []));

          return (
            <div
              key={produto.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                    Ref: {produto.referencia}
                  </span>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                    {formatBRL(produto.preco_venda_sugerido || 0)}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{produto.nome}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Categoria: <strong>{produto.categoria}</strong> • Coleção:{" "}
                    <strong>{produto.colecao}</strong>
                  </p>
                  {produto.descricao && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {produto.descricao}
                    </p>
                  )}
                </div>

                {/* Grade Matrix View */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Matriz de Grade Ativa ({produto.variacoes?.length || 0} SKUs)
                  </span>

                  <div className="overflow-x-auto rounded-lg border border-slate-100 bg-slate-50 p-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {produto.variacoes?.slice(0, 8).map((v) => (
                        <div
                          key={v.id}
                          className="bg-white p-2 rounded border border-slate-200/80 text-[11px] flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-700">
                            {v.cor_nome} - {v.tamanho}
                          </span>
                          <span className="font-bold text-sky-700">{v.estoque_atual || 0} pçs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ficha Técnica Summary */}
                {ficha && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-950 block">
                        Ficha Técnica v{ficha.versao} ({ficha.status})
                      </span>
                      <span className="text-[11px] text-indigo-700">
                        {ficha.materiais?.length || 0} materiais cadastrados
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-indigo-600 block">Custo Estimado</span>
                      <strong className="text-xs font-bold text-indigo-950">
                        {formatBRL(ficha.custo_estimado_total || 0)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/produtos/ficha-tecnica?produto_id=${produto.id}`}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Editar Ficha Técnica
                </Link>

                <Link
                  href={`/producao?produto_id=${produto.id}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Gerar OP
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Produto */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shirt className="w-5 h-5 text-sky-600" />
                Cadastrar Novo Modelo / Produto
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarProduto} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referência / Código *</label>
                  <input
                    type="text"
                    placeholder="Ex: CAM-REGULAR-03"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preço Sugerido de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    placeholder="Ex: Camiseta Masculina Gola V Meia Malha"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coleção</label>
                  <input
                    type="text"
                    value={colecao}
                    onChange={(e) => setColecao(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Cores da Grade (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={gradeCores}
                    onChange={(e) => setGradeCores(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Tamanhos da Grade (separados por vírgula)</label>
                  <input
                    type="text"
                    value={gradeTamanhos}
                    onChange={(e) => setGradeTamanhos(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Descrição / Instruções de Modelagem</label>
                  <textarea
                    rows={2}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
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
                  Salvar Produto & Gerar Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
