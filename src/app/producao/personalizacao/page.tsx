"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scissors,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  Layers,
  Shirt,
  DollarSign,
  Calendar,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Building2,
  X,
  Phone,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatDate, formatNumber, formatCNPJ } from "@/lib/utils";
import { StatusOSPersonalizacao } from "@/types/database.types";

export default function PersonalizacaoPage() {
  const {
    ordensPersonalizacao,
    produtos,
    itensCatalogo,
    addOrdemPersonalizacao,
    updateStatusOSPersonalizacao,
  } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [modalNovaOS, setModalNovaOS] = useState(false);
  const [osDetalhes, setOsDetalhes] = useState<any | null>(ordensPersonalizacao[0] || null);

  // Form State Nova OS
  const [clienteNome, setClienteNome] = useState("");
  const [clienteDoc, setClienteDoc] = useState("");
  const [clienteContato, setClienteContato] = useState("");
  const [clienteWhatsApp, setClienteWhatsApp] = useState("");
  const [pecaBaseId, setPecaBaseId] = useState(produtos[0]?.id || "");
  const [pecaCor, setPecaCor] = useState("Preto");
  const [gradeP, setGradeP] = useState(20);
  const [gradeM, setGradeM] = useState(50);
  const [gradeG, setGradeG] = useState(40);
  const [gradeGG, setGradeGG] = useState(10);
  const [dataEntrega, setDataEntrega] = useState("");
  const [margemLucro, setMargemLucro] = useState(55);
  const [prioridade, setPrioridade] = useState<"normal" | "alta" | "urgente">("alta");
  const [observacoes, setObservacoes] = useState("");

  // Componentes Dinâmicos de Personalização
  const [componentes, setComponentes] = useState<
    {
      tipo: "materia_prima" | "bordado" | "tag" | "etiqueta" | "silk_dtf" | "embalagem_especial";
      descricao: string;
      quantidade_por_peca: number;
      unidade: string;
      custo_unitario: number;
      pontos_bordado?: number;
      tempo_maquina_min?: number;
    }[]
  >([
    {
      tipo: "bordado",
      descricao: "Bordado Computadorizado Peito (8.500 pontos)",
      quantidade_por_peca: 1,
      unidade: "un",
      custo_unitario: 3.5,
      pontos_bordado: 8500,
      tempo_maquina_min: 6,
    },
    {
      tipo: "tag",
      descricao: "Tag Personalizado Kraft 300g",
      quantidade_por_peca: 1,
      unidade: "un",
      custo_unitario: 0.85,
    },
  ]);

  const ordensFiltradas = ordensPersonalizacao.filter((os) => {
    const matchBusca =
      os.numero_os.toLowerCase().includes(busca.toLowerCase()) ||
      os.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
      os.peca_base_nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || os.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  // KPIs
  const totalOS = ordensPersonalizacao.length;
  const osEmProducao = ordensPersonalizacao.filter((os) => os.status !== "finalizado" && os.status !== "entregue").length;
  const faturamentoTotalOS = ordensPersonalizacao.reduce((acc, curr) => acc + curr.valor_total_os, 0);
  const totalPecasPersonalizadas = ordensPersonalizacao.reduce((acc, curr) => acc + curr.quantidade_total_pecas, 0);

  // Cálculos dinâmicos do formulário
  const qtdTotalForm = Number(gradeP) + Number(gradeM) + Number(gradeG) + Number(gradeGG);
  const pecaSelecionada = produtos.find((p) => p.id === pecaBaseId);
  const custoBaseUnitForm = pecaSelecionada?.preco_venda_sugerido ? pecaSelecionada.preco_venda_sugerido * 0.45 : 20;
  const custoComponentesUnitForm = componentes.reduce((acc, c) => acc + (Number(c.custo_unitario) * Number(c.quantidade_por_peca)), 0);
  const custoTotalUnitForm = custoBaseUnitForm + custoComponentesUnitForm;
  const custoTotalOSForm = custoTotalUnitForm * qtdTotalForm;
  const precoSugeridoForm = Number((custoTotalUnitForm / (1 - margemLucro / 100)).toFixed(2));
  const valorTotalOSForm = Number((precoSugeridoForm * qtdTotalForm).toFixed(2));

  const handleAddComponente = () => {
    setComponentes([
      ...componentes,
      {
        tipo: "etiqueta",
        descricao: "Etiqueta Tecida Personalizada",
        quantidade_por_peca: 1,
        unidade: "un",
        custo_unitario: 0.65,
      },
    ]);
  };

  const handleRemoveComponente = (index: number) => {
    setComponentes(componentes.filter((_, idx) => idx !== index));
  };

  const handleSalvarOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome || !pecaBaseId || qtdTotalForm <= 0) return;

    addOrdemPersonalizacao({
      cliente_nome: clienteNome,
      cliente_documento: clienteDoc || "00.000.000/0001-00",
      cliente_contato: clienteContato,
      cliente_whatsapp: clienteWhatsApp,
      peca_base_produto_id: pecaBaseId,
      peca_base_cor: pecaCor,
      peca_base_tamanho_grade: { P: gradeP, M: gradeM, G: gradeG, GG: gradeGG },
      componentes: componentes,
      margem_lucro_percentual: Number(margemLucro),
      data_previsao_entrega: dataEntrega || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      prioridade: prioridade,
      observacoes: observacoes,
    });

    setModalNovaOS(false);
    setClienteNome("");
  };

  const getStatusBadge = (st: StatusOSPersonalizacao) => {
    const map: Record<StatusOSPersonalizacao, { label: string; bg: string; text: string }> = {
      aguardando_insumos: { label: "Aguardando Insumos", bg: "bg-amber-500/15", text: "text-amber-500" },
      em_producao: { label: "Em Produção", bg: "bg-sky-500/15", text: "text-sky-500" },
      aguardando_bordado: { label: "Em Bordado", bg: "bg-purple-500/15", text: "text-purple-500" },
      acabamento: { label: "Acabamento & Tags", bg: "bg-indigo-500/15", text: "text-indigo-500" },
      finalizado: { label: "Finalizado", bg: "bg-emerald-500/15", text: "text-emerald-500" },
      entregue: { label: "Entregue ao Cliente", bg: "bg-slate-500/15", text: "text-slate-400" },
      cancelado: { label: "Cancelado", bg: "bg-rose-500/15", text: "text-rose-500" },
    };
    const c = map[st] || map.em_producao;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Scissors className="w-5 h-5 text-brand-primary" />
            Personalização de Peças Prontas — Ordens de Serviço (OS)
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Fluxo de customização: peça base em estoque + bordados, tags, etiquetas e serviços extras com custo composto.
          </p>
        </div>

        <button
          onClick={() => setModalNovaOS(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova OS de Personalização
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">OS em Andamento</span>
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-brand-primary mt-2">{osEmProducao}</p>
          <span className="text-[11px] text-text-muted">Em esteira de customização</span>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Peças Customizadas</span>
            <div className="p-2 bg-accent-teal/10 rounded-lg text-accent-teal">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-accent-teal mt-2">{formatNumber(totalPecasPersonalizadas, 0)} un</p>
          <span className="text-[11px] text-text-muted">Total de peças faturadas</span>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Faturamento de OS</span>
            <div className="p-2 bg-status-success/10 rounded-lg text-status-success">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-status-success mt-2">{formatBRL(faturamentoTotalOS)}</p>
          <span className="text-[11px] text-text-muted">Valor total dos serviços</span>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Margem Média da OS</span>
            <div className="p-2 bg-accent-gold/10 rounded-lg text-accent-gold">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-accent-gold mt-2">57.5%</p>
          <span className="text-[11px] text-text-muted">Composição sobre custo base</span>
        </div>
      </div>

      {/* Grid Principal: Lista de OS e Painel Lateral de Detalhes / Composição */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Ordens de Serviço */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-surface rounded-xl border border-border-main shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar OS, cliente ou peça..."
                className="w-full bg-background border border-border-main text-xs rounded-lg pl-8 pr-3 py-1.5 text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {["todos", "aguardando_insumos", "aguardando_bordado", "em_producao", "finalizado"].map((st) => (
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
                    : st === "aguardando_insumos"
                    ? "Insumos"
                    : st === "aguardando_bordado"
                    ? "Bordado"
                    : st === "em_producao"
                    ? "Produção"
                    : "Finalizadas"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {ordensFiltradas.map((os) => {
              const isSelected = os.id === osDetalhes?.id;
              return (
                <div
                  key={os.id}
                  onClick={() => setOsDetalhes(os)}
                  className={`p-4 bg-surface rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-brand-primary ring-2 ring-brand-primary/20 shadow-md"
                      : "border-border-main hover:border-brand-primary/40 hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded">
                          {os.numero_os}
                        </span>
                        <h3 className="font-bold text-xs text-text-main">{os.cliente_nome}</h3>
                        {os.prioridade === "urgente" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-status-danger/15 text-status-danger rounded">
                            URGENTE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-1 font-mono">
                        CNPJ/CPF: {formatCNPJ(os.cliente_documento)}
                      </p>
                    </div>

                    <div>{getStatusBadge(os.status)}</div>
                  </div>

                  {/* Peça Base & Quantidade */}
                  <div className="mt-3 p-2.5 bg-background rounded-lg border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-brand-primary" />
                      <div>
                        <span className="font-semibold text-text-main">{os.peca_base_nome}</span>
                        <span className="text-[10px] text-text-muted block">
                          Cor: {os.peca_base_cor} • {os.quantidade_total_pecas} peças
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-brand-primary block">{formatBRL(os.valor_total_os)}</span>
                      <span className="text-[10px] text-text-muted">
                        Unit: {formatBRL(os.preco_venda_unitario_sugerido)} (Margem {os.margem_lucro_percentual}%)
                      </span>
                    </div>
                  </div>

                  {/* Componentes Tags Resumo */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {os.componentes.map((c, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 bg-surface-hover text-text-muted rounded-md border border-border-subtle flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-brand-primary" />
                        {c.descricao}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-text-dim mt-3 pt-2 border-t border-border-subtle">
                    <span>Abertura: {formatDate(os.data_abertura)}</span>
                    <span className="font-medium text-text-muted">Entrega: {formatDate(os.data_previsao_entrega)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalhes da OS & Composição de Custos */}
        {osDetalhes && (
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-surface rounded-xl border border-border-main shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-brand-primary">{osDetalhes.numero_os}</span>
                  <h3 className="font-bold text-sm text-text-main">{osDetalhes.cliente_nome}</h3>
                </div>
                <div>{getStatusBadge(osDetalhes.status)}</div>
              </div>

              {/* Botões de Avanço de Status */}
              <div className="p-3 bg-surface-hover rounded-xl border border-border-subtle space-y-2">
                <span className="text-xs font-bold text-text-main block">Avançar Etapa da OS:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => updateStatusOSPersonalizacao(osDetalhes.id, "em_producao", "Liberado para corte e produção.")}
                    className="px-2.5 py-1.5 bg-surface hover:bg-border-main text-text-main text-[11px] font-semibold rounded border border-border-main"
                  >
                    ▶ Em Produção
                  </button>
                  <button
                    onClick={() => updateStatusOSPersonalizacao(osDetalhes.id, "aguardando_bordado", "Enviado para máquina de bordado.")}
                    className="px-2.5 py-1.5 bg-surface hover:bg-border-main text-text-main text-[11px] font-semibold rounded border border-border-main"
                  >
                    🧵 Bordado
                  </button>
                  <button
                    onClick={() => updateStatusOSPersonalizacao(osDetalhes.id, "acabamento", "Colocação de tags e embalagem.")}
                    className="px-2.5 py-1.5 bg-surface hover:bg-border-main text-text-main text-[11px] font-semibold rounded border border-border-main"
                  >
                    🏷️ Tags & Acabamento
                  </button>
                  <button
                    onClick={() => updateStatusOSPersonalizacao(osDetalhes.id, "finalizado", "Concluído e pronto para entrega.")}
                    className="px-2.5 py-1.5 bg-status-success text-white text-[11px] font-semibold rounded"
                  >
                    ✓ Finalizar
                  </button>
                </div>
              </div>

              {/* Composição de Custos Automática */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-text-main uppercase tracking-wider text-[11px]">
                  Composição Automática de Custo Unitário
                </h4>

                <div className="p-3 bg-background rounded-lg border border-border-subtle space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-text-muted">1. Peça Base em Estoque:</span>
                    <strong className="text-text-main">{formatBRL(osDetalhes.custo_peca_base_unitario)}</strong>
                  </div>

                  <div className="border-t border-border-subtle/50 my-1" />

                  <span className="text-[10px] font-semibold text-text-muted uppercase block">
                    2. Componentes / Customizações Extras:
                  </span>
                  {osDetalhes.componentes.map((comp: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-[11px] pl-2">
                      <span className="text-text-muted truncate max-w-[200px]">• {comp.descricao}:</span>
                      <span className="font-medium text-text-main">{formatBRL(comp.custo_total_por_peca)}</span>
                    </div>
                  ))}

                  <div className="border-t border-border-subtle pt-1 flex justify-between font-bold text-text-main">
                    <span>Custo Unitário Total:</span>
                    <span className="text-brand-primary">{formatBRL(osDetalhes.custo_total_unitario)}</span>
                  </div>
                </div>

                {/* Resumo Comercial */}
                <div className="p-3 bg-brand-primary/10 rounded-lg border border-brand-primary/20 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Custo Total da OS ({osDetalhes.quantidade_total_pecas} un):</span>
                    <strong className="text-text-main">{formatBRL(osDetalhes.custo_total_os)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Margem Aplicada:</span>
                    <strong className="text-brand-primary">{osDetalhes.margem_lucro_percentual}%</strong>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t border-brand-primary/30 pt-1 text-text-main">
                    <span>Preço de Venda Total:</span>
                    <span className="text-status-success">{formatBRL(osDetalhes.valor_total_os)}</span>
                  </div>
                </div>
              </div>

              {/* Histórico de Etapas */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-text-main uppercase tracking-wider text-[11px]">
                  Rastreabilidade & Histórico da OS
                </h4>
                <div className="space-y-2">
                  {osDetalhes.historico_etapas.map((etp: any) => (
                    <div key={etp.id} className="p-2.5 bg-surface-hover rounded-lg border border-border-subtle text-[11px]">
                      <div className="flex justify-between font-semibold text-text-main">
                        <span>{etp.etapa_nome}</span>
                        <span className="text-text-dim text-[10px]">{formatDate(etp.data_inicio)}</span>
                      </div>
                      <p className="text-text-muted mt-0.5">{etp.observacao}</p>
                      <span className="text-[10px] text-brand-primary block mt-1">Resp: {etp.responsavel_nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Nova OS de Personalização */}
      {modalNovaOS && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-main">Abertura de OS — Personalização de Peça Pronta</h3>
              <button onClick={() => setModalNovaOS(false)} className="text-text-dim hover:text-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarOS} className="space-y-4 text-xs">
              {/* Dados do Cliente */}
              <div className="space-y-2">
                <span className="font-bold text-text-main block uppercase tracking-wider text-[10px]">
                  1. Dados do Cliente
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-main mb-1">Cliente / Razão Social</label>
                    <input
                      type="text"
                      required
                      value={clienteNome}
                      onChange={(e) => setClienteNome(e.target.value)}
                      placeholder="Ex: StartUp Eventos Corp"
                      className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-main mb-1">CNPJ Alfanumérico ou CPF</label>
                    <input
                      type="text"
                      required
                      value={clienteDoc}
                      onChange={(e) => setClienteDoc(e.target.value)}
                      placeholder="Ex: 12.ABC.345/0001-90"
                      className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-main mb-1">Contato Responsável</label>
                    <input
                      type="text"
                      value={clienteContato}
                      onChange={(e) => setClienteContato(e.target.value)}
                      placeholder="Ex: Roberta Lima"
                      className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-main mb-1">WhatsApp para Notificação</label>
                    <input
                      type="text"
                      value={clienteWhatsApp}
                      onChange={(e) => setClienteWhatsApp(e.target.value)}
                      placeholder="Ex: (47) 99988-7766"
                      className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Peça Base & Grade */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <span className="font-bold text-text-main block uppercase tracking-wider text-[10px]">
                  2. Peça Base em Estoque
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-text-main mb-1">Selecionar Produto Base</label>
                    <select
                      value={pecaBaseId}
                      onChange={(e) => setPecaBaseId(e.target.value)}
                      className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                    >
                      {produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} ({p.referencia})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-text-main mb-1">Cor</label>
                    <input
                      type="text"
                      value={pecaCor}
                      onChange={(e) => setPecaCor(e.target.value)}
                      placeholder="Ex: Preto"
                      className="w-full bg-background border border-border-main rounded-lg px-3 py-2 text-text-main"
                    />
                  </div>
                </div>

                <div className="p-3 bg-surface-hover rounded-xl border border-border-subtle">
                  <label className="block font-semibold text-text-main mb-2">
                    Grade de Tamanhos (Total: {qtdTotalForm} peças)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-text-muted block text-center">P</span>
                      <input
                        type="number"
                        min={0}
                        value={gradeP}
                        onChange={(e) => setGradeP(Number(e.target.value))}
                        className="w-full bg-background border border-border-main rounded px-2 py-1 text-center font-bold text-text-main"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block text-center">M</span>
                      <input
                        type="number"
                        min={0}
                        value={gradeM}
                        onChange={(e) => setGradeM(Number(e.target.value))}
                        className="w-full bg-background border border-border-main rounded px-2 py-1 text-center font-bold text-text-main"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block text-center">G</span>
                      <input
                        type="number"
                        min={0}
                        value={gradeG}
                        onChange={(e) => setGradeG(Number(e.target.value))}
                        className="w-full bg-background border border-border-main rounded px-2 py-1 text-center font-bold text-text-main"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block text-center">GG</span>
                      <input
                        type="number"
                        min={0}
                        value={gradeGG}
                        onChange={(e) => setGradeGG(Number(e.target.value))}
                        className="w-full bg-background border border-border-main rounded px-2 py-1 text-center font-bold text-text-main"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Componentes de Customização */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-main block uppercase tracking-wider text-[10px]">
                    3. Componentes Extras & Serviços de Personalização
                  </span>
                  <button
                    type="button"
                    onClick={handleAddComponente}
                    className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Item
                  </button>
                </div>

                <div className="space-y-2">
                  {componentes.map((c, idx) => (
                    <div key={idx} className="p-3 bg-surface-hover rounded-xl border border-border-subtle grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <select
                          value={c.tipo}
                          onChange={(e) => {
                            const newComps = [...componentes];
                            newComps[idx].tipo = e.target.value as any;
                            setComponentes(newComps);
                          }}
                          className="w-full bg-background border border-border-main rounded px-2 py-1 text-[11px] text-text-main"
                        >
                          <option value="bordado">Bordado</option>
                          <option value="tag">Tag Kraft/PVC</option>
                          <option value="etiqueta">Etiqueta Tecida</option>
                          <option value="silk_dtf">Silk / DTF</option>
                          <option value="materia_prima">Matéria-Prima</option>
                          <option value="embalagem_especial">Embalagem</option>
                        </select>
                      </div>

                      <div className="col-span-5">
                        <input
                          type="text"
                          value={c.descricao}
                          onChange={(e) => {
                            const newComps = [...componentes];
                            newComps[idx].descricao = e.target.value;
                            setComponentes(newComps);
                          }}
                          placeholder="Descrição do serviço..."
                          className="w-full bg-background border border-border-main rounded px-2 py-1 text-[11px] text-text-main"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          value={c.custo_unitario}
                          onChange={(e) => {
                            const newComps = [...componentes];
                            newComps[idx].custo_unitario = Number(e.target.value);
                            setComponentes(newComps);
                          }}
                          placeholder="Custo un"
                          className="w-full bg-background border border-border-main rounded px-2 py-1 text-[11px] text-text-main"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveComponente(idx)}
                          className="text-text-dim hover:text-status-danger p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo Comercial Automático */}
              <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/30 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-text-muted block text-[10px]">Custo Base + Componentes:</span>
                  <strong className="text-text-main text-sm">{formatBRL(custoTotalUnitForm)} / un</strong>
                </div>

                <div>
                  <span className="text-text-muted block text-[10px]">Margem de Lucro (%):</span>
                  <input
                    type="number"
                    value={margemLucro}
                    onChange={(e) => setMargemLucro(Number(e.target.value))}
                    className="w-20 bg-background border border-border-main rounded px-2 py-0.5 font-bold text-brand-primary"
                  />
                </div>

                <div>
                  <span className="text-text-muted block text-[10px]">Preço Venda Sugerido:</span>
                  <strong className="text-status-success text-sm">{formatBRL(precoSugeridoForm)} / un</strong>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalNovaOS(false)}
                  className="px-3.5 py-1.5 bg-surface-hover text-text-main rounded-lg border border-border-main"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary hover:bg-brand-hover text-brand-foreground font-semibold rounded-lg shadow-sm"
                >
                  Criar Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
