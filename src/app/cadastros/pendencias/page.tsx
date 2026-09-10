"use client";

import React, { useState, useMemo } from "react";
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  History,
  ArrowUpDown,
  ChevronRight,
  X,
  Send,
  MessageSquare,
  Sparkles,
  Info,
  Check,
  Edit3,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { Pendencia, StatusPendencia } from "@/types/database.types";
import { formatDate, cn } from "@/lib/utils";

export default function PendenciasPage() {
  const {
    pendencias,
    usuarios,
    usuarioLogado,
    addPendencia,
    updateStatusPendencia,
    updatePendencia,
  } = useTextilStore();

  // Estados dos Filtros
  const [busca, setBusca] = useState("");
  const [filtroUsuarioId, setFiltroUsuarioId] = useState<string>("todos");
  const [filtroPapel, setFiltroPapel] = useState<"todos" | "responsavel" | "criador">("todos");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | StatusPendencia>("todos");

  // Ordenação
  const [ordenarPor, setOrdenarPor] = useState<"data_criacao" | "data_prazo" | "numero">("data_criacao");
  const [ordemDesc, setOrdemDesc] = useState(true);

  // Estados de Modais e Drawer Lateral
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [pendenciaEdicao, setPendenciaEdicao] = useState<Pendencia | null>(null);
  const [modalEncerramento, setModalEncerramento] = useState<Pendencia | null>(null);
  const [obsEncerramento, setObsEncerramento] = useState("");

  // Formulário do Painel Lateral
  const [formInfo, setFormInfo] = useState("");
  const [formResponsavelId, setFormResponsavelId] = useState(usuarios[0]?.id || "");
  const [formDataPrazo, setFormDataPrazo] = useState("");
  const [formHora, setFormHora] = useState("");

  // Botão "Visão Geral" -> Limpa filtros
  const handleLimparFiltros = () => {
    setBusca("");
    setFiltroUsuarioId("todos");
    setFiltroPapel("todos");
    setFiltroStatus("todos");
  };

  // Abrir Drawer para Criar Nova
  const handleAbrirNova = () => {
    setPendenciaEdicao(null);
    setFormInfo("");
    setFormResponsavelId(usuarios.find((u) => u.id !== usuarioLogado.id)?.id || usuarios[0]?.id || "");
    setFormDataPrazo("");
    setFormHora("");
    setDrawerAberto(true);
  };

  // Abrir Drawer para Editar
  const handleAbrirEditar = (pend: Pendencia) => {
    setPendenciaEdicao(pend);
    setFormInfo(pend.informacao);
    setFormResponsavelId(pend.responsavel_id);
    setFormDataPrazo(pend.data_prazo || "");
    setFormHora(pend.hora || "");
    setDrawerAberto(true);
  };

  // Salvar Pendência (Nova ou Edição)
  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInfo.trim()) return;

    if (pendenciaEdicao) {
      updatePendencia(pendenciaEdicao.id, {
        informacao: formInfo,
        responsavel_id: formResponsavelId,
        data_prazo: formDataPrazo || undefined,
        hora: formHora || undefined,
      });
    } else {
      addPendencia({
        informacao: formInfo,
        responsavel_id: formResponsavelId,
        data_prazo: formDataPrazo || undefined,
        hora: formHora || undefined,
      });
    }

    setDrawerAberto(false);
  };

  // Confirmar Encerramento (Status Fechada com Observação)
  const handleConfirmarEncerramento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEncerramento) return;

    updateStatusPendencia(modalEncerramento.id, "fechada", obsEncerramento || "Encerrada com sucesso.");
    setModalEncerramento(null);
    setObsEncerramento("");
  };

  // Filtragem e Ordenação dos Dados
  const pendenciasFiltradas = useMemo(() => {
    return pendencias
      .filter((p) => {
        // Busca textual
        const matchBusca =
          p.numero.toLowerCase().includes(busca.toLowerCase()) ||
          p.informacao.toLowerCase().includes(busca.toLowerCase()) ||
          p.responsavel_nome.toLowerCase().includes(busca.toLowerCase()) ||
          p.criador_nome.toLowerCase().includes(busca.toLowerCase());

        // Filtro por Usuário Específico
        const matchUsuario =
          filtroUsuarioId === "todos" ||
          p.responsavel_id === filtroUsuarioId ||
          p.criador_id === filtroUsuarioId;

        // Filtro por Papel de Visão
        let matchPapel = true;
        if (filtroPapel === "responsavel") {
          matchPapel = p.responsavel_id === usuarioLogado.id;
        } else if (filtroPapel === "criador") {
          matchPapel = p.criador_id === usuarioLogado.id;
        }

        // Filtro por Status
        const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;

        return matchBusca && matchUsuario && matchPapel && matchStatus;
      })
      .sort((a, b) => {
        let valA: any = a[ordenarPor] || "";
        let valB: any = b[ordenarPor] || "";
        if (ordenarPor === "numero") {
          valA = a.numero;
          valB = b.numero;
        }
        if (valA < valB) return ordemDesc ? 1 : -1;
        if (valA > valB) return ordemDesc ? -1 : 1;
        return 0;
      });
  }, [
    pendencias,
    busca,
    filtroUsuarioId,
    filtroPapel,
    filtroStatus,
    ordenarPor,
    ordemDesc,
    usuarioLogado.id,
  ]);

  // Contadores para KPIs
  const totalAbertas = pendencias.filter((p) => p.status === "aberta").length;
  const totalFazendo = pendencias.filter((p) => p.status === "fazendo").length;
  const totalFechadas = pendencias.filter((p) => p.status === "fechada").length;
  const minhasPendenciasAbertas = pendencias.filter(
    (p) => p.responsavel_id === usuarioLogado.id && p.status !== "fechada"
  ).length;

  const toggleOrdenacao = (campo: "data_criacao" | "data_prazo" | "numero") => {
    if (ordenarPor === campo) {
      setOrdemDesc(!ordemDesc);
    } else {
      setOrdenarPor(campo);
      setOrdemDesc(true);
    }
  };

  const getStatusBadge = (status: StatusPendencia) => {
    switch (status) {
      case "aberta":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Aberta
          </span>
        );
      case "fazendo":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full">
            <Clock3 className="w-3 h-3 text-sky-500" />
            Fazendo
          </span>
        );
      case "fechada":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3 text-emerald-500" />
            Fechada
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-brand-primary" />
            Controle de Pendências & Tarefas
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Acompanhamento de tarefas compartilhadas entre a equipe, prazos, histórico de auditoria e encerramento.
          </p>
        </div>

        <button
          onClick={handleAbrirNova}
          className="px-3.5 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Pendência
        </button>
      </div>

      {/* Cards de KPIs Rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-surface p-3.5 rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span>Minhas Pendências</span>
            <User className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-xl font-bold text-brand-primary">{minhasPendenciasAbertas}</p>
          <p className="text-[10px] text-text-dim mt-0.5">Sob sua responsabilidade ativa</p>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span>Abertas na Fábrica</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600">{totalAbertas}</p>
          <p className="text-[10px] text-text-dim mt-0.5">Aguardando início</p>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span>Em Execução (Fazendo)</span>
            <Clock3 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-xl font-bold text-sky-600">{totalFazendo}</p>
          <p className="text-[10px] text-text-dim mt-0.5">Em andamento pela equipe</p>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-border-main shadow-xs">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span>Fechadas / Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-status-success" />
          </div>
          <p className="text-xl font-bold text-status-success">{totalFechadas}</p>
          <p className="text-[10px] text-text-dim mt-0.5">Finalizadas com auditoria</p>
        </div>
      </div>

      {/* Barra de Filtros no Topo */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Busca textual */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por número, informação, responsável ou criador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-surface border border-border-main text-xs rounded-lg pl-9 pr-3 py-2 text-text-main placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>

          {/* Filtro por Usuário */}
          <div>
            <select
              value={filtroUsuarioId}
              onChange={(e) => setFiltroUsuarioId(e.target.value)}
              className="w-full p-2 bg-surface border border-border-main rounded-lg text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="todos">Todos os Usuários</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.papel_nome || u.cargo})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Papel */}
          <div>
            <select
              value={filtroPapel}
              onChange={(e: any) => setFiltroPapel(e.target.value)}
              className="w-full p-2 bg-surface border border-border-main rounded-lg text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="todos">Todos os Papéis</option>
              <option value="responsavel">Sou Responsável</option>
              <option value="criador">Criadas por Mim</option>
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <select
              value={filtroStatus}
              onChange={(e: any) => setFiltroStatus(e.target.value)}
              className="w-full p-2 bg-surface border border-border-main rounded-lg text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="todos">Todos os Status</option>
              <option value="aberta">Aberta</option>
              <option value="fazendo">Fazendo</option>
              <option value="fechada">Fechada</option>
            </select>
          </div>
        </div>

        {/* Botão de Visão Geral (Limpar Filtros) */}
        <div className="flex items-center justify-between pt-1 border-t border-border-subtle text-xs">
          <span className="text-text-dim text-[11px]">
            Mostrando <strong>{pendenciasFiltradas.length}</strong> de{" "}
            <strong>{pendencias.length}</strong> pendências
          </span>

          <button
            onClick={handleLimparFiltros}
            className="text-[11px] font-semibold text-brand-primary hover:underline flex items-center gap-1"
          >
            <Filter className="w-3 h-3" />
            Visão Geral (Limpar Filtros)
          </button>
        </div>
      </div>

      {/* Lista Central com Ordenação Clicável */}
      <div className="bg-surface rounded-xl border border-border-main shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-hover/80 border-b border-border-main text-[11px] font-semibold text-text-muted uppercase tracking-wider select-none">
                <th
                  onClick={() => toggleOrdenacao("numero")}
                  className="py-3 px-4 cursor-pointer hover:text-text-main transition-colors min-w-[110px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Número</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleOrdenacao("data_criacao")}
                  className="py-3 px-4 cursor-pointer hover:text-text-main transition-colors min-w-[130px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Data / Hora</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleOrdenacao("data_prazo")}
                  className="py-3 px-4 cursor-pointer hover:text-text-main transition-colors min-w-[130px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Prazo</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[280px]">Informação / Tarefa</th>
                <th className="py-3 px-4 min-w-[160px]">Responsável</th>
                <th className="py-3 px-4 min-w-[140px]">Criador</th>
                <th className="py-3 px-4 text-center min-w-[110px]">Status</th>
                <th className="py-3 px-4 text-right min-w-[120px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {pendenciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-text-dim text-xs">
                    Nenhuma pendência encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                pendenciasFiltradas.map((p) => {
                  const isMinha = p.responsavel_id === usuarioLogado.id;
                  const isAtrasada =
                    p.status !== "fechada" &&
                    p.data_prazo &&
                    new Date(p.data_prazo) < new Date(new Date().toDateString());

                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "hover:bg-surface-hover/60 transition-colors group",
                        isMinha && "bg-brand-primary/5"
                      )}
                    >
                      {/* Número */}
                      <td className="py-3.5 px-4 font-mono font-bold text-text-main">
                        <div className="flex items-center gap-1.5">
                          <span>{p.numero}</span>
                          {isMinha && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" title="Atribuída a você" />
                          )}
                        </div>
                      </td>

                      {/* Data / Hora de Criação */}
                      <td className="py-3.5 px-4 text-text-muted">
                        <div>
                          <span>{formatDate(p.data_criacao)}</span>
                          {p.hora && (
                            <span className="text-[10px] text-text-dim block">
                              {p.hora}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Prazo */}
                      <td className="py-3.5 px-4">
                        {p.data_prazo ? (
                          <div
                            className={cn(
                              "text-xs font-semibold flex items-center gap-1",
                              isAtrasada ? "text-status-danger" : "text-text-main"
                            )}
                          >
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{p.data_prazo}</span>
                            {isAtrasada && (
                              <span className="text-[9px] bg-status-danger/10 text-status-danger px-1 rounded uppercase">
                                Atrasada
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-dim text-[11px]">Sem prazo</span>
                        )}
                      </td>

                      {/* Informação / Descrição */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-text-main line-clamp-2 leading-relaxed">
                          {p.informacao}
                        </p>
                        {p.observacao_encerramento && (
                          <p className="text-[10px] text-status-success mt-0.5 line-clamp-1 italic">
                            ✓ Conclusão: {p.observacao_encerramento}
                          </p>
                        )}
                      </td>

                      {/* Responsável */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-[10px] border border-brand-primary/20">
                            {p.responsavel_nome[0]}
                          </div>
                          <span className="font-medium text-text-main truncate max-w-[130px]">
                            {p.responsavel_nome}
                          </span>
                        </div>
                      </td>

                      {/* Criador */}
                      <td className="py-3.5 px-4 text-text-muted text-[11px]">
                        {p.criador_nome}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(p.status)}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Alternar Status Rápido */}
                          {p.status === "aberta" && (
                            <button
                              onClick={() => updateStatusPendencia(p.id, "fazendo")}
                              title="Iniciar Tarefa (Mudar para Fazendo)"
                              className="p-1.5 text-text-muted hover:text-sky-600 hover:bg-sky-500/10 rounded-lg transition-colors"
                            >
                              <Clock3 className="w-4 h-4" />
                            </button>
                          )}

                          {p.status !== "fechada" && (
                            <button
                              onClick={() => setModalEncerramento(p)}
                              title="Fechar / Concluir Pendência"
                              className="p-1.5 text-text-muted hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleAbrirEditar(p)}
                            title="Editar Dados / Ver Histórico"
                            className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAINEL LATERAL / DRAWER ("Dados da Pendência") */}
      {drawerAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="bg-surface w-full max-w-lg h-full shadow-2xl border-l border-border-main flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header do Drawer */}
            <div className="px-6 py-4 border-b border-border-main bg-surface-hover/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-main text-sm">
                    {pendenciaEdicao ? `Pendência ${pendenciaEdicao.numero}` : "Nova Pendência"}
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    {pendenciaEdicao ? "Edição e histórico de auditoria" : "Definir tarefa e responsável"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDrawerAberto(false)}
                className="p-1.5 text-text-dim hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Drawer */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <form id="drawerForm" onSubmit={handleSalvar} className="space-y-4">
                {/* Informação / Descrição da Tarefa */}
                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Informação / Descrição da Tarefa *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Descreva detalhadamente o que precisa ser feito..."
                    value={formInfo}
                    onChange={(e) => setFormInfo(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border-main rounded-lg text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>

                {/* Responsável (Busca de Usuários) */}
                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Usuário Responsável *
                  </label>
                  <select
                    value={formResponsavelId}
                    onChange={(e) => setFormResponsavelId(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border-main rounded-lg text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  >
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} — {u.papel_nome || u.cargo}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-text-dim mt-1">
                    O responsável receberá uma notificação instantânea no sino do sistema.
                  </p>
                </div>

                {/* Prazo e Hora */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-main mb-1">
                      Data Prazo
                    </label>
                    <input
                      type="date"
                      value={formDataPrazo}
                      onChange={(e) => setFormDataPrazo(e.target.value)}
                      className="w-full p-2 bg-surface border border-border-main rounded-lg text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-main mb-1">
                      Hora Limite
                    </label>
                    <input
                      type="time"
                      value={formHora}
                      onChange={(e) => setFormHora(e.target.value)}
                      className="w-full p-2 bg-surface border border-border-main rounded-lg text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                </div>
              </form>

              {/* Linha do Tempo de Auditoria / Histórico (Se for edição) */}
              {pendenciaEdicao && (
                <div className="pt-4 border-t border-border-subtle space-y-3">
                  <h4 className="font-bold text-text-main text-xs flex items-center gap-1.5">
                    <History className="w-4 h-4 text-brand-primary" />
                    Histórico de Auditoria & Mudanças
                  </h4>

                  <div className="space-y-2.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-main pl-6">
                    {pendenciaEdicao.historico.map((h, idx) => (
                      <div key={h.id || idx} className="relative text-xs">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-primary ring-4 ring-surface" />
                        <div className="p-2.5 rounded-lg bg-surface-hover/60 border border-border-subtle">
                          <div className="flex items-center justify-between text-[10px] text-text-dim mb-0.5">
                            <span className="font-semibold text-text-main">{h.usuario_nome}</span>
                            <span>{new Date(h.data).toLocaleString("pt-BR")}</span>
                          </div>
                          <p className="text-[11px] font-medium text-brand-primary uppercase">
                            Status: {h.status}
                          </p>
                          {h.observacao && (
                            <p className="text-[11px] text-text-muted mt-0.5">
                              {h.observacao}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Drawer */}
            <div className="px-6 py-3 border-t border-border-main bg-surface-hover/50 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDrawerAberto(false)}
                className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="drawerForm"
                className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-brand-foreground rounded-lg font-semibold shadow-sm transition-all"
              >
                {pendenciaEdicao ? "Salvar Alterações" : "Criar Pendência"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ENCERRAMENTO (Status Fechada com Observação) */}
      {modalEncerramento && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-status-success" />
                Concluir Pendência {modalEncerramento.numero}
              </h2>
              <button
                onClick={() => setModalEncerramento(null)}
                className="text-text-dim hover:text-text-main text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmarEncerramento} className="space-y-4 text-xs">
              <p className="text-text-muted">
                Você está encerrando a pendência: <strong className="text-text-main">{modalEncerramento.informacao}</strong>. A data de conclusão será registrada automaticamente no histórico.
              </p>

              <div>
                <label className="block font-semibold text-text-main mb-1">
                  Observação de Encerramento (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Laudo validado e liberado para corte sem restrições..."
                  value={obsEncerramento}
                  onChange={(e) => setObsEncerramento(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-main rounded-lg text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setModalEncerramento(null)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-status-success hover:opacity-90 text-white rounded-lg font-semibold shadow-sm"
                >
                  Confirmar Conclusão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
