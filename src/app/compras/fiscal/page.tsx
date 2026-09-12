"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Copy,
  Printer,
  FileCode,
  ShieldCheck,
  FileText,
  TrendingUp,
  AlertTriangle,
  Receipt,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatDate, formatDateTime, formatCNPJ, validarDocumentoReceita, cn } from "@/lib/utils";

export default function FiscalPage() {
  const {
    notasFiscais,
    empresa,
    itensCatalogo,
    emitirNotaFiscal,
    cancelarNotaFiscal,
  } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [modalNovaNFe, setModalNovaNFe] = useState(false);
  const [modalDanfe, setModalDanfe] = useState<any | null>(null);
  const [modalXml, setModalXml] = useState<any | null>(null);
  const [modalCancelar, setModalCancelar] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [chaveCopiada, setChaveCopiada] = useState<string | null>(null);
  const [mostrarValidadorCnpj, setMostrarValidadorCnpj] = useState(false);

  // Testador de CNPJ Alfanumérico interativo
  const [testeDoc, setTesteDoc] = useState("12.ABC.345/0001-90");
  const resultadoValidacao = validarDocumentoReceita(testeDoc);

  // Form Nova NF-e
  const [tipoNota, setTipoNota] = useState<"entrada_compra" | "saida_venda" | "devolucao">("entrada_compra");
  const [naturezaOp, setNaturezaOp] = useState("Compra para Industrialização");
  const [destRazao, setDestRazao] = useState("Têxtil Blumenau Ltda");
  const [destDoc, setDestDoc] = useState("12.ABC.345/0001-90"); // Padrão Alfanumérico
  const [destCidade, setDestCidade] = useState("Blumenau");
  const [destUf, setDestUf] = useState("SC");
  const [itemId, setItemId] = useState(itensCatalogo[0]?.id || "");
  const [qtd, setQtd] = useState(100);
  const [precoUnit, setPrecoUnit] = useState(38.5);
  const [aliquotaIcms, setAliquotaIcms] = useState(12);

  const notasFiltradas = notasFiscais.filter((n) => {
    const matchBusca =
      n.numero_nota.toString().includes(busca) ||
      n.chave_acesso_44.includes(busca) ||
      n.emitente_razao.toLowerCase().includes(busca.toLowerCase()) ||
      n.destinatario_razao.toLowerCase().includes(busca.toLowerCase()) ||
      n.destinatario_doc.includes(busca);
    const matchTipo = filtroTipo === "todos" || n.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  const totalNotas = notasFiscais.length;
  const notasAutorizadas = notasFiscais.filter((n) => n.status === "autorizada").length;
  const valorTotalMovimentado = notasFiscais
    .filter((n) => n.status === "autorizada")
    .reduce((acc, curr) => acc + curr.valor_total_nota, 0);
  const icmsTotalCreditadoDebitado = notasFiscais
    .filter((n) => n.status === "autorizada")
    .reduce((acc, curr) => acc + curr.valor_icms, 0);

  const handleCopiarChave = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setChaveCopiada(chave);
    setTimeout(() => setChaveCopiada(null), 2500);
  };

  const handleEmitirNota = (e: React.FormEvent) => {
    e.preventDefault();
    const itemCat = itensCatalogo.find((i) => i.id === itemId);

    emitirNotaFiscal({
      tipo: tipoNota,
      natureza_operacao: naturezaOp,
      emitente_razao: empresa.nome_fantasia || empresa.razao_social,
      emitente_cnpj: empresa.cnpj,
      destinatario_razao: destRazao,
      destinatario_doc: destDoc,
      destinatario_cidade: destCidade,
      destinatario_uf: destUf,
      itens: [
        {
          codigo_produto: itemCat?.codigo || "PROD-01",
          descricao: itemCat?.descricao || "Insumo Têxtil",
          ncm: itemCat?.tipo === "tecido" ? "6006.21.00" : "9606.21.00",
          cfop: tipoNota === "entrada_compra" ? "1.101" : "5.101",
          unidade: itemCat?.unidade_medida?.toUpperCase() || "UN",
          quantidade: Number(qtd),
          valor_unitario: Number(precoUnit),
          aliquota_icms: Number(aliquotaIcms),
        },
      ],
    });

    setModalNovaNFe(false);
  };

  const handleConfirmarCancelamento = () => {
    if (!modalCancelar || !motivoCancelamento) return;
    cancelarNotaFiscal(modalCancelar, motivoCancelamento);
    setModalCancelar(null);
    setMotivoCancelamento("");
  };

  return (
    <div className="space-y-6">
      {/* Header com 1 ação primária de destaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-primary" />
            Central Fiscal — Emissão de NF-e & Sefaz
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Emissão de NF-e (Modelo 55), validação de CNPJ Alfanumérico da Receita Federal e DANFE.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMostrarValidadorCnpj(!mostrarValidadorCnpj)}
            className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-muted hover:text-text-main rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <span>Validador CNPJ RFB</span>
            {mostrarValidadorCnpj ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setModalNovaNFe(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Emitir Nova NF-e
          </button>
        </div>
      </div>

      {/* Validador de CNPJ Alfanumérico Colapsável */}
      {mostrarValidadorCnpj && (
        <div className="p-4 bg-surface rounded-2xl border border-brand-primary/30 shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-text-main">
                  Validador Oficial de CNPJ Alfanumérico (IN RFB nº 2.229/2024)
                </h3>
                <p className="text-[11px] text-text-muted">
                  Validação de documentos de 14 caracteres contendo letras e números sem truncamento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testeDoc}
                onChange={(e) => setTesteDoc(e.target.value)}
                placeholder="Digite CNPJ..."
                className="bg-surface-hover/70 border border-border-main text-xs font-mono font-bold px-3 py-1.5 rounded-xl text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  resultadoValidacao.valido
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                {resultadoValidacao.valido ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Válido ({resultadoValidacao.tipo.toUpperCase()})</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Inválido</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Espaçados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface rounded-2xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Notas Emitidas</span>
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-text-main font-mono mt-2">{totalNotas}</p>
          <span className="text-[11px] text-text-dim">Registros fiscais</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Autorizadas Sefaz</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-2">{notasAutorizadas}</p>
          <span className="text-[11px] text-text-dim">Status 100 - Homologadas</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Volume Fiscal Total</span>
            <div className="p-2 bg-accent-teal/10 rounded-xl text-accent-teal">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-accent-teal font-mono mt-2">{formatBRL(valorTotalMovimentado)}</p>
          <span className="text-[11px] text-text-dim">Total de produtos e notas</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">ICMS Destacado</span>
            <div className="p-2 bg-accent-gold/10 rounded-xl text-accent-gold">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-accent-gold font-mono mt-2">{formatBRL(icmsTotalCreditadoDebitado)}</p>
          <span className="text-[11px] text-text-dim">Créditos e débitos apurados</span>
        </div>
      </div>

      {/* Tabela de Notas Fiscais Enxuta */}
      <div className="p-5 bg-surface rounded-2xl border border-border-main shadow-xs space-y-4">
        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por NF, chave, parceiro..."
              className="w-full bg-surface-hover/70 border border-border-main text-xs rounded-xl pl-8 pr-3 py-1.5 text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["todos", "entrada_compra", "saida_venda", "devolucao"].map((tp) => (
              <button
                key={tp}
                onClick={() => setFiltroTipo(tp)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filtroTipo === tp
                    ? "bg-brand-primary text-white font-semibold shadow-xs"
                    : "bg-surface-hover text-text-muted hover:text-text-main"
                }`}
              >
                {tp === "todos"
                  ? "Todas"
                  : tp === "entrada_compra"
                  ? "Entradas"
                  : tp === "saida_venda"
                  ? "Saídas / Vendas"
                  : "Devoluções"}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela Limpa */}
        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-hover text-text-muted border-b border-border-subtle">
              <tr>
                <th className="py-2.5 px-3.5 font-semibold">NF-e / Emissão</th>
                <th className="py-2.5 px-3.5 font-semibold">Operação</th>
                <th className="py-2.5 px-3.5 font-semibold">Parceiro & Documento</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">Valor Total</th>
                <th className="py-2.5 px-3.5 font-semibold text-center">Status Sefaz</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-main">
              {notasFiltradas.map((nf) => {
                const isEntrada = nf.tipo.startsWith("entrada");
                return (
                  <tr key={nf.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-text-main">
                          NF-e #{nf.numero_nota}
                        </span>
                        <span className="text-[10px] bg-surface-hover px-1.5 py-0.5 rounded border border-border-subtle text-text-dim">
                          S{nf.serie}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-dim block mt-0.5">
                        {formatDate(nf.data_emissao)}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 font-medium">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isEntrada ? "bg-sky-500" : "bg-emerald-500"}`} />
                      <span className="text-text-main">{nf.natureza_operacao}</span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-text-main">
                        {isEntrada ? nf.emitente_razao : nf.destinatario_razao}
                      </div>
                      <span className="text-[11px] font-mono text-text-dim">
                        {formatCNPJ(isEntrada ? nf.emitente_cnpj : nf.destinatario_doc)}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      <span className="font-bold font-mono text-text-main block">{formatBRL(nf.valor_total_nota)}</span>
                      <span className="text-[10px] text-text-dim font-mono">ICMS: {formatBRL(nf.valor_icms)}</span>
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          nf.status === "autorizada"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : nf.status === "cancelada"
                            ? "bg-rose-500/15 text-rose-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {nf.status === "autorizada" && <CheckCircle2 className="w-3 h-3" />}
                        {nf.status === "cancelada" && <XCircle className="w-3 h-3" />}
                        {nf.status === "autorizada" ? "100 - Autorizada" : nf.status === "cancelada" ? "Cancelada" : "Processando"}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopiarChave(nf.chave_acesso_44)}
                          title="Copiar Chave de Acesso (44 dígitos)"
                          className="p-1.5 bg-surface hover:bg-surface-hover text-text-dim hover:text-brand-primary rounded-lg border border-border-main transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setModalDanfe(nf)}
                          title="Visualizar DANFE"
                          className="px-2.5 py-1 bg-surface hover:bg-surface-hover text-text-main rounded-lg border border-border-main text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          DANFE
                        </button>

                        <button
                          onClick={() => setModalXml(nf)}
                          title="Ver XML"
                          className="px-2 py-1 bg-surface hover:bg-surface-hover text-text-dim hover:text-text-main rounded-lg border border-border-main text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FileCode className="w-3 h-3" />
                          XML
                        </button>

                        {nf.status === "autorizada" && (
                          <button
                            onClick={() => setModalCancelar(nf.id)}
                            title="Cancelar NF-e na Sefaz"
                            className="p-1.5 text-text-dim hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova NF-e */}
      {modalNovaNFe && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border-main space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-primary" />
                Emissão de NF-e Eletrônica
              </h2>
              <button
                onClick={() => setModalNovaNFe(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEmitirNota} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Tipo de Operação *</label>
                  <select
                    value={tipoNota}
                    onChange={(e) => setTipoNota(e.target.value as any)}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                  >
                    <option value="entrada_compra">Entrada / Compra</option>
                    <option value="saida_venda">Saída / Venda</option>
                    <option value="devolucao">Devolução</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Natureza da Operação *</label>
                  <input
                    type="text"
                    value={naturezaOp}
                    onChange={(e) => setNaturezaOp(e.target.value)}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Destinatário / Razão Social *</label>
                  <input
                    type="text"
                    value={destRazao}
                    onChange={(e) => setDestRazao(e.target.value)}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">CNPJ / CPF Destinatário *</label>
                  <input
                    type="text"
                    value={destDoc}
                    onChange={(e) => setDestDoc(e.target.value)}
                    placeholder="Aceita CNPJ Alfanumérico..."
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border-subtle">
                <div className="col-span-2">
                  <label className="block font-semibold text-text-main mb-1">Item do Catálogo *</label>
                  <select
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                  >
                    {itensCatalogo.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.codigo} - {cat.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Quantidade *</label>
                  <input
                    type="number"
                    value={qtd}
                    onChange={(e) => setQtd(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Preço Unitário (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precoUnit}
                    onChange={(e) => setPrecoUnit(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Alíquota ICMS (%)</label>
                  <input
                    type="number"
                    value={aliquotaIcms}
                    onChange={(e) => setAliquotaIcms(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalNovaNFe(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold shadow-sm cursor-pointer"
                >
                  Transmitir para a SEFAZ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DANFE */}
      {modalDanfe && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-brand-primary" />
                DANFE Simplificado — NF-e #{modalDanfe.numero_nota}
              </h3>
              <button onClick={() => setModalDanfe(null)} className="text-text-dim hover:text-text-main p-1">
                ✕
              </button>
            </div>

            <div className="p-4 bg-surface-hover/50 rounded-xl border border-border-subtle space-y-3 text-xs">
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <div>
                  <strong className="text-text-main block">{modalDanfe.emitente_razao}</strong>
                  <span className="text-text-dim font-mono">{formatCNPJ(modalDanfe.emitente_cnpj)}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-text-main block">NF-e #{modalDanfe.numero_nota}</span>
                  <span className="text-text-dim">Série {modalDanfe.serie}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-text-dim block mb-0.5 font-semibold">Chave de Acesso Sefaz</span>
                <span className="font-mono text-[11px] text-text-main block bg-surface p-2 rounded-lg border border-border-subtle select-all">
                  {modalDanfe.chave_acesso_44}
                </span>
              </div>

              <div className="flex justify-between items-center bg-surface p-3 rounded-xl border border-border-main font-bold text-xs">
                <span>VALOR TOTAL DA NOTA FISCAL:</span>
                <span className="text-sm text-brand-primary font-mono">{formatBRL(modalDanfe.valor_total_nota)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir DANFE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XML */}
      {modalXml && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-brand-primary" />
                XML Oficial da NF-e (Layout 4.00)
              </h3>
              <button onClick={() => setModalXml(null)} className="text-text-dim hover:text-text-main p-1">
                ✕
              </button>
            </div>

            <pre className="p-4 bg-surface-hover/70 rounded-xl border border-border-subtle text-[11px] font-mono text-text-main overflow-x-auto max-h-80 whitespace-pre-wrap">
              {modalXml.xml_conteudo}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => handleCopiarChave(modalXml.xml_conteudo)}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar XML
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancelar Nota */}
      {modalCancelar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Cancelar NF-e na SEFAZ
              </h3>
              <button onClick={() => setModalCancelar(null)} className="text-text-dim hover:text-text-main p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-text-muted">
                O cancelamento será transmitido para a SEFAZ estadual. O prazo legal padrão é de até 24h após a autorização.
              </p>

              <div>
                <label className="block font-semibold text-text-main mb-1">Justificativa do Cancelamento</label>
                <textarea
                  rows={3}
                  required
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Ex: Erro na quantidade faturada de tecido..."
                  className="w-full bg-surface-hover/70 border border-border-main rounded-xl p-2.5 text-text-main"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalCancelar(null)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover text-text-main rounded-xl border border-border-main cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarCancelamento}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
