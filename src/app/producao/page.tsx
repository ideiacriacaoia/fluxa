"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Factory,
  Plus,
  Search,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shirt,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  QrCode,
  Building2,
  ShoppingBag,
  Boxes,
  UserCheck,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatDate, formatNumber, formatBRL, cn } from "@/lib/utils";
import { OrdemProducao, OPApontamento } from "@/types/database.types";

export default function ProducaoPCPPage() {
  const {
    ordensProducao,
    produtos,
    fichasTecnicas,
    depositos,
    lotes,
    retalhos,
    fornecedores,
    addOrdemProducao,
    updateStatusOP,
    registrarApontamentoOP,
  } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [modalNovaOP, setModalNovaOP] = useState(false);
  const [etapaNovaOP, setEtapaNovaOP] = useState<1 | 2 | 3>(1);
  const [opParaApontamento, setOpParaApontamento] = useState<OrdemProducao | null>(null);

  // Form State para Nova OP (PRD v2: Origem Híbrida, Modo de Corte, Etapas Mistas)
  const [produtoId, setProdutoId] = useState(produtos[0]?.id || "");
  const [depositoId, setDepositoId] = useState(depositos[1]?.id || depositos[0]?.id || "");
  const [origemOP, setOrigemOP] = useState<"estoque" | "pedido_venda">("estoque");
  const [numeroPedidoVenda, setNumeroPedidoVenda] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [modoCorte, setModoCorte] = useState<"enfesto" | "peca_a_peca">("enfesto");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState("");
  const [obsOP, setObsOP] = useState("");
  const [gradeQuantidades, setGradeQuantidades] = useState<Record<string, number>>({});
  const [loteConsumoId, setLoteConsumoId] = useState(lotes[0]?.id || "");
  const [retalhoConsumoId, setRetalhoConsumoId] = useState("");

  // Configuração de Mão de Obra por Etapa (v2)
  const [corteTipo, setCorteTipo] = useState<"interna" | "faccao">("interna");
  const [corteFaccaoId, setCorteFaccaoId] = useState("");

  const [costuraTipo, setCosturaTipo] = useState<"interna" | "faccao">("faccao");
  const [costuraFaccaoId, setCosturaFaccaoId] = useState(
    fornecedores.find((f) => f.tipo === "faccao")?.id || ""
  );

  const [acabamentoTipo, setAcabamentoTipo] = useState<"interna" | "faccao">("interna");
  const [acabamentoFaccaoId, setAcabamentoFaccaoId] = useState("");

  const produtoSelecionado = produtos.find((p) => p.id === produtoId) || produtos[0];
  const fichaDoProduto = fichasTecnicas.find((f) => f.produto_id === produtoSelecionado?.id);

  // Apontamento Form State (v2 com Retalho de corte)
  const [etapaApontamento, setEtapaApontamento] = useState<
    "enfesto_corte" | "costura_interna" | "faccao_externa" | "revisao_qualidade" | "embalagem"
  >("enfesto_corte");
  const [operadorNome, setOperadorNome] = useState("Célula de Costura 01");
  const [terceirizadoId, setTerceirizadoId] = useState("");
  const [qtdProcessada, setQtdProcessada] = useState<number>(50);
  const [qtdDefeito, setQtdDefeito] = useState<number>(0);
  const [motivoDefeito, setMotivoDefeito] = useState("");
  const [retalhoGeradoKg, setRetalhoGeradoKg] = useState<number>(0);
  const [tempoMinutos, setTempoMinutos] = useState<number>(120);
  const [finalizarEtapa, setFinalizarEtapa] = useState<boolean>(false);

  const totalPlanejadoNovaOP = Object.values(gradeQuantidades).reduce((a, b) => a + Number(b || 0), 0);

  // Consumo estimado de tecido para a nova OP
  const consumoUnitarioTecido =
    fichaDoProduto?.materiais?.find((m) => m.tipo === "tecido")?.consumo_por_peca || 0.23;
  const perdaTecido =
    fichaDoProduto?.materiais?.find((m) => m.tipo === "tecido")?.percentual_perda || 8.5;
  const kgNecessariosTecido = totalPlanejadoNovaOP * consumoUnitarioTecido * (1 + perdaTecido / 100);

  const handleSalvarNovaOP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoSelecionado || !fichaDoProduto || totalPlanejadoNovaOP <= 0) return;

    const gradeArray = Object.entries(gradeQuantidades)
      .filter(([_, qtd]) => qtd > 0)
      .map(([variacaoId, qtd]) => ({
        produto_variacao_id: variacaoId,
        quantidade: Number(qtd),
      }));

    const faccaoCostura = fornecedores.find((f) => f.id === costuraFaccaoId);
    const faccaoCorte = fornecedores.find((f) => f.id === corteFaccaoId);
    const faccaoAcabamento = fornecedores.find((f) => f.id === acabamentoFaccaoId);

    const retalhoSelecionado = retalhos.find((r) => r.id === retalhoConsumoId);

    addOrdemProducao({
      produto_id: produtoSelecionado.id,
      ficha_tecnica_id: fichaDoProduto.id,
      deposito_producao_id: depositoId,
      origem: origemOP,
      numero_pedido_venda: origemOP === "pedido_venda" ? numeroPedidoVenda : undefined,
      cliente_nome: origemOP === "pedido_venda" ? clienteNome : undefined,
      modo_corte: modoCorte,
      etapas_execucao: {
        corte: {
          tipo: corteTipo,
          terceirizado_id: corteTipo === "faccao" ? corteFaccaoId : undefined,
          terceirizado_nome: corteTipo === "faccao" ? faccaoCorte?.nome_fantasia : undefined,
        },
        costura: {
          tipo: costuraTipo,
          terceirizado_id: costuraTipo === "faccao" ? costuraFaccaoId : undefined,
          terceirizado_nome: costuraTipo === "faccao" ? faccaoCostura?.nome_fantasia : undefined,
        },
        acabamento: {
          tipo: acabamentoTipo,
          terceirizado_id: acabamentoTipo === "faccao" ? acabamentoFaccaoId : undefined,
          terceirizado_nome: acabamentoTipo === "faccao" ? faccaoAcabamento?.nome_fantasia : undefined,
        },
      },
      quantidade_planejada: totalPlanejadoNovaOP,
      data_inicio_prevista: dataInicio,
      data_fim_prevista: dataFim || undefined,
      observacoes: obsOP,
      grade: gradeArray,
      lotes_consumo: loteConsumoId
        ? [{ lote_id: loteConsumoId, quantidade: Number(kgNecessariosTecido.toFixed(2)) }]
        : [],
      retalhos_consumo: retalhoSelecionado
        ? [{ retalho_id: retalhoSelecionado.id, quantidade_kg: retalhoSelecionado.peso_residual_kg || retalhoSelecionado.metragem || 0 }]
        : [],
    });

    setModalNovaOP(false);
    setEtapaNovaOP(1);
    setGradeQuantidades({});
    setNumeroPedidoVenda("");
    setClienteNome("");
  };

  const handleSalvarApontamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opParaApontamento || qtdProcessada <= 0) return;

    registrarApontamentoOP(
      opParaApontamento.id,
      {
        etapa: etapaApontamento,
        tipo_execucao: etapaApontamento.includes("faccao") ? "faccao" : "interna",
        operador_nome: operadorNome,
        terceirizado_id: terceirizadoId || undefined,
        quantidade_processada: Number(qtdProcessada),
        quantidade_produzida: Number(qtdProcessada),
        quantidade_defeito: Number(qtdDefeito),
        motivo_defeito: motivoDefeito || undefined,
        retalho_gerado_kg: Number(retalhoGeradoKg),
        tempo_minutos: Number(tempoMinutos),
      },
      finalizarEtapa
    );

    setOpParaApontamento(null);
    setQtdProcessada(0);
    setQtdDefeito(0);
    setMotivoDefeito("");
    setRetalhoGeradoKg(0);
  };

  const colunasKanban: { id: OrdemProducao["status"]; title: string; color: string; badge: string }[] = [
    { id: "planejada", title: "1. Planejadas", color: "border-border-main", badge: "bg-surface text-text-muted" },
    { id: "em_corte", title: "2. Em Corte / Enfesto", color: "border-amber-400", badge: "bg-amber-500/15 text-amber-400" },
    { id: "em_costura", title: "3. Em Costura / Facção", color: "border-brand-primary", badge: "bg-brand-primary/15 text-brand-primary" },
    { id: "em_acabamento", title: "4. Acabamento & Revisão", color: "border-purple-400", badge: "bg-purple-500/15 text-purple-400" },
    { id: "finalizada", title: "5. Finalizadas (Estoque PA)", color: "border-emerald-400", badge: "bg-emerald-500/15 text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header com 1 ação primária de destaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Factory className="w-5 h-5 text-brand-primary" />
            PCP & Chão de Fábrica (Ordens de Produção)
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Acompanhe OPs sob encomenda ou para estoque, modos de corte e etapas de confecção.
          </p>
        </div>

        <button
          onClick={() => {
            setEtapaNovaOP(1);
            setModalNovaOP(true);
          }}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Abrir Nova OP
        </button>
      </div>

      {/* Kanban Board Limpo e Escaneável */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {colunasKanban.map((col) => {
          const opsNaColuna = ordensProducao.filter((op) => op.status === col.id);

          return (
            <div
              key={col.id}
              className={`bg-surface rounded-2xl p-3.5 border-t-4 ${col.color} border border-border-main flex flex-col space-y-3 min-h-[580px] shadow-xs`}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-text-main">{col.title}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${col.badge}`}>
                  {opsNaColuna.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {opsNaColuna.map((op) => {
                  const progresso = Math.round(
                    ((op.quantidade_produzida || 0) / (op.quantidade_planejada || 1)) * 100
                  );

                  return (
                    <div
                      key={op.id}
                      className="bg-surface-hover/70 p-3 rounded-xl border border-border-subtle hover:border-brand-primary/40 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-text-main bg-surface px-2 py-0.5 rounded border border-border-main">
                          OP #{op.numero_op}
                        </span>
                        <span className="text-[11px] font-bold text-text-main font-mono">
                          {op.quantidade_planejada} pçs
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-text-main leading-tight line-clamp-1">
                          {op.produto_nome}
                        </h4>
                        <span className="text-[10px] text-text-dim font-mono">
                          Ref: {op.produto_referencia}
                        </span>
                      </div>

                      {/* Badges de Operação */}
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded flex items-center gap-1 ${
                            op.origem === "pedido_venda"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                          }`}
                        >
                          <ShoppingBag className="w-2.5 h-2.5" />
                          {op.origem === "pedido_venda"
                            ? `${op.numero_pedido_venda || "Encomenda"}`
                            : "Estoque"}
                        </span>

                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {op.modo_corte === "enfesto" ? "Enfesto" : "Pç a Pç"}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-text-dim">
                          <span>Progresso</span>
                          <span className="font-bold text-text-main font-mono">
                            {op.quantidade_produzida}/{op.quantidade_planejada} ({progresso}%)
                          </span>
                        </div>
                        <div className="w-full bg-border-main/50 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                        <span className="text-[10px] text-text-dim">
                          {formatDate(op.data_fim_prevista || "")}
                        </span>

                        <button
                          onClick={() => {
                            setOpParaApontamento(op);
                            if (op.status === "planejada" || op.status === "em_corte") {
                              setEtapaApontamento("enfesto_corte");
                            } else if (op.status === "em_costura") {
                              setEtapaApontamento(
                                op.etapas_execucao?.costura?.tipo === "faccao"
                                  ? "faccao_externa"
                                  : "costura_interna"
                              );
                            } else {
                              setEtapaApontamento("embalagem");
                            }
                          }}
                          className="px-2.5 py-1 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Apontar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Ordem de Produção (Dividido em 3 Etapas Limpas) */}
      {modalNovaOP && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-border-main space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Factory className="w-5 h-5 text-brand-primary" />
                  Abertura de Ordem de Produção (OP)
                </h2>
                <span className="text-[11px] text-text-dim">
                  Etapa {etapaNovaOP} de 3 —{" "}
                  {etapaNovaOP === 1
                    ? "Origem & Produto"
                    : etapaNovaOP === 2
                    ? "Grade de Tamanhos"
                    : "Insumos & Facção"}
                </span>
              </div>
              <button
                onClick={() => setModalNovaOP(false)}
                className="text-text-dim hover:text-text-main text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarNovaOP} className="space-y-4 text-xs">
              {/* ETAPA 1: Origem & Produto */}
              {etapaNovaOP === 1 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-text-main mb-1">Tipo de Origem *</label>
                      <select
                        value={origemOP}
                        onChange={(e: any) => setOrigemOP(e.target.value)}
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                      >
                        <option value="estoque">Para Estoque (Reposição/Previsão)</option>
                        <option value="pedido_venda">Sob Encomenda (Pedido de Venda)</option>
                      </select>
                    </div>

                    {origemOP === "pedido_venda" ? (
                      <div>
                        <label className="block font-semibold text-text-main mb-1">Nº Pedido de Venda</label>
                        <input
                          type="text"
                          placeholder="Ex: PV-2026-095"
                          value={numeroPedidoVenda}
                          onChange={(e) => setNumeroPedidoVenda(e.target.value)}
                          className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono font-bold"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block font-semibold text-text-main mb-1">Modo de Corte</label>
                        <select
                          value={modoCorte}
                          onChange={(e: any) => setModoCorte(e.target.value)}
                          className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                        >
                          <option value="enfesto">Enfesto (Corte em Bloco)</option>
                          <option value="peca_a_peca">Peça a Peça (Individual)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-text-main mb-1">Produto / Modelo *</label>
                      <select
                        value={produtoId}
                        onChange={(e) => setProdutoId(e.target.value)}
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                        required
                      >
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.referencia} - {p.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-text-main mb-1">Previsão de Conclusão</label>
                      <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setModalNovaOP(false)}
                      className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEtapaNovaOP(2)}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold cursor-pointer flex items-center gap-1"
                    >
                      Avançar para Grade
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 2: Grade de Tamanhos */}
              {etapaNovaOP === 2 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-4 bg-surface-hover/50 rounded-xl border border-border-main space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-main">
                        Grade de Produção — {produtoSelecionado?.nome}
                      </span>
                      <strong className="text-brand-primary font-mono text-xs">
                        Total: {totalPlanejadoNovaOP} peças
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {produtoSelecionado?.variacoes?.map((variacao) => (
                        <div key={variacao.id} className="p-2 bg-surface rounded-xl border border-border-main">
                          <label className="block text-[11px] font-semibold text-text-muted mb-1">
                            {variacao.cor_nome} / {variacao.tamanho}
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={gradeQuantidades[variacao.id] || ""}
                            onChange={(e) =>
                              setGradeQuantidades({
                                ...gradeQuantidades,
                                [variacao.id]: Number(e.target.value),
                              })
                            }
                            className="w-full p-1.5 bg-surface-hover/70 border border-border-subtle rounded-lg text-xs font-mono font-bold text-text-main"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setEtapaNovaOP(1)}
                      className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (totalPlanejadoNovaOP > 0) setEtapaNovaOP(3);
                      }}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold cursor-pointer flex items-center gap-1"
                    >
                      Avançar para Insumos & Facção
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 3: Insumos & Facção */}
              {etapaNovaOP === 3 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-text-main mb-1">Lote de Tecido (MP)</label>
                      <select
                        value={loteConsumoId}
                        onChange={(e) => setLoteConsumoId(e.target.value)}
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                      >
                        {lotes.map((lote) => (
                          <option key={lote.id} value={lote.id}>
                            {lote.codigo_lote} ({lote.item_descricao}) - {lote.quantidade_atual} {lote.unidade_medida}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-text-main mb-1">Execução de Costura</label>
                      <select
                        value={costuraTipo}
                        onChange={(e: any) => setCosturaTipo(e.target.value)}
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                      >
                        <option value="interna">Costura Interna (Célula Fábrica)</option>
                        <option value="faccao">Facção Externa Terceirizada</option>
                      </select>
                    </div>
                  </div>

                  {costuraTipo === "faccao" && (
                    <div>
                      <label className="block font-semibold text-text-main mb-1">Parceiro de Facção</label>
                      <select
                        value={costuraFaccaoId}
                        onChange={(e) => setCosturaFaccaoId(e.target.value)}
                        className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs"
                      >
                        {fornecedores
                          .filter((f) => f.tipo === "faccao")
                          .map((fac) => (
                            <option key={fac.id} value={fac.id}>
                              {fac.nome_fantasia || fac.razao_social}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setEtapaNovaOP(2)}
                      className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border-main text-text-main rounded-xl font-semibold cursor-pointer"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold shadow-sm cursor-pointer"
                    >
                      Lançar Ordem de Produção (#{totalPlanejadoNovaOP} pçs)
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal Apontamento de Produção */}
      {opParaApontamento && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-main space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                <Factory className="w-4 h-4 text-brand-primary" />
                Apontamento OP #{opParaApontamento.numero_op}
              </h3>
              <button onClick={() => setOpParaApontamento(null)} className="text-text-dim hover:text-text-main p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarApontamento} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Etapa *</label>
                  <select
                    value={etapaApontamento}
                    onChange={(e: any) => setEtapaApontamento(e.target.value)}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-semibold"
                  >
                    <option value="enfesto_corte">1. Enfesto & Corte</option>
                    <option value="costura_interna">2. Costura Interna</option>
                    <option value="faccao_externa">3. Facção Terceirizada</option>
                    <option value="revisao_qualidade">4. Revisão / Qualidade</option>
                    <option value="embalagem">5. Embalagem & Entrada PA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Peças Processadas *</label>
                  <input
                    type="number"
                    value={qtdProcessada}
                    onChange={(e) => setQtdProcessada(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">Tempo Gasto (min)</label>
                  <input
                    type="number"
                    value={tempoMinutos}
                    onChange={(e) => setTempoMinutos(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-text-main rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">Defeito / 2ª Qualidade</label>
                  <input
                    type="number"
                    value={qtdDefeito}
                    onChange={(e) => setQtdDefeito(Number(e.target.value))}
                    className="w-full p-2 bg-surface-hover/70 border border-border-main text-rose-400 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Sobra de retalho no corte */}
              {etapaApontamento === "enfesto_corte" && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-1.5">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                    <Scissors className="w-3.5 h-3.5" />
                    Sobra de Retalho Gerada (kg)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2.5 kg"
                    value={retalhoGeradoKg || ""}
                    onChange={(e) => setRetalhoGeradoKg(Number(e.target.value))}
                    className="w-full p-1.5 bg-surface border border-border-main rounded-lg text-xs font-mono font-bold text-text-main"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="finalizar"
                  checked={finalizarEtapa}
                  onChange={(e) => setFinalizarEtapa(e.target.checked)}
                  className="rounded border-border-main text-brand-primary"
                />
                <label htmlFor="finalizar" className="font-semibold text-text-main text-[11px]">
                  Avançar OP para o próximo estágio automaticamente
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setOpParaApontamento(null)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover text-text-main rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold shadow-sm cursor-pointer"
                >
                  Gravar Apontamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
