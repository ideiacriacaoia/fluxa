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
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Shirt className="w-5 h-5 text-brand-primary" />
            Produtos & Matriz de Grade
          </h1>
          <p className="text-xs text-text-muted">
            Cadastre modelos, configure a matriz de grade (cor x tamanho) e acesse suas Fichas Técnicas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/produtos/ficha-tecnica"
            className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-primary" />
            Editor de Ficha Técnica
          </Link>
          <button
            onClick={() => setModalNovo(true)}
            className="px-3.5 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Produto
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por referência (ex: CAM-BASIC-01), nome do modelo ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {produtosFiltrados.map((produto) => {
          const ficha = fichasTecnicas.find((f) => f.produto_id === produto.id);

          return (
            <div
              key={produto.id}
              className="bg-surface rounded-2xl border border-border-main shadow-sm p-6 space-y-4 hover:border-brand-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded border border-brand-primary/20">
                    Ref: {produto.referencia}
                  </span>
                  <span className="text-xs font-bold text-text-main bg-surface-hover px-2.5 py-1 rounded border border-border-main">
                    {formatBRL(produto.preco_venda_sugerido || 0)}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-text-main">{produto.nome}</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Categoria: <strong className="text-text-main">{produto.categoria}</strong> • Coleção:{" "}
                    <strong className="text-text-main">{produto.colecao}</strong>
                  </p>
                  {produto.descricao && (
                    <p className="text-xs text-text-muted mt-2 bg-surface-hover p-2.5 rounded-lg border border-border-subtle">
                      {produto.descricao}
                    </p>
                  )}
                </div>

                {/* Grade Matrix View */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-text-dim uppercase tracking-wider block">
                    Matriz de Grade Ativa ({produto.variacoes?.length || 0} SKUs)
                  </span>

                  <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-hover p-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {produto.variacoes?.slice(0, 8).map((v) => (
                        <div
                          key={v.id}
                          className="bg-surface p-2 rounded border border-border-main text-[11px] flex items-center justify-between"
                        >
                          <span className="font-semibold text-text-main">
                            {v.cor_nome} - {v.tamanho}
                          </span>
                          <span className="font-bold text-brand-primary">{v.estoque_atual || 0} pçs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ficha Técnica Summary */}
                {ficha && (
                  <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-text-main block">
                        Ficha Técnica v{ficha.versao} ({ficha.status})
                      </span>
                      <span className="text-[11px] text-brand-primary">
                        {ficha.materiais?.length || 0} materiais cadastrados
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-text-dim block">Custo Estimado</span>
                      <strong className="text-xs font-bold text-brand-primary">
                        {formatBRL(ficha.custo_estimado_total || 0)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <Link
                  href={`/produtos/ficha-tecnica?produto_id=${produto.id}`}
                  className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Editar Ficha Técnica
                </Link>

                <Link
                  href={`/producao?produto_id=${produto.id}`}
                  className="px-3 py-1.5 bg-surface-hover hover:bg-border-main text-text-main font-semibold rounded-lg text-xs transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <Shirt className="w-5 h-5 text-brand-primary" />
                Cadastrar Novo Modelo / Produto
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarProduto} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Referência / Código *</label>
                  <input
                    type="text"
                    placeholder="Ex: CAM-REGULAR-03"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs font-bold text-text-main focus:ring-2 focus:ring-brand-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Preço Sugerido de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-text-main mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    placeholder="Ex: Camiseta Masculina Gola V Meia Malha"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Categoria</label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Coleção</label>
                  <input
                    type="text"
                    value={colecao}
                    onChange={(e) => setColecao(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-text-main mb-1">Cores da Grade (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={gradeCores}
                    onChange={(e) => setGradeCores(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-text-main mb-1">Tamanhos da Grade (separados por vírgula)</label>
                  <input
                    type="text"
                    value={gradeTamanhos}
                    onChange={(e) => setGradeTamanhos(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-text-main mb-1">Descrição / Instruções de Modelagem</label>
                  <textarea
                    rows={2}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full p-2 bg-surface-hover border border-border-main rounded-lg text-xs text-text-main focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
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
