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
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatDate, formatDateTime, formatCNPJ, validarDocumentoReceita } from "@/lib/utils";

export default function FiscalPage() {
  const {
    notasFiscais,
    empresa,
    fornecedores,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-primary" />
            Central Fiscal — Emissão de NF-e & Sefaz
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Emissão de NF-e (Modelo 55), validação de CNPJ Alfanumérico da Receita Federal, consulta de chave e DANFE.
          </p>
        </div>

        <button
          onClick={() => setModalNovaNFe(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Emitir Nova NF-e / NFC-e
        </button>
      </div>

      {/* Box Especial: Validador do Novo Padrão de CNPJ Alfanumérico da Receita Federal */}
      <div className="p-4 bg-surface rounded-xl border border-brand-primary/30 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-text-main">
                Validador Oficial de CNPJ Alfanumérico (Instrução Normativa RFB nº 2.229/2024)
              </h3>
              <p className="text-[11px] text-text-muted">
                O sistema Fluxa Têxtil aceita e valida documentos de 14 caracteres contendo letras e números sem truncamento.
              </p>
            </div>
          </div>

          {/* Teste Rápido */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={testeDoc}
              onChange={(e) => setTesteDoc(e.target.value)}
              placeholder="Digite CNPJ Alfanumérico..."
              className="bg-background border border-border-main text-xs font-mono font-bold px-3 py-1.5 rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                resultadoValidacao.valido
                  ? "bg-status-success/15 text-status-success border border-status-success/30"
                  : "bg-status-danger/15 text-status-danger border border-status-danger/30"
              }`}
            >
              {resultadoValidacao.valido ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Válido ({resultadoValidacao.tipo === "cnpj_alfanumerico" ? "CNPJ Alfanumérico RFB" : resultadoValidacao.tipo.toUpperCase()})
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Documento Inválido</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Notas Fiscais Emitidas</span>
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-main mt-2">{totalNotas}</p>
          <span className="text-[11px] text-text-muted">Total de registros fiscais</span>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Autorizadas Sefaz</span>
            <div className="p-2 bg-status-success/10 rounded-lg text-status-success">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-status-success mt-2">{notasAutorizadas}</p>
          <span className="text-[11px] text-text-muted">Status 100 - Homologadas</span>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Volume Fiscal Total</span>
            <div className="p-2 bg-accent-teal/10 rounded-lg text-accent-teal">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-main mt-2">{formatBRL(valorTotalMovimentado)}</p>
          <span className="text-[11px] text-text-muted">Total de produtos e notas</span>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">ICMS Destacado</span>
            <div className="p-2 bg-accent-gold/10 rounded-lg text-accent-gold">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-accent-gold mt-2">{formatBRL(icmsTotalCreditadoDebitado)}</p>
          <span className="text-[11px] text-text-muted">Créditos e débitos calculados</span>
        </div>
      </div>

      {/* Tabela de Notas Fiscais */}
      <div className="p-5 bg-surface rounded-xl border border-border-main shadow-xs space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por NF, chave, emitente, CNPJ..."
              className="w-full bg-background border border-border-main text-xs rounded-lg pl-8 pr-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["todos", "entrada_compra", "saida_venda", "devolucao"].map((tp) => (
              <button
                key={tp}
                onClick={() => setFiltroTipo(tp)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filtroTipo === tp
                    ? "bg-brand-primary text-brand-foreground font-semibold"
                    : "bg-surface-hover text-text-muted hover:text-text-main"
                }`}
              >
                {tp === "todos"
                  ? "Todas as Operações"
                  : tp === "entrada_compra"
                  ? "Entradas / Compras"
                  : tp === "saida_venda"
                  ? "Saídas / Vendas"
                  : "Devoluções"}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-main text-text-muted font-semibold">
                <th className="py-2.5 px-3">Número / Série</th>
                <th className="py-2.5 px-3">Natureza da Operação</th>
                <th className="py-2.5 px-3">Emitente / Destinatário</th>
                <th className="py-2.5 px-3">CNPJ / CPF</th>
                <th className="py-2.5 px-3">Valor Total</th>
                <th className="py-2.5 px-3">Status Sefaz</th>
                <th className="py-2.5 px-3">Chave de Acesso</th>
                <th className="py-2.5 px-3 text-right">Ações Fiscais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {notasFiltradas.map((nf) => {
                const isEntrada = nf.tipo.startsWith("entrada");
                return (
                  <tr key={nf.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-text-main">
                          NF-e {nf.numero_nota}
                        </span>
                        <span className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border-subtle text-text-dim">
                          Série {nf.serie}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted block mt-0.5">
                        {formatDate(nf.data_emissao)}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-medium text-text-main">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isEntrada ? "bg-sky-500" : "bg-emerald-500"}`} />
                      {nf.natureza_operacao}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-text-main">
                        {isEntrada ? nf.emitente_razao : nf.destinatario_razao}
                      </div>
                      <span className="text-[10px] text-text-muted">
                        {isEntrada ? nf.emitente_uf : `${nf.destinatario_cidade}/${nf.destinatario_uf}`}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-text-main">
                      {formatCNPJ(isEntrada ? nf.emitente_cnpj : nf.destinatario_doc)}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-text-main block">{formatBRL(nf.valor_total_nota)}</span>
                      <span className="text-[10px] text-text-muted">ICMS: {formatBRL(nf.valor_icms)}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          nf.status === "autorizada"
                            ? "bg-status-success/15 text-status-success"
                            : nf.status === "cancelada"
                            ? "bg-status-danger/15 text-status-danger"
                            : "bg-status-warning/15 text-status-warning"
                        }`}
                      >
                        {nf.status === "autorizada" && <CheckCircle2 className="w-3 h-3" />}
                        {nf.status === "cancelada" && <XCircle className="w-3 h-3" />}
                        {nf.status === "autorizada" ? "100 - Autorizada" : nf.status === "cancelada" ? "Cancelada" : "Processando"}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
                        <span className="truncate max-w-[120px]">{nf.chave_acesso_44}</span>
                        <button
                          onClick={() => handleCopiarChave(nf.chave_acesso_44)}
                          title="Copiar Chave Completa (44 dígitos)"
                          className="p-1 hover:bg-background rounded text-text-dim hover:text-brand-primary transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {chaveCopiada === nf.chave_acesso_44 && (
                        <span className="text-[9px] text-status-success font-semibold">Chave copiada!</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setModalDanfe(nf)}
                          title="Visualizar DANFE Simplificado"
                          className="px-2 py-1 bg-surface-hover hover:bg-border-main text-text-main rounded border border-border-main text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                          DANFE
                        </button>

                        <button
                          onClick={() => setModalXml(nf)}
                          title="Ver XML da NF-e"
                          className="px-2 py-1 bg-surface-hover hover:bg-border-main text-text-main rounded border border-border-main text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <FileCode className="w-3 h-3" />
                          XML
                        </button>

                        {nf.status === "autorizada" && (
                          <button
                            onClick={() => setModalCancelar(nf.id)}
                            title="Cancelar NF-e na Sefaz"
                            className="p-1 text-text-dim hover:text-status-danger transition-colors"
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

      {/* MODAL: Nova NF-e */}
      {modalNovaNFe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main">Emissão de Nota Fiscal Eletrônica (Sefaz)</h3>
              <button onClick={() => setModalNovaNFe(false)} className="text-text-dim hover:text-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEmitirNota} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Tipo de Operação</label>
                  <select
                    value={tipoNota}
                    onChange={(e) => setTipoNota(e.target.value as any)}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                  >
                    <option value="entrada_compra">Entrada / Compra de Insumos</option>
                    <option value="saida_venda">Saída / Venda de Produtos</option>
                    <option value="devolucao">Devolução de Mercadoria</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Natureza da Operação</label>
                  <input
                    type="text"
                    required
                    value={naturezaOp}
                    onChange={(e) => setNaturezaOp(e.target.value)}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Razão Social do Parceiro</label>
                <input
                  type="text"
                  required
                  value={destRazao}
                  onChange={(e) => setDestRazao(e.target.value)}
                  className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-text-main mb-1">
                    CNPJ Alfanumérico ou CPF
                  </label>
                  <input
                    type="text"
                    required
                    value={destDoc}
                    onChange={(e) => setDestDoc(e.target.value)}
                    placeholder="Ex: 12.ABC.345/0001-90"
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">UF Destino</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={destUf}
                    onChange={(e) => setDestUf(e.target.value.toUpperCase())}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main font-mono uppercase"
                  />
                </div>
              </div>

              <div className="p-3 bg-surface-hover rounded-xl border border-border-subtle space-y-2">
                <span className="font-semibold text-text-main block">Item Principal da Nota</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <select
                      value={itemId}
                      onChange={(e) => setItemId(e.target.value)}
                      className="w-full bg-background border border-border-main rounded-lg px-2.5 py-1.5 text-text-main"
                    >
                      {itensCatalogo.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.descricao} ({i.codigo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5">Quantidade</label>
                    <input
                      type="number"
                      value={qtd}
                      onChange={(e) => setQtd(Number(e.target.value))}
                      className="w-full bg-background border border-border-main rounded px-2 py-1 text-text-main"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5">Valor Unitário</label>
                    <input
                      type="number"
                      step="0.01"
                      value={precoUnit}
                      onChange={(e) => setPrecoUnit(Number(e.target.value))}
                      className="w-full bg-background border border-border-main rounded px-2 py-1 text-text-main"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5">ICMS (%)</label>
                    <input
                      type="number"
                      value={aliquotaIcms}
                      onChange={(e) => setAliquotaIcms(Number(e.target.value))}
                      className="w-full bg-background border border-border-main rounded px-2 py-1 text-text-main"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalNovaNFe(false)}
                  className="px-3.5 py-1.5 bg-surface-hover text-text-main rounded-lg border border-border-main"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary hover:bg-brand-hover text-brand-foreground font-semibold rounded-lg shadow-sm"
                >
                  Transmitir para SEFAZ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DANFE Simplificado */}
      {modalDanfe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold">DANFE — Documento Auxiliar da NF-e</h3>
              </div>
              <button onClick={() => setModalDanfe(null)} className="text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layout do DANFE */}
            <div className="border border-slate-300 p-4 rounded text-xs space-y-3 font-sans">
              <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-3">
                <div className="col-span-2">
                  <h4 className="font-bold text-sm">{modalDanfe.emitente_razao}</h4>
                  <p className="text-[11px] text-slate-600">CNPJ: {formatCNPJ(modalDanfe.emitente_cnpj)}</p>
                  <p className="text-[11px] text-slate-600">Natureza: {modalDanfe.natureza_operacao}</p>
                </div>
                <div className="text-right border-l border-slate-200 pl-3">
                  <span className="font-bold block">NF-e Nº {modalDanfe.numero_nota}</span>
                  <span className="text-[11px] text-slate-500 block">SÉRIE {modalDanfe.serie}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1">SEFAZ AUTORIZADA</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Chave de Acesso</span>
                <p className="font-mono text-xs font-bold text-slate-800 tracking-wider break-all">
                  {modalDanfe.chave_acesso_44}
                </p>
                <p className="text-[10px] text-slate-500">Protocolo: {modalDanfe.protocolo_autorizacao}</p>
              </div>

              <div className="border border-slate-200 p-2.5 rounded space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Destinatário / Remetente</span>
                <p className="font-bold">{modalDanfe.destinatario_razao}</p>
                <p className="text-[11px] text-slate-600">CNPJ/CPF: {formatCNPJ(modalDanfe.destinatario_doc)} • {modalDanfe.destinatario_cidade}/{modalDanfe.destinatario_uf}</p>
              </div>

              {/* Itens */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Dados dos Produtos</span>
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-1.5">Código</th>
                      <th className="p-1.5">Descrição</th>
                      <th className="p-1.5">NCM</th>
                      <th className="p-1.5">Qtd</th>
                      <th className="p-1.5">V. Unit</th>
                      <th className="p-1.5">V. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalDanfe.itens.map((it: any) => (
                      <tr key={it.id} className="border-t border-slate-200">
                        <td className="p-1.5 font-mono">{it.codigo_produto}</td>
                        <td className="p-1.5">{it.descricao}</td>
                        <td className="p-1.5 font-mono">{it.ncm}</td>
                        <td className="p-1.5">{it.quantidade} {it.unidade}</td>
                        <td className="p-1.5">{formatBRL(it.valor_unitario)}</td>
                        <td className="p-1.5 font-bold">{formatBRL(it.valor_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-slate-100 p-3 rounded font-bold text-xs">
                <span>VALOR TOTAL DA NOTA FISCAL:</span>
                <span className="text-sm text-sky-800">{formatBRL(modalDanfe.valor_total_nota)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-brand-primary" />
                XML Oficial da NF-e (Layout 4.00)
              </h3>
              <button onClick={() => setModalXml(null)} className="text-text-dim hover:text-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-4 bg-background rounded-xl border border-border-subtle text-[11px] font-mono text-text-main overflow-x-auto max-h-96 whitespace-pre-wrap">
              {modalXml.xml_conteudo}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => handleCopiarChave(modalXml.xml_conteudo)}
                className="px-4 py-1.5 bg-brand-primary hover:bg-brand-hover text-brand-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-status-danger flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Cancelar NF-e na SEFAZ
              </h3>
              <button onClick={() => setModalCancelar(null)} className="text-text-dim hover:text-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-text-muted">
                O cancelamento será transmitido para a SEFAZ estadual. O prazo legal padrão é de até 24h após a autorização.
              </p>

              <div>
                <label className="block font-semibold text-text-main mb-1">Justificativa do Cancelamento (mínimo 15 caracteres)</label>
                <textarea
                  rows={3}
                  required
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Ex: Erro na quantidade faturada de tecido..."
                  className="w-full bg-background border border-border-main rounded-lg p-2.5 text-text-main"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalCancelar(null)}
                  className="px-3.5 py-1.5 bg-surface-hover text-text-main rounded-lg border border-border-main"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarCancelamento}
                  className="px-4 py-1.5 bg-status-danger hover:bg-rose-600 text-white font-semibold rounded-lg shadow-sm"
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
