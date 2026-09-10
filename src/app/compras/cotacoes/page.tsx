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
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatDate, formatNumber } from "@/lib/utils";

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
  const [modalNovaCotacao, setModalNovaCotacao] = useState(false);
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

  // Manipulação de Fornecedor no Form
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
      {/* Header & Ações */}
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
          onClick={() => setModalNovaCotacao(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Cotação Multi-Fornecedor
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Total de Cotações</span>
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-main mt-2">{totalCotacoes}</p>
          <span className="text-[11px] text-text-muted">Processos registrados</span>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Em Cotação / Análise</span>
            <div className="p-2 bg-status-warning/10 rounded-lg text-status-warning">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-status-warning mt-2">{cotacoesAbertas}</p>
          <span className="text-[11px] text-text-muted">Aguardando decisão</span>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Cotações Aprovadas</span>
            <div className="p-2 bg-status-success/10 rounded-lg text-status-success">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-status-success mt-2">{cotacoesAprovadas}</p>
          <span className="text-[11px] text-text-muted">Alçadas validadas</span>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Economia Estimada</span>
            <div className="p-2 bg-accent-teal/10 rounded-lg text-accent-teal">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-accent-teal mt-2">{formatBRL(economiaTotalAcumulada)}</p>
          <span className="text-[11px] text-text-muted">Ganho vs Maior Proposta</span>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Lista de Cotações */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 bg-surface rounded-xl border border-border-main shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar cotação, código ou item..."
                className="w-full bg-background border border-border-main text-xs rounded-lg pl-8 pr-3 py-1.5 text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {["todos", "em_analise", "aprovada", "convertida_pedido"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFiltroStatus(st)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    filtroStatus === st
                      ? "bg-brand-primary text-brand-foreground font-semibold"
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

          <div className="space-y-2 overflow-y-auto max-h-[750px]">
            {cotacoesFiltradas.map((cot) => {
              const isSelected = cot.id === cotacaoAtual?.id;
              const propsCount = cot.propostas.length;
              return (
                <div
                  key={cot.id}
                  onClick={() => setCotacaoSelecionadaId(cot.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-surface border-brand-primary ring-2 ring-brand-primary/20 shadow-md"
                      : "bg-surface border-border-main hover:border-brand-primary/40 hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-primary">{cot.codigo}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        cot.status === "aprovada"
                          ? "bg-status-success/15 text-status-success"
                          : cot.status === "convertida_pedido"
                          ? "bg-brand-primary/15 text-brand-primary"
                          : "bg-status-warning/15 text-status-warning"
                      }`}
                    >
                      {cot.status === "aprovada"
                        ? "Aprovada"
                        : cot.status === "convertida_pedido"
                        ? "Virou Pedido"
                        : "Em Análise"}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-text-main mt-1.5 leading-snug line-clamp-1">
                    {cot.titulo}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-text-muted mt-2">
                    <span>
                      {cot.quantidade_solicitada} {cot.unidade_medida} • {cot.item_descricao}
                    </span>
                    <span className="font-semibold text-text-main">
                      {propsCount} {propsCount === 1 ? "proposta" : "propostas"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel Direito: Comparativo Lado a Lado */}
        {cotacaoAtual ? (
          <div className="lg:col-span-8 space-y-5">
            <div className="p-5 bg-surface rounded-xl border border-border-main shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded">
                      {cotacaoAtual.codigo}
                    </span>
                    <h2 className="text-base font-bold text-text-main">{cotacaoAtual.titulo}</h2>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Item: <strong className="text-text-main">{cotacaoAtual.item_descricao}</strong> ({cotacaoAtual.item_codigo}) • Quantidade Solicitada:{" "}
                    <strong className="text-text-main">
                      {formatNumber(cotacaoAtual.quantidade_solicitada)} {cotacaoAtual.unidade_medida}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalAddProposta(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-hover hover:bg-border-main text-text-main text-xs font-semibold rounded-lg border border-border-main transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Proposta
                  </button>

                  {cotacaoAtual.status === "em_analise" && (
                    <button
                      onClick={() => setModalAprovacao(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-status-success hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Aprovar Cotação
                    </button>
                  )}

                  {cotacaoAtual.status === "aprovada" && (
                    <button
                      onClick={() => converterCotacaoEmPedido(cotacaoAtual.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-primary hover:bg-brand-hover text-brand-foreground text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Gerar Pedido de Compra
                    </button>
                  )}
                </div>
              </div>

              {/* Banner de Ganho Competitivo */}
              <div className="p-4 bg-accent-teal/10 rounded-xl border border-accent-teal/30 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-text-muted block text-[11px]">Melhor Oferta Selecionada:</span>
                  <p className="font-bold text-text-main text-sm mt-0.5">
                    {propostaVencedora ? formatBRL(propostaVencedora.preco_unitario) : "-"} / {cotacaoAtual.unidade_medida}
                  </p>
                  <span className="text-[11px] text-text-muted">
                    {propostaVencedora?.fornecedor_nome} ({propostaVencedora?.tipo_frete})
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[11px]">Economia Estimada no Lote:</span>
                  <p className="font-bold text-status-success text-sm mt-0.5">
                    {formatBRL(economiaCalculada || cotacaoAtual.economia_estimada || 0)}
                  </p>
                  <span className="text-[11px] text-text-muted">Diferencial vs maior concorrente</span>
                </div>

                <div>
                  <span className="text-text-muted block text-[11px]">Integração c/ Proposta Comercial:</span>
                  <p className="font-bold text-brand-primary text-sm mt-0.5">
                    PV Sugerido: {formatBRL(cotacaoAtual.preco_venda_calculado || 0)}
                  </p>
                  <span className="text-[11px] text-text-muted">
                    Margem alvo: {cotacaoAtual.margem_comercial_sugerida}% (Sem retrabalho comercial)
                  </span>
                </div>
              </div>
            </div>

            {/* Matriz Lado a Lado */}
            <div className="p-5 bg-surface rounded-xl border border-border-main shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-accent-gold" />
                  Matriz de Comparação Lado a Lado ({cotacaoAtual.propostas.length} Fornecedores)
                </h3>
                <span className="text-[11px] text-text-muted">
                  Selecione a melhor proposta para definir a vencedora
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cotacaoAtual.propostas.map((prop) => {
                  const isMenor = prop.preco_unitario === menorPreco;
                  return (
                    <div
                      key={prop.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        prop.selecionada
                          ? "bg-brand-primary/5 border-brand-primary ring-2 ring-brand-primary/20 shadow-md"
                          : "bg-surface border-border-main hover:bg-surface-hover"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-text-main text-xs">{prop.fornecedor_nome}</h4>
                            <p className="text-[10px] text-text-muted font-mono">{prop.fornecedor_documento}</p>
                          </div>
                          {isMenor && (
                            <span className="bg-status-success/15 text-status-success text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Menor Preço
                            </span>
                          )}
                        </div>

                        <div className="p-3 bg-surface rounded-lg border border-border-subtle space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-text-muted">Preço Unitário:</span>
                            <span className="font-bold text-text-main">{formatBRL(prop.preco_unitario)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-text-muted">Valor Total Lote:</span>
                            <span className="font-bold text-brand-primary">{formatBRL(prop.valor_total)}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-text-muted">Frete:</span>
                            <span className="font-medium text-text-main">
                              {prop.tipo_frete} {prop.valor_frete > 0 ? `(${formatBRL(prop.valor_frete)})` : "(Incluso)"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-text-muted">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-text-dim" />
                              Prazo de Entrega:
                            </span>
                            <strong className="text-text-main">{prop.prazo_entrega_dias} dias úteis</strong>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-text-dim" />
                              Pagamento:
                            </span>
                            <strong className="text-text-main">{prop.condicao_pagamento}</strong>
                          </div>

                          <div className="flex items-center justify-between">
                            <span>Rating Fornecedor:</span>
                            <span className="font-bold text-accent-gold">★ {prop.avaliacao_desempenho_fornecedor.toFixed(1)}</span>
                          </div>
                        </div>

                        {prop.observacoes && (
                          <p className="text-[11px] text-text-muted bg-surface-hover p-2 rounded border border-border-subtle italic">
                            "{prop.observacoes}"
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-subtle flex items-center gap-2">
                        <button
                          onClick={() => selecionarPropostaCotacao(cotacaoAtual.id, prop.id)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            prop.selecionada
                              ? "bg-brand-primary text-brand-foreground"
                              : "bg-surface-hover hover:bg-border-main text-text-main border border-border-main"
                          }`}
                        >
                          {prop.selecionada ? "✓ Proposta Vencedora" : "Selecionar"}
                        </button>

                        <button
                          onClick={() => handleAbrirWhatsApp(prop.fornecedor_id)}
                          title="Enviar Cotação via WhatsApp"
                          className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logs de Alçadas */}
            <div className="p-5 bg-surface rounded-xl border border-border-main shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                Controle Interno & Alçadas de Aprovação
              </h3>

              {cotacaoAtual.aprovacoes_logs.length > 0 ? (
                <div className="space-y-2">
                  {cotacaoAtual.aprovacoes_logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-surface-hover rounded-lg border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-main">{log.usuario_nome}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded font-semibold uppercase">
                            Alçada {log.alcada}
                          </span>
                        </div>
                        <p className="text-text-muted text-[11px] mt-0.5">{log.parecer}</p>
                      </div>
                      <div className="text-right text-[11px] text-text-muted">
                        <span>Valor: {formatBRL(log.valor_aprovado)}</span>
                        <p>{formatDate(log.data_aprovacao)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic bg-surface-hover p-3 rounded-lg">
                  Nenhuma aprovação formal registrada ainda. Cotação em aberto para deliberação de compras.
                </p>
              )}
            </div>

            {/* Histórico WhatsApp */}
            {msgsCotacao.length > 0 && (
              <div className="p-5 bg-surface rounded-xl border border-border-main shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  Histórico de Mensagens WhatsApp Vinculadas
                </h3>
                <div className="space-y-2">
                  {msgsCotacao.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg text-xs max-w-xl ${
                        m.remetente === "comprador"
                          ? "bg-brand-primary/10 border border-brand-primary/20 ml-auto"
                          : "bg-surface-hover border border-border-main mr-auto"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
                        <strong>{m.remetente === "comprador" ? "Você (Comprador)" : m.fornecedor_nome}</strong>
                        <span>{formatDate(m.data_envio)}</span>
                      </div>
                      <p className="text-text-main">{m.conteudo}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* MODAL: Nova Cotação */}
      {modalNovaCotacao && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main">Criar Nova Cotação de Insumo/Tecido</h3>
              <button onClick={() => setModalNovaCotacao(false)} className="text-text-dim hover:text-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarCotacao} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-main mb-1">Título da Cotação</label>
                <input
                  type="text"
                  required
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Cotação Meia Malha 30.1 Penteada (Coleção Inverno)"
                  className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Item do Catálogo</label>
                  <select
                    value={novoItemId}
                    onChange={(e) => setNovoItemId(e.target.value)}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                  >
                    {itensCatalogo.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.descricao} ({i.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Quantidade Solicitada</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={novaQtd}
                    onChange={(e) => setNovaQtd(Number(e.target.value))}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
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
                    placeholder="Ex: Preto Reativo"
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Data Limite Resposta</label>
                  <input
                    type="date"
                    value={novoPrazoLimite}
                    onChange={(e) => setNovoPrazoLimite(e.target.value)}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">
                  Fornecedores Selecionados para Disparo ({fornecedoresSelecionados.length})
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-background rounded-lg border border-border-subtle">
                  {fornecedores.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer text-[11px] text-text-main">
                      <input
                        type="checkbox"
                        checked={fornecedoresSelecionados.includes(f.id)}
                        onChange={() => toggleFornecedorSelect(f.id)}
                        className="rounded border-border-main text-brand-primary"
                      />
                      <span>{f.nome_fantasia || f.razao_social}</span>
                      <span className="text-text-dim text-[10px]">({f.cidade}/{f.uf})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalNovaCotacao(false)}
                  className="px-3.5 py-1.5 bg-surface-hover text-text-main rounded-lg border border-border-main"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary hover:bg-brand-hover text-brand-foreground font-semibold rounded-lg"
                >
                  Criar Cotação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar Proposta */}
      {modalAddProposta && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main">Registrar Proposta Recebida</h3>
              <button onClick={() => setModalAddProposta(false)} className="text-text-dim hover:text-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarProposta} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-main mb-1">Fornecedor</label>
                <select
                  value={propFornecedorId}
                  onChange={(e) => setPropFornecedorId(e.target.value)}
                  className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
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
                  <label className="block font-semibold text-text-main mb-1">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={propPrecoUnitario}
                    onChange={(e) => setPropPrecoUnitario(Number(e.target.value))}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Prazo de Entrega (dias)</label>
                  <input
                    type="number"
                    required
                    value={propPrazoDias}
                    onChange={(e) => setPropPrazoDias(Number(e.target.value))}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Tipo de Frete</label>
                  <select
                    value={propTipoFrete}
                    onChange={(e) => setPropTipoFrete(e.target.value as "CIF" | "FOB")}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                  >
                    <option value="CIF">CIF (Incluso pelo Fornecedor)</option>
                    <option value="FOB">FOB (Pago pelo Comprador)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Valor do Frete (se FOB)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={propValorFrete}
                    onChange={(e) => setPropValorFrete(Number(e.target.value))}
                    className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Condição de Pagamento</label>
                <input
                  type="text"
                  value={propCondicaoPagto}
                  onChange={(e) => setPropCondicaoPagto(e.target.value)}
                  placeholder="Ex: 28/42/56 DDL"
                  className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Observações da Negociação</label>
                <textarea
                  rows={2}
                  value={propObs}
                  onChange={(e) => setPropObs(e.target.value)}
                  placeholder="Detalhes adicionais da proposta..."
                  className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalAddProposta(false)}
                  className="px-3.5 py-1.5 bg-surface-hover text-text-main rounded-lg border border-border-main"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary hover:bg-brand-hover text-brand-foreground font-semibold rounded-lg"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5 text-emerald-600">
                <Phone className="w-4 h-4" />
                Disparo Oficial WhatsApp Business
              </h3>
              <button onClick={() => setModalWhatsApp(false)} className="text-text-dim hover:text-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-text-muted">
                A mensagem abaixo será disparada via API oficial do WhatsApp para o contato cadastrado do fornecedor, acompanhada do anexo PDF oficial da cotação.
              </p>

              <div>
                <label className="block font-semibold text-text-main mb-1">Mensagem de Solicitação</label>
                <textarea
                  rows={4}
                  value={textoWhatsApp}
                  onChange={(e) => setTextoWhatsApp(e.target.value)}
                  className="w-full bg-background border border-border-main rounded-lg p-2.5 text-text-main"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalWhatsApp(false)}
                  className="px-3.5 py-1.5 bg-surface-hover text-text-main rounded-lg border border-border-main"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEnviarWhatsApp}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5 text-status-success">
                <ShieldCheck className="w-4 h-4" />
                Aprovação Formal de Cotação
              </h3>
              <button onClick={() => setModalAprovacao(false)} className="text-text-dim hover:text-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-hover rounded-lg border border-border-subtle space-y-1">
                <p>
                  Fornecedor Selecionado: <strong>{propostaVencedora?.fornecedor_nome}</strong>
                </p>
                <p>
                  Valor Total: <strong>{formatBRL(propostaVencedora?.valor_total || 0)}</strong>
                </p>
                <p>
                  Aprovador Atual: <strong>{usuarioLogado.nome}</strong> ({usuarioLogado.cargo || "Comprador"})
                </p>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Parecer / Justificativa da Aprovação</label>
                <textarea
                  rows={3}
                  value={parecerAprovacao}
                  onChange={(e) => setParecerAprovacao(e.target.value)}
                  placeholder="Justifique a escolha do fornecedor e condições aprovadas..."
                  className="w-full bg-background border border-border-main rounded-lg p-2.5 text-text-main"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalAprovacao(false)}
                  className="px-3.5 py-1.5 bg-surface-hover text-text-main rounded-lg border border-border-main"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={handleAprovar}
                  className="px-4 py-1.5 bg-status-success hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm"
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
