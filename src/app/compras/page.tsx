"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  Clock,
  FileText,
  Building2,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Layers,
  X,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatDate, formatNumber, cn } from "@/lib/utils";
import { KpisEstrategicosCompras } from "@/components/compras/kpis-estrategicos-compras";

export default function ComprasPage() {
  const { pedidosCompra, fornecedores, itensCatalogo, addPedidoCompra } =
    useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [modalNovo, setModalNovo] = useState(false);
  const [pedidosExpandidos, setPedidosExpandidos] = useState<Record<string, boolean>>({});

  // Alterna colapso da tabela de itens de um pedido
  const toggleExpandirPedido = (id: string) => {
    setPedidosExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Form state para novo pedido
  const [fornecedorId, setFornecedorId] = useState(fornecedores[0]?.id || "");
  const [dataPrevista, setDataPrevista] = useState("");
  const [condicaoPagto, setCondicaoPagto] = useState("30 DDL");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<
    { item_catalogo_id: string; cor_referencia: string; quantidade_pedida: number; preco_unitario: number }[]
  >([
    {
      item_catalogo_id: itensCatalogo[0]?.id || "",
      cor_referencia: "Preto",
      quantidade_pedida: 100,
      preco_unitario: itensCatalogo[0]?.custo_medio_unitario || 35,
    },
  ]);

  const pedidosFiltrados = pedidosCompra.filter((p) => {
    const matchBusca =
      (p.numero_pedido || "").toString().includes(busca) ||
      (p.fornecedor_nome && p.fornecedor_nome.toLowerCase().includes(busca.toLowerCase()));
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const handleAddItem = () => {
    setItens([
      ...itens,
      {
        item_catalogo_id: itensCatalogo[0]?.id || "",
        cor_referencia: "",
        quantidade_pedida: 50,
        preco_unitario: itensCatalogo[0]?.custo_medio_unitario || 10,
      },
    ]);
  };

  const handleSalvarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedorId) return;

    const itensCalculados = itens.map((it, idx) => {
      const catItem = itensCatalogo.find((i) => i.id === it.item_catalogo_id);
      return {
        id: `it_${Date.now()}_${idx}`,
        pedido_compra_id: "",
        item_catalogo_id: it.item_catalogo_id,
        item_codigo: catItem?.codigo,
        item_descricao: catItem?.descricao,
        descricao: catItem?.descricao || "Item",
        unidade: catItem?.unidade_medida || "kg",
        unidade_medida: catItem?.unidade_medida || "kg",
        cor_referencia: it.cor_referencia,
        quantidade: Number(it.quantidade_pedida),
        quantidade_pedida: Number(it.quantidade_pedida),
        quantidade_entregue: 0,
        preco_unitario: Number(it.preco_unitario),
        valor_total: Number(it.quantidade_pedida) * Number(it.preco_unitario),
      };
    });

    const valorTotal = itensCalculados.reduce((acc, curr) => acc + curr.valor_total, 0);

    addPedidoCompra({
      fornecedor_id: fornecedorId,
      status: "aprovado",
      data_emissao: new Date().toISOString().split("T")[0],
      previsao_entrega: dataPrevista || undefined,
      data_prevista_entrega: dataPrevista || undefined,
      condicao_pagamento: condicaoPagto,
      valor_total: valorTotal,
      observacoes: observacoes,
      itens: itensCalculados,
    });

    setModalNovo(false);
  };

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string; border: string }> = {
      rascunho: { bg: "bg-surface-hover", text: "text-text-muted", border: "border-border-main", label: "Rascunho" },
      cotacao: { bg: "bg-brand-primary/10", text: "text-brand-primary", border: "border-brand-primary/30", label: "Cotação" },
      aprovado: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30", label: "Aprovado" },
      parcial: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30", label: "Recebido Parcial" },
      recebido: { bg: "bg-teal-500/10", text: "text-teal-500", border: "border-teal-500/30", label: "Recebido" },
      cancelado: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/30", label: "Cancelado" },
    };
    const c = config[status] || config.rascunho;
    return (
      <span className={cn("px-2.5 py-0.5 text-xs font-semibold rounded-full border", c.bg, c.text, c.border)}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com 1 ação primária destacada */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-primary" />
            Pedidos de Compra (Tecidos & Aviamentos)
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Gerencie cotações, ordens de compra e acompanhe a previsão de entrega dos fornecedores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/compras/recebimento"
            className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-muted hover:text-text-main rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <PackageCheck className="w-4 h-4 text-text-dim" />
            Conferência de Lote
          </Link>
          <button
            onClick={() => setModalNovo(true)}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Pedido de Compra
          </button>
        </div>
      </div>

      {/* Painel de KPIs Estratégicos Executivos */}
      <KpisEstrategicosCompras />

      {/* Barra de Filtros Compacta */}
      <div className="bg-surface p-3.5 rounded-2xl border border-border-main shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número do pedido ou fornecedor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-muted font-medium">Status:</span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-surface-hover/70 border border-border-main text-xs rounded-xl px-3 py-1.5 text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="todos">Todos os Status</option>
            <option value="aprovado">Aprovado</option>
            <option value="parcial">Recebido Parcial</option>
            <option value="recebido">Recebido</option>
            <option value="cotacao">Cotação</option>
            <option value="rascunho">Rascunho</option>
          </select>
        </div>
      </div>

      {/* Lista de Pedidos com Acordeão de Itens para Redução de Densidade */}
      <div className="space-y-3">
        {pedidosFiltrados.map((pedido) => {
          const isExpandido = !!pedidosExpandidos[pedido.id];

          return (
            <div
              key={pedido.id}
              className="bg-surface rounded-2xl border border-border-main shadow-xs overflow-hidden hover:border-brand-primary/30 transition-all"
            >
              {/* Linha Principal Escaneável */}
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-[240px]">
                  <span className="text-xs font-bold text-text-main bg-surface-hover px-2.5 py-1 rounded-lg border border-border-main font-mono">
                    #{pedido.numero_pedido}
                  </span>
                  <div>
                    <h3 className="font-semibold text-xs text-text-main flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                      {pedido.fornecedor_nome}
                    </h3>
                    <span className="text-[11px] text-text-dim">
                      Emissão: {formatDate(pedido.data_emissao || pedido.created_at)} • Entrega:{" "}
                      {formatDate(pedido.previsao_entrega || pedido.data_prevista_entrega || "")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-xs font-bold text-text-main font-mono block">
                      {formatBRL(pedido.valor_total || 0)}
                    </span>
                    <span className="text-[10px] text-text-dim">
                      {pedido.condicao_pagamento || "À vista"}
                    </span>
                  </div>

                  {statusBadge(pedido.status)}

                  <div className="flex items-center gap-2">
                    {pedido.status !== "recebido" && pedido.status !== "cancelado" && (
                      <Link
                        href={`/compras/recebimento?pedido_id=${pedido.id}`}
                        className="p-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Receber mercadoria e dar entrada no lote"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Receber</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpandirPedido(pedido.id)}
                      className="p-1.5 bg-surface-hover hover:bg-surface-hover/80 text-text-dim hover:text-text-main rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="text-[11px] font-medium">
                        {pedido.itens?.length || 0} item(ns)
                      </span>
                      {isExpandido ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabela de Itens (Recolhida por padrão) */}
              {isExpandido && (
                <div className="px-4 pb-4 pt-1 border-t border-border-subtle bg-surface-hover/30 animate-in fade-in duration-150">
                  <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface mt-2">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-hover text-text-muted border-b border-border-subtle">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Código / Insumo</th>
                          <th className="py-2 px-3 font-semibold">Cor / Ref</th>
                          <th className="py-2 px-3 font-semibold text-right">Qtd Pedida</th>
                          <th className="py-2 px-3 font-semibold text-right">Qtd Entregue</th>
                          <th className="py-2 px-3 font-semibold text-right">Preço Unit.</th>
                          <th className="py-2 px-3 font-semibold text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle text-text-main">
                        {pedido.itens?.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-hover/50">
                            <td className="py-2 px-3">
                              <strong className="text-text-main">{item.item_codigo}</strong> -{" "}
                              {item.item_descricao}
                            </td>
                            <td className="py-2 px-3">{item.cor_referencia || "-"}</td>
                            <td className="py-2 px-3 text-right font-medium font-mono">
                              {formatNumber(item.quantidade_pedida ?? item.quantidade ?? 0, 1)}{" "}
                              {item.unidade_medida || item.unidade || "kg"}
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              <span
                                className={cn(
                                  "font-semibold",
                                  (item.quantidade_entregue || 0) >=
                                    (item.quantidade_pedida || item.quantidade || 0)
                                    ? "text-emerald-500"
                                    : (item.quantidade_entregue || 0) > 0
                                    ? "text-amber-500"
                                    : "text-text-dim"
                                )}
                              >
                                {formatNumber(item.quantidade_entregue || 0, 1)}{" "}
                                {item.unidade_medida || item.unidade || "kg"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              {formatBRL(item.preco_unitario || 0)}
                            </td>
                            <td className="py-2 px-3 text-right font-bold font-mono text-text-main">
                              {formatBRL(item.valor_total || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Novo Pedido */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-border-main space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-primary" />
                Novo Pedido de Compra
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarPedido} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Fornecedor *</label>
                  <select
                    value={fornecedorId}
                    onChange={(e) => setFornecedorId(e.target.value)}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    required
                  >
                    {fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome_fantasia || f.razao_social} ({f.tipo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Previsão de Entrega</label>
                  <input
                    type="date"
                    value={dataPrevista}
                    onChange={(e) => setDataPrevista(e.target.value)}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Condição de Pagamento</label>
                  <input
                    type="text"
                    placeholder="Ex: 28/42/56 DDL"
                    value={condicaoPagto}
                    onChange={(e) => setCondicaoPagto(e.target.value)}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Observações</label>
                  <input
                    type="text"
                    placeholder="Instruções para o fornecedor..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              {/* Dynamic Items */}
              <div className="space-y-2 pt-3 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-text-main">Itens do Pedido</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-brand-primary hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    + Adicionar Insumo
                  </button>
                </div>

                {itens.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-hover/70 rounded-xl border border-border-main grid grid-cols-1 sm:grid-cols-4 gap-2 items-end"
                  >
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-text-muted mb-1">Insumo</label>
                      <select
                        value={it.item_catalogo_id}
                        onChange={(e) => {
                          const updated = [...itens];
                          const cat = itensCatalogo.find((i) => i.id === e.target.value);
                          updated[idx].item_catalogo_id = e.target.value;
                          if (cat) updated[idx].preco_unitario = cat.custo_medio_unitario;
                          setItens(updated);
                        }}
                        className="w-full p-1.5 bg-surface border border-border-main text-text-main rounded-lg text-xs"
                      >
                        {itensCatalogo.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.codigo} - {cat.descricao} ({cat.unidade_medida})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-text-muted mb-1">Qtd</label>
                      <input
                        type="number"
                        step="0.1"
                        value={it.quantidade_pedida}
                        onChange={(e) => {
                          const updated = [...itens];
                          updated[idx].quantidade_pedida = Number(e.target.value);
                          setItens(updated);
                        }}
                        className="w-full p-1.5 bg-surface border border-border-main text-text-main rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-text-muted mb-1">Preço Unit. (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={it.preco_unitario}
                        onChange={(e) => {
                          const updated = [...itens];
                          updated[idx].preco_unitario = Number(e.target.value);
                          setItens(updated);
                        }}
                        className="w-full p-1.5 bg-surface border border-border-main text-text-main rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold shadow-sm cursor-pointer"
                >
                  Emitir Pedido de Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
