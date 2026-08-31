"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  FileText,
  Building2,
  PackageCheck,
  ChevronRight,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatDate, formatNumber } from "@/lib/utils";

export default function ComprasPage() {
  const { pedidosCompra, fornecedores, itensCatalogo, addPedidoCompra, updateStatusPedidoCompra } =
    useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [modalNovo, setModalNovo] = useState(false);

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
    const config: Record<string, { bg: string; text: string; label: string }> = {
      rascunho: { bg: "bg-slate-100", text: "text-slate-700", label: "Rascunho" },
      cotacao: { bg: "bg-blue-50", text: "text-blue-700", label: "Cotação" },
      aprovado: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Aprovado / Aguardando" },
      parcial: { bg: "bg-amber-50", text: "text-amber-700", label: "Recebido Parcial" },
      recebido: { bg: "bg-teal-50", text: "text-teal-700", label: "Totalmente Recebido" },
      cancelado: { bg: "bg-rose-50", text: "text-rose-700", label: "Cancelado" },
    };
    const c = config[status] || config.rascunho;
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${c.bg} ${c.text}`}>
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
            <ShoppingCart className="w-5 h-5 text-sky-600" />
            Pedidos de Compra (Tecidos & Aviamentos)
          </h1>
          <p className="text-xs text-slate-500">
            Gerencie cotações, ordens de compra e acompanhe a previsão de entrega dos fornecedores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/compras/recebimento"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <PackageCheck className="w-4 h-4 text-sky-600" />
            Conferência / Recebimento de Lote
          </Link>
          <button
            onClick={() => setModalNovo(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Pedido de Compra
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número do pedido ou fornecedor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
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
            <option value="aprovado">Aprovado</option>
            <option value="parcial">Parcial</option>
            <option value="recebido">Recebido</option>
            <option value="cotacao">Cotação</option>
            <option value="rascunho">Rascunho</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {pedidosFiltrados.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all"
          >
            <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                  Pedido #{pedido.numero_pedido}
                </span>
                <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {pedido.fornecedor_nome}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {statusBadge(pedido.status)}
                <span className="text-xs font-bold text-slate-900">
                  {formatBRL(pedido.valor_total || 0)}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Data de Emissão</span>
                  <span className="font-medium text-slate-700">{formatDate(pedido.data_emissao || pedido.created_at)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Previsão de Entrega</span>
                  <span className="font-medium text-slate-700">
                    {formatDate(pedido.previsao_entrega || pedido.data_prevista_entrega || "")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Condição Pagto</span>
                  <span className="font-medium text-slate-700">{pedido.condicao_pagamento || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total de Itens</span>
                  <span className="font-medium text-slate-700">{pedido.itens?.length || 0} item(ns)</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/60 text-slate-500">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Código / Insumo</th>
                      <th className="py-2 px-3 font-semibold">Cor / Ref</th>
                      <th className="py-2 px-3 font-semibold text-right">Qtd Pedida</th>
                      <th className="py-2 px-3 font-semibold text-right">Qtd Entregue</th>
                      <th className="py-2 px-3 font-semibold text-right">Preço Unit.</th>
                      <th className="py-2 px-3 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pedido.itens?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3">
                          <strong className="text-slate-900">{item.item_codigo}</strong> -{" "}
                          {item.item_descricao}
                        </td>
                        <td className="py-2 px-3">{item.cor_referencia || "-"}</td>
                        <td className="py-2 px-3 text-right font-medium">
                          {formatNumber(item.quantidade_pedida ?? item.quantidade ?? 0, 1)} {item.unidade_medida || item.unidade || "kg"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`font-semibold ${
                              (item.quantidade_entregue || 0) >= (item.quantidade_pedida || item.quantidade || 0)
                                ? "text-emerald-600"
                                : (item.quantidade_entregue || 0) > 0
                                ? "text-amber-600"
                                : "text-slate-400"
                            }`}
                          >
                            {formatNumber(item.quantidade_entregue || 0, 1)} {item.unidade_medida || item.unidade || "kg"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">{formatBRL(item.preco_unitario || 0)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {formatBRL(item.valor_total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pedido.status !== "recebido" && pedido.status !== "cancelado" && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Link
                    href={`/compras/recebimento?pedido_id=${pedido.id}`}
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    Receber Mercadoria & Gerar Lote
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Pedido */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-sky-600" />
                Novo Pedido de Compra
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarPedido} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fornecedor *</label>
                  <select
                    value={fornecedorId}
                    onChange={(e) => setFornecedorId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
                  <label className="block font-semibold text-slate-700 mb-1">Previsão de Entrega</label>
                  <input
                    type="date"
                    value={dataPrevista}
                    onChange={(e) => setDataPrevista(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condição de Pagamento</label>
                  <input
                    type="text"
                    placeholder="Ex: 28/42/56 DDL"
                    value={condicaoPagto}
                    onChange={(e) => setCondicaoPagto(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Observações</label>
                  <input
                    type="text"
                    placeholder="Instruções para o fornecedor..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              {/* Dynamic Items */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Itens do Pedido</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sky-600 hover:text-sky-700 font-semibold text-xs flex items-center gap-1"
                  >
                    + Adicionar Insumo
                  </button>
                </div>

                {itens.map((it, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Insumo</label>
                      <select
                        value={it.item_catalogo_id}
                        onChange={(e) => {
                          const updated = [...itens];
                          const cat = itensCatalogo.find((i) => i.id === e.target.value);
                          updated[idx].item_catalogo_id = e.target.value;
                          if (cat) updated[idx].preco_unitario = cat.custo_medio_unitario;
                          setItens(updated);
                        }}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        {itensCatalogo.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.codigo} - {cat.descricao} ({cat.unidade_medida})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qtd</label>
                      <input
                        type="number"
                        step="0.1"
                        value={it.quantidade_pedida}
                        onChange={(e) => {
                          const updated = [...itens];
                          updated[idx].quantidade_pedida = Number(e.target.value);
                          setItens(updated);
                        }}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Preço Unit. (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={it.preco_unitario}
                        onChange={(e) => {
                          const updated = [...itens];
                          updated[idx].preco_unitario = Number(e.target.value);
                          setItens(updated);
                        }}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
