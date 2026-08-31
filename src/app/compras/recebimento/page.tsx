"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PackagePlus,
  QrCode,
  FileCheck,
  CheckCircle2,
  Boxes,
  ArrowLeft,
  Sparkles,
  Calculator,
  Scale,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import {
  calcularRendimentoTecido,
  converterKgParaMetros,
  formatBRL,
  formatNumber,
  formatDate,
} from "@/lib/utils";

export default function RecebimentoMercadoriaPage() {
  const {
    pedidosCompra,
    fornecedores,
    itensCatalogo,
    depositos,
    receberLoteMercadoria,
    lotes,
  } = useTextilStore();

  const [pedidoId, setPedidoId] = useState<string>("");
  const [fornecedorId, setFornecedorId] = useState<string>(fornecedores[0]?.id || "");
  const [itemId, setItemId] = useState<string>(itensCatalogo[0]?.id || "");
  const [depositoId, setDepositoId] = useState<string>(depositos[0]?.id || "");

  // Campos da Conferência Física
  const [notaFiscal, setNotaFiscal] = useState<string>("NF-10580");
  const [chaveNFe, setChaveNFe] = useState<string>("");
  const [loteFornecedor, setLoteFornecedor] = useState<string>("TB-9950");
  const [corNome, setCorNome] = useState<string>("Preto Reativo");
  const [corCodigo, setCorCodigo] = useState<string>("#111111");
  const [larguraReal, setLarguraReal] = useState<number>(1.82);
  const [gramaturaReal, setGramaturaReal] = useState<number>(168.0);
  const [quantidade, setQuantidade] = useState<number>(200.0);
  const [custoUnitario, setCustoUnitario] = useState<number>(38.5);
  const [observacoes, setObservacoes] = useState<string>("");

  const [sucessoModal, setSucessoModal] = useState<boolean>(false);
  const [loteCriadoCodigo, setLoteCriadoCodigo] = useState<string>("");

  const selectedItem = itensCatalogo.find((i) => i.id === itemId);
  const isTecido = selectedItem?.tipo === "tecido";

  // Cálculo de rendimento automático
  const rendimentoCalculado =
    isTecido && gramaturaReal > 0 && larguraReal > 0
      ? calcularRendimentoTecido(gramaturaReal, larguraReal)
      : 0;

  const metrosLinearesEstimados =
    rendimentoCalculado > 0 ? converterKgParaMetros(quantidade, rendimentoCalculado) : 0;

  // Sugestão de código de lote único
  const gerarSugestaoLote = () => {
    const ano = new Date().getFullYear();
    const prefix = isTecido ? "TEC" : "AV";
    const random = Math.floor(1000 + Math.random() * 9000);
    return `LT-${ano}-${prefix}-${random}`;
  };

  const [codigoLote, setCodigoLote] = useState<string>(gerarSugestaoLote());

  const handleSubmeterRecebimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !fornecedorId || !depositoId || !notaFiscal || !codigoLote) return;

    receberLoteMercadoria({
      pedido_compra_id: pedidoId || undefined,
      item_catalogo_id: itemId,
      fornecedor_id: fornecedorId,
      nota_fiscal: notaFiscal,
      chave_nfe: chaveNFe,
      codigo_lote: codigoLote,
      lote_fornecedor: loteFornecedor,
      cor_nome: corNome,
      cor_codigo: corCodigo,
      largura_real_m: isTecido ? Number(larguraReal) : undefined,
      gramatura_real: isTecido ? Number(gramaturaReal) : undefined,
      quantidade: Number(quantidade),
      unidade_medida: selectedItem?.unidade_medida || "kg",
      custo_unitario: Number(custoUnitario),
      deposito_destino_id: depositoId,
      observacoes: observacoes,
    });

    setLoteCriadoCodigo(codigoLote);
    setSucessoModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/compras"
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para Pedidos de Compra
          </Link>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-sky-600" />
            Conferência & Recebimento de Lote
          </h1>
          <p className="text-xs text-slate-500">
            Dê entrada em matérias-primas com conferência física (largura, gramatura, peso) e gere o código de lote rastreável.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmeterRecebimento} className="space-y-6">
        {/* Step 1: Documento Fiscal & Origem */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              Dados da Nota Fiscal & Fornecedor
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número da Nota Fiscal (NF-e) *
              </label>
              <input
                type="text"
                value={notaFiscal}
                onChange={(e) => setNotaFiscal(e.target.value)}
                placeholder="Ex: NF-10580"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fornecedor Emitente *
              </label>
              <select
                value={fornecedorId}
                onChange={(e) => setFornecedorId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500/20"
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
              <label className="block font-semibold text-slate-700 mb-1">
                Vincular a Pedido de Compra (Opcional)
              </label>
              <select
                value={pedidoId}
                onChange={(e) => setPedidoId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">Nenhum (Entrada Avulsa)</option>
                {pedidosCompra.map((pc) => (
                  <option key={pc.id} value={pc.id}>
                    Pedido #{pc.numero_pedido || ""} - {pc.fornecedor_nome} ({formatDate(pc.data_emissao || pc.created_at)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Insumo & Especificações Técnicas Têxteis */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              Conferência Física do Tecido / Aviamento
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Insumo / Matéria-Prima *
              </label>
              <select
                value={itemId}
                onChange={(e) => {
                  setItemId(e.target.value);
                  const item = itensCatalogo.find((i) => i.id === e.target.value);
                  if (item) {
                    setCustoUnitario(item.custo_medio_unitario);
                    if (item.gramatura_g_m2) setGramaturaReal(item.gramatura_g_m2);
                    if (item.largura_padrao_m) setLarguraReal(item.largura_padrao_m);
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500/20"
                required
              >
                {itensCatalogo.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.codigo} - {cat.descricao} ({cat.unidade_medida})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Depósito de Entrada *
              </label>
              <select
                value={depositoId}
                onChange={(e) => setDepositoId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500/20"
                required
              >
                {depositos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome} ({d.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cor / Tonalidade Recebida
              </label>
              <input
                type="text"
                value={corNome}
                onChange={(e) => setCorNome(e.target.value)}
                placeholder="Ex: Preto Reativo, Off-White"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lote Original do Fornecedor
              </label>
              <input
                type="text"
                value={loteFornecedor}
                onChange={(e) => setLoteFornecedor(e.target.value)}
                placeholder="Ex: TB-9821"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantidade Conferida ({selectedItem?.unidade_medida || "kg"}) *
              </label>
              <input
                type="number"
                step="0.01"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                required
              />
            </div>

            {isTecido && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Largura Real Medida (metros)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={larguraReal}
                    onChange={(e) => setLarguraReal(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gramatura Real (g/m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={gramaturaReal}
                    onChange={(e) => setGramaturaReal(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Custo Unitário (R$ / {selectedItem?.unidade_medida})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoUnitario}
                    onChange={(e) => setCustoUnitario(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </>
            )}
          </div>

          {/* Real-time Textile Yield Calculation Card */}
          {isTecido && (
            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-sky-950">
                    Rendimento Real Calculado: {formatNumber(rendimentoCalculado, 3)} m/kg
                  </p>
                  <p className="text-[11px] text-sky-800">
                    Fórmula têxtil: 1.000 / ({gramaturaReal} g/m² × {larguraReal} m)
                  </p>
                </div>
              </div>

              <div className="bg-white px-3.5 py-2 rounded-lg border border-sky-200 text-right">
                <span className="text-[11px] text-slate-500 block">Metragem Estimada</span>
                <span className="text-sm font-bold text-slate-900">
                  ≈ {formatNumber(metrosLinearesEstimados, 1)} metros lineares
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Código de Lote de Rastreabilidade */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              Geração da Rastreabilidade do Lote
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Código do Lote Interno (Rastreio) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoLote}
                  onChange={(e) => setCodigoLote(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-sky-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setCodigoLote(gerarSugestaoLote())}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Gerar Novo
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Este código acompanhará o tecido no corte e na Ordem de Produção (OP).
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Observações do Recebimento / Laudo
              </label>
              <input
                type="text"
                placeholder="Ex: Tonalidade homogênea, sem furos ou defeitos de tecelagem."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/compras"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Concluir Recebimento & Lançar no Estoque
          </button>
        </div>
      </form>

      {/* Modal de Sucesso */}
      {sucessoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Recebimento Concluído com Sucesso!
              </h3>
              <p className="text-xs text-slate-500">
                O lote foi registrado e o saldo já está disponível no almoxarifado com auditoria em tempo real.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1 font-mono">
              <div>
                <span className="text-slate-400">Lote: </span>
                <strong className="text-sky-700">{loteCriadoCodigo}</strong>
              </div>
              <div>
                <span className="text-slate-400">Qtd Lançada: </span>
                <strong className="text-slate-900">{quantidade} {selectedItem?.unidade_medida}</strong>
              </div>
              <div>
                <span className="text-slate-400">Nota Fiscal: </span>
                <strong className="text-slate-900">{notaFiscal}</strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/estoque/lotes"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold"
              >
                Ver Lotes no Estoque
              </Link>
              <button
                onClick={() => {
                  setSucessoModal(false);
                  setCodigoLote(gerarSugestaoLote());
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Novo Recebimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
