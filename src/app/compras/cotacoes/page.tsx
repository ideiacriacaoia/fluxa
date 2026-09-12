"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Award,
  ShoppingCart,
  DollarSign,
  Calendar,
  X,
  Phone,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatDate, formatNumber, cn } from "@/lib/utils";

export default function CotacoesPage() {
  const {
    cotacoes,
    fornecedores,
    itensCatalogo,
    usuarioLogado,
    mensagensWhatsApp,
    addCotacao,
    addPropostaCotacao,
    selecionarPropostaCotacao,
    aprovarCotacao,
    converterCotacaoEmPedido,
    enviarCotacaoWhatsApp,
  } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [cotacaoSelecionadaId, setCotacaoSelecionadaId] = useState<string>(cotacoes[0]?.id || "");
  const [abaDetalhe, setAbaDetalhe] = useState<"propostas" | "whatsapp" | "aprovacoes">("propostas");

  // Modais
  const [modalNovaCotacao, setModalNovaCotacao] = useState(false);
  const [etapaNovaCotacao, setEtapaNovaCotacao] = useState<1 | 2>(1);
  const [modalAddProposta, setModalAddProposta] = useState(false);
  const [modalWhatsApp, setModalWhatsApp] = useState(false);
  const [modalAprovacao, setModalAprovacao] = useState(false);
  const [fornecedorWhatsAppId, setFornecedorWhatsAppId] = useState<string>("");
  const [textoWhatsApp, setTextoWhatsApp] = useState("");
  const [parecerAprovacao, setParecerAprovacao] = useState("");

  // Formulário Nova Cotação
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoItemId, setNovoItemId] = useState(itensCatalogo[0]?.id || "");
  const [novaQtd, setNovaQtd] = useState(500);
  const [novaCor, setNovaCor] = useState("");
  const [novoPrazoLimite, setNovoPrazoLimite] = useState("");
  const [novaMargem, setNovaMargem] = useState(45);
  const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState<string[]>(
    fornecedores.slice(0, 3).map((f) => f.id)
  );

  // Formulário Nova Proposta Manual
  const [propFornecedorId, setPropFornecedorId] = useState(fornecedores[0]?.id || "");
  const [propPrecoUnitario, setPropPrecoUnitario] = useState(35.0);
  const [propPrazoDias, setPropPrazoDias] = useState(7);
  const [propTipoFrete, setPropTipoFrete] = useState<"CIF" | "FOB">("CIF");
  const [propValorFrete, setPropValorFrete] = useState(0);
  const [propCondicaoPagto, setPropCondicaoPagto] = useState("28/42 DDL");
  const [propObs, setPropObs] = useState("");

  const cotacoesFiltradas = cotacoes.filter((c) => {
    const matchBusca =
      c.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      c.item_descricao.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const cotacaoAtual = cotacoes.find((c) => c.id === cotacaoSelecionadaId) || cotacoesFiltradas[0] || cotacoes[0];

  // Cálculo de KPIs
  const totalCotacoes = cotacoes.length;
  const cotacoesAbertas = cotacoes.filter((c) => c.status === "aberta" || c.status === "em_analise").length;
  const cotacoesAprovadas = cotacoes.filter((c) => c.status === "aprovada" || c.status === "convertida_pedido").length;
  const economiaTotalAcumulada = cotacoes.reduce((acc, curr) => acc + (curr.economia_estimada || 0), 0);

  const toggleFornecedorSelect = (id: string) => {
    if (fornecedoresSelecionados.includes(id)) {
      setFornecedoresSelecionados(fornecedoresSelecionados.filter((fId) => fId !== id));
    } else {
      setFornecedoresSelecionados([...fornecedoresSelecionados, id]);
    }
  };

  const handleSalvarCotacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo || !novoItemId || novaQtd <= 0) return;

    addCotacao({
      titulo: novoTitulo,
      item_catalogo_id: novoItemId,
      quantidade_solicitada: Number(novaQtd),
      cor_especificacao: novaCor,
      data_limite_resposta: novoPrazoLimite || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      margem_comercial_sugerida: Number(novaMargem),
      fornecedores_ids: fornecedoresSelecionados,
    });

    setModalNovaCotacao(false);
    setNovoTitulo("");
    setEtapaNovaCotacao(1);
  };

  const handleSalvarProposta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cotacaoAtual) return;

    addPropostaCotacao(cotacaoAtual.id, {
      fornecedor_id: propFornecedorId,
      preco_unitario: Number(propPrecoUnitario),
      prazo_entrega_dias: Number(propPrazoDias),
      tipo_frete: propTipoFrete,
      valor_frete: Number(propValorFrete),
      condicao_pagamento: propCondicaoPagto,
      observacoes: propObs,
    });

    setModalAddProposta(false);
  };

  const handleAbrirWhatsApp = (fornId: string) => {
    setFornecedorWhatsAppId(fornId);
    const forn = fornecedores.find((f) => f.id === fornId);
    setTextoWhatsApp(
      `Olá ${forn?.contato_nome || "Fornecedor"}! Sou ${usuarioLogado.nome} do departamento de Compras da Fluxa Têxtil. Segue solicitação da Cotação ${cotacaoAtual?.codigo} para ${cotacaoAtual?.quantidade_solicitada} ${cotacaoAtual?.unidade_medida} de ${cotacaoAtual?.item_descricao}. Qual a sua melhor condição de preço e prazo?`
    );
    setModalWhatsApp(true);
  };

  const handleEnviarWhatsApp = () => {
    if (!cotacaoAtual || !fornecedorWhatsAppId) return;
    enviarCotacaoWhatsApp(cotacaoAtual.id, fornecedorWhatsAppId, textoWhatsApp);
    setModalWhatsApp(false);
  };

  const handleAprovar = () => {
    if (!cotacaoAtual) return;
    aprovarCotacao(cotacaoAtual.id, parecerAprovacao);
    setModalAprovacao(false);
    setParecerAprovacao("");
  };

  // Melhor proposta (menor preço total)
  const propostaVencedora = cotacaoAtual?.propostas.find((p) => p.selecionada) || cotacaoAtual?.propostas[0];
  const precosPropostas = cotacaoAtual?.propostas.map((p) => p.preco_unitario) || [];
  const menorPreco = precosPropostas.length > 0 ? Math.min(...precosPropostas) : 0;
  const maiorPreco = precosPropostas.length > 0 ? Math.max(...precosPropostas) : 0;
  const economiaCalculada = maiorPreco > 0 && menorPreco > 0
    ? (maiorPreco - menorPreco) * (cotacaoAtual?.quantidade_solicitada || 1)
    : 0;

  const msgsCotacao = mensagensWhatsApp.filter((m) => m.cotacao_id === cotacaoAtual?.id);

  return (
    <div className="space-y-6">
      {/* Header com 1 ação primária em destaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-primary" />
            Cotações & Comparativo de Fornecedores
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Cotação multi-fornecedor, matriz de preços lado a lado, ganho competitivo e alçadas de aprovação.
          </p>
        </div>

        <button
          onClick={() => {
            setEtapaNovaCotacao(1);
            setModalNovaCotacao(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Cotação Multi-Fornecedor
        </button>
      </div>

      {/* KPI Cards Espaçados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface rounded-2xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Total de Cotações</span>
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-text-main font-mono mt-2">{totalCotacoes}</p>
          <span className="text-[11px] text-text-dim">Processos registrados</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Em Cotação / Análise</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono mt-2">{cotacoesAbertas}</p>
          <span className="text-[11px] text-text-dim">Aguardando decisão</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Cotações Aprovadas</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-2">{cotacoesAprovadas}</p>
          <span className="text-[11px] text-text-dim">Alçadas validadas</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Economia Estimada</span>
            <div className="p-2 bg-accent-teal/10 rounded-xl text-accent-teal">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-accent-teal font-mono mt-2">{formatBRL(economiaTotalAcumulada)}</p>
          <span className="text-[11px] text-text-dim">Ganho vs Maior Proposta</span>
        </div>
      </div>

      {/* Grid Principal Dividido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Painel Esquerdo: Lista Enxuta de Cotações */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3.5 bg-surface rounded-2xl border border-border-main shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar cotação ou código..."
                className="w-full bg-surface-hover/70 border border-border-main text-xs rounded-xl pl-8 pr-3 py-1.5 text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {["todos", "em_analise", "aprovada", "convertida_pedido"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFiltroStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    filtroStatus === st
                      ? "bg-brand-primary text-white font-semibold shadow-xs"
                      : "bg-surface-hover text-text-muted hover:text-text-main"
                  }`}
                >
                  {st === "todos"
                    ? "Todas"
                    : st === "em_analise"
                    ? "Em Análise"
                    : st === "aprovada"
                    ? "Aprovadas"
                    : "Em Pedido"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[700px]">
            {cotacoesFiltradas.map((cot) => {
              const isSelected = cot.id === cotacaoAtual?.id;
              const propsCount = cot.propostas.length;
              return (
                <div
                  key={cot.id}
                  onClick={() => setCotacaoSelecionadaId(cot.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-surface border-brand-primary ring-2 ring-brand-primary/20 shadow-sm"
                      : "bg-surface border-border-main hover:border-brand-primary/40 hover:bg-surface-hover/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-primary">{cot.codigo}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        cot.status === "aprovada"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : cot.status === "convertida_pedido"
                          ? "bg-brand-primary/15 text-brand-primary"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {cot.status === "aprovada"
                        ? "Aprovada"
                        : cot.status === "convertida_pedido"
                        ? "Virou Pedido"
                        : "Em Análise"}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-text-main mt-1 leading-snug line-clamp-1">
                    {cot.titulo}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-text-dim mt-2">
                    <span className="truncate max-w-[170px]">{cot.item_descricao}</span>
                    <span className="font-medium text-text-main font-mono">
                      {propsCount} prop.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel Direito: Detalhamento com Abas Contextuais */}
        {cotacaoAtual ? (
          <div className="lg:col-span-8 space-y-4">
            {/* Header da Cotação Selecionada */}
            <div className="p-5 bg-surface rounded-2xl border border-border-main shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded-md">
                      {cotacaoAtual.codigo}
                    </span>
                    <h2 className="text-sm font-bold text-text-main">{cotacaoAtual.titulo}</h2>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Item: <strong className="text-text-main">{cotacaoAtual.item_descricao}</strong> ({cotacaoAtual.item_codigo}) • Quantidade Solicitada:{" "}
                    <strong className="text-text-main font-mono">
                      {formatNumber(cotacaoAtual.quantidade_solicitada)} {cotacaoAtual.unidade_medida}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalAddProposta(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-hover hover:bg-border-main text-text-main text-xs font-semibold rounded-xl border border-border-main transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Proposta
                  </button>

                  {cotacaoAtual.status === "em_analise" && (
                    <button
                      onClick={() => setModalAprovacao(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Aprovar Cotação
                    </button>
                  )}

                  {cotacaoAtual.status === "aprovada" && (
                    <button
                      onClick={() => converterCotacaoEmPedido(cotacaoAtual.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Gerar Pedido
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Abas Contextuais do Detalhe */}
              <div className="flex items-center gap-2 border-b border-border-subtle pb-1">
                <button
                  type="button"
                  onClick={() => setAbaDetalhe("propostas")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                    abaDetalhe === "propostas"
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-text-muted hover:text-text-main hover:bg-surface-hover"
                  )}
                >
                  Quadro Comparativo ({cotacaoAtual.propostas.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAbaDetalhe("whatsapp")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                    abaDetalhe === "whatsapp"
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-text-muted hover:text-text-main hover:bg-surface-hover"
                  )}
                >
                  <Phone className="w-3.5 h-3.5" />
                  WhatsApp ({msgsCotacao.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAbaDetalhe("aprovacoes")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                    abaDetalhe === "aprovacoes"
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-text-muted hover:text-text-main hover:bg-surface-hover"
                  )}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Alçadas & Pareceres
                </button>
              </div>

              {/* CONTEÚDO DA ABA 1: Propostas & Comparativo */}
              {abaDetalhe === "propostas" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Banner de Economia */}
                  <div className="p-3.5 bg-accent-teal/10 rounded-xl border border-accent-teal/30 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-text-dim block text-[11px]">Melhor Oferta:</span>
                      <p className="font-bold text-text-main text-sm font-mono mt-0.5">
                        {propostaVencedora ? formatBRL(propostaVencedora.preco_unitario) : "-"}
                      </p>
                      <span className="text-[11px] text-text-dim">
                        {propostaVencedora?.fornecedor_nome} ({propostaVencedora?.tipo_frete})
                      </span>
                    </div>

                    <div>
                      <span className="text-text-dim block text-[11px]">Economia Estimada no Lote:</span>
                      <p className="font-bold text-emerald-400 text-sm font-mono mt-0.5">
                        {formatBRL(economiaCalculada || cotacaoAtual.economia_estimada || 0)}
                      </p>
                      <span className="text-[11px] text-text-dim">vs maior concorrente</span>
                    </div>

                    <div>
                      <span className="text-text-dim block text-[11px]">Integração Comercial:</span>
                      <p className="font-bold text-brand-primary text-sm font-mono mt-0.5">
                        PV: {formatBRL(cotacaoAtual.preco_venda_calculado || 0)}
                      </p>
                      <span className="text-[11px] text-text-dim">
                        Margem alvo: {cotacaoAtual.margem_comercial_sugerida}%
                      </span>
                    </div>
                  </div>

                  {/* Matriz de Propostas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {cotacaoAtual.propostas.map((prop) => {
                      const isMenor = prop.preco_unitario === menorPreco;
                      return (
                        <div
                          key={prop.id}
                          className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                            prop.selecionada
                              ? "bg-brand-primary/5 border-brand-primary ring-2 ring-brand-primary/20 shadow-sm"
                              : "bg-surface-hover/60 border-border-main hover:bg-surface-hover"
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <h4 className="font-bold text-text-main text-xs">{prop.fornecedor_nome}</h4>
                                <p className="text-[10px] text-text-dim font-mono">{prop.fornecedor_documento}</p>
                              </div>
                              {isMenor && (
                                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Menor Preço
                                </span>
                              )}
                            </div>

                            <div className="p-2.5 bg-surface rounded-xl border border-border-subtle space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-text-dim">Preço Unit.:</span>
                                <span className="font-bold font-mono text-text-main">{formatBRL(prop.preco_unitario)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-text-dim">Prazo:</span>
                                <span className="font-medium text-text-main">{prop.prazo_entrega_dias} dias</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-text-dim">Frete:</span>
                                <span className="font-medium text-text-main">{prop.tipo_frete}</span>
                              </div>
                              <div className="flex justify-between text-xs pt-1 border-t border-border-subtle">
                                <span className="text-text-dim font-semibold">Valor Total:</span>
                                <span className="font-bold font-mono text-text-main">{formatBRL(prop.valor_total)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => selecionarPropostaCotacao(cotacaoAtual.id, prop.id)}
                              className={cn(
                                "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                                prop.selecionada
                                  ? "bg-brand-primary text-white"
                                  : "bg-surface border border-border-main text-text-muted hover:text-text-main hover:bg-surface-hover"
                              )}
                            >
                              {prop.selecionada ? "✓ Selecionada" : "Selecionar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAbrirWhatsApp(prop.fornecedor_id)}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                              title="Enviar solicitação via WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CONTEÚDO DA ABA 2: WhatsApp */}
              {abaDetalhe === "whatsapp" && (
                <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-medium">Histórico de Disparos WhatsApp:</span>
                    <button
                      type="button"
                      onClick={() => handleAbrirWhatsApp(fornecedores[0]?.id || "")}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Novo Disparo WhatsApp
                    </button>
                  </div>

                  {msgsCotacao.length > 0 ? (
                    <div className="space-y-2">
                      {msgsCotacao.map((m) => (
                        <div key={m.id} className="p-3 bg-surface-hover/70 rounded-xl border border-border-subtle space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-text-main">{m.fornecedor_nome}</span>
                            <span className="text-text-dim">{formatDate(m.data_envio)}</span>
                          </div>
                          <p className="text-text-muted">{m.conteudo}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-surface-hover/40 rounded-xl text-center text-text-dim">
                      Nenhuma mensagem enviada para esta cotação ainda.
                    </div>
                  )}
                </div>
              )}

              {/* CONTEÚDO DA ABA 3: Alçadas & Pareceres */}
              {abaDetalhe === "aprovacoes" && (
                <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                  <div className="p-3 bg-surface-hover/70 rounded-xl border border-border-subtle space-y-1">
                    <h4 className="font-bold text-text-main">Regras de Alçada Cadastradas:</h4>
                    <p className="text-text-muted text-[11px]">
                      • Até R$ 10.000: Comprador Sênior • R$ 10.000 a R$ 50.000: Gerente de Suprimentos • Acima de R$ 50.000: Diretoria
                    </p>
                  </div>

                  {cotacaoAtual.aprovacoes_logs && cotacaoAtual.aprovacoes_logs.length > 0 ? (
                    <div className="space-y-2">
                      {cotacaoAtual.aprovacoes_logs.map((log) => (
                        <div key={log.id} className="p-3 bg-surface-hover rounded-xl border border-border-main space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-emerald-400">Aprovado por {log.usuario_nome} ({log.cargo})</span>
                            <span className="text-text-dim">{formatDate(log.data_aprovacao)}</span>
                          </div>
                          <p className="text-text-main italic">"{log.parecer}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-surface-hover/40 rounded-xl text-center text-text-dim">
                      Nenhum parecer ou alçada registrado para esta cotação até o momento.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* MODAL: Nova Cotação (Em 2 Etapas Claras) */}
      {modalNovaCotacao && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-primary" />
                  Nova Cotação Multi-Fornecedor
                </h2>
                <span className="text-[11px] text-text-dim">
                  Etapa {etapaNovaCotacao} de 2 — {etapaNovaCotacao === 1 ? "Dados do Insumo & Margem" : "Fornecedores Concorrentes"}
                </span>
              </div>
              <button
                onClick={() => setModalNovaCotacao(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarCotacao} className="space-y-4 text-xs">
              {etapaNovaCotacao === 1 && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block font-semibold text-text-main mb-1">Título do Processo *</label>
                    <input
                      type="text"
                      value={novoTitulo}
                      onChange={(e) => setNovoTitulo(e.target.value)}
                      placeholder="Ex: Cotação Algodão Egípcio 30/1 Coleção Verão"
                      className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-text-main mb-1">Insumo do Catálogo *</label>
                      <select
                        value={novoItemId}
                        onChange={(e) => setNovoItemId(e.target.value)}
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                      >
                        {itensCatalogo.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.codigo} - {it.descricao} ({it.unidade_medida})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-text-main mb-1">Quantidade *</label>
                      <input
                        type="number"
                        value={novaQtd}
                        onChange={(e) => setNovaQtd(Number(e.target.value))}
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-text-main mb-1">Cor / Especificação</label>
                      <input
                        type="text"
                        value={novaCor}
                        onChange={(e) => setNovaCor(e.target.value)}
                        placeholder="Ex: Pantone 19-4052 Classic Blue"
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-text-main mb-1">Margem Comercial Alvo (%)</label>
                      <input
                        type="number"
                        value={novaMargem}
                        onChange={(e) => setNovaMargem(Number(e.target.value))}
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setModalNovaCotacao(false)}
                      className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (novoTitulo && novoItemId) setEtapaNovaCotacao(2);
                      }}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold cursor-pointer flex items-center gap-1"
                    >
                      Avançar para Fornecedores
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {etapaNovaCotacao === 2 && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block font-semibold text-text-main mb-1.5">
                      Selecione os Fornecedores para Cotação Simultânea:
                    </label>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto p-2 bg-surface-hover/40 rounded-xl border border-border-main">
                      {fornecedores.map((f) => {
                        const isChecked = fornecedoresSelecionados.includes(f.id);
                        return (
                          <label
                            key={f.id}
                            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                              isChecked ? "bg-brand-primary/10 border border-brand-primary/30" : "hover:bg-surface-hover"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFornecedorSelect(f.id)}
                              className="rounded border-border-main text-brand-primary"
                            />
                            <div className="text-xs">
                              <strong className="text-text-main">{f.nome_fantasia || f.razao_social}</strong>
                              <span className="text-text-dim block text-[10px]">
                                {f.contato_nome} • Prazo médio: {f.prazo_medio_entrega_dias || 30}d
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setEtapaNovaCotacao(1)}
                      className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold shadow-sm cursor-pointer"
                    >
                      Criar Cotação ({fornecedoresSelecionados.length} parceiros)
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar Proposta */}
      {modalAddProposta && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-primary" />
                Registrar Proposta de Fornecedor
              </h2>
              <button
                onClick={() => setModalAddProposta(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarProposta} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-main mb-1">Fornecedor *</label>
                <select
                  value={propFornecedorId}
                  onChange={(e) => setPropFornecedorId(e.target.value)}
                  className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                >
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome_fantasia || f.razao_social}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Preço Unitário (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={propPrecoUnitario}
                    onChange={(e) => setPropPrecoUnitario(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Prazo de Entrega (dias)</label>
                  <input
                    type="number"
                    value={propPrazoDias}
                    onChange={(e) => setPropPrazoDias(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Tipo de Frete</label>
                  <select
                    value={propTipoFrete}
                    onChange={(e) => setPropTipoFrete(e.target.value as "CIF" | "FOB")}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                  >
                    <option value="CIF">CIF (Incluso)</option>
                    <option value="FOB">FOB (A pagar)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Condição Pagto</label>
                  <input
                    type="text"
                    value={propCondicaoPagto}
                    onChange={(e) => setPropCondicaoPagto(e.target.value)}
                    placeholder="Ex: 30 DDL"
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalAddProposta(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold shadow-sm cursor-pointer"
                >
                  Salvar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WhatsApp */}
      {modalWhatsApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5 text-emerald-400">
                <Phone className="w-4 h-4" />
                Disparo Oficial WhatsApp Business
              </h3>
              <button onClick={() => setModalWhatsApp(false)} className="text-text-dim hover:text-text-main p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-text-muted">
                A mensagem será enviada via WhatsApp para o contato do fornecedor com o resumo da cotação.
              </p>

              <div>
                <label className="block font-semibold text-text-main mb-1">Mensagem de Solicitação</label>
                <textarea
                  rows={4}
                  value={textoWhatsApp}
                  onChange={(e) => setTextoWhatsApp(e.target.value)}
                  className="w-full p-2.5 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalWhatsApp(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEnviarWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Aprovação com Alçada */}
      {modalAprovacao && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Aprovação Formal de Cotação
              </h3>
              <button onClick={() => setModalAprovacao(false)} className="text-text-dim hover:text-text-main p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-hover/70 rounded-xl border border-border-subtle space-y-1">
                <p>Fornecedor: <strong>{propostaVencedora?.fornecedor_nome}</strong></p>
                <p>Valor Total: <strong className="font-mono">{formatBRL(propostaVencedora?.valor_total || 0)}</strong></p>
                <p>Aprovador: <strong>{usuarioLogado.nome}</strong> ({usuarioLogado.cargo || "Comprador"})</p>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Parecer / Justificativa</label>
                <textarea
                  rows={3}
                  value={parecerAprovacao}
                  onChange={(e) => setParecerAprovacao(e.target.value)}
                  placeholder="Justifique a escolha do fornecedor..."
                  className="w-full p-2.5 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalAprovacao(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAprovar}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Confirmar Aprovação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
