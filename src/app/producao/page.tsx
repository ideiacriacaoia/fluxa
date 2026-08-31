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
import { formatDate, formatNumber, formatBRL } from "@/lib/utils";
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
    { id: "planejada", title: "1. Planejadas", color: "border-slate-300", badge: "bg-slate-100 text-slate-700" },
    { id: "em_corte", title: "2. Em Corte / Enfesto", color: "border-amber-400", badge: "bg-amber-100 text-amber-800" },
    { id: "em_costura", title: "3. Em Costura / Facção", color: "border-blue-400", badge: "bg-blue-100 text-blue-800" },
    { id: "em_acabamento", title: "4. Acabamento & Revisão", color: "border-purple-400", badge: "bg-purple-100 text-purple-800" },
    { id: "finalizada", title: "5. Finalizadas (Estoque PA)", color: "border-emerald-400", badge: "bg-emerald-100 text-emerald-800" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-500/20 text-sky-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-sky-500/30">
              PRD v2: Operação Real Validada
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Factory className="w-5 h-5 text-sky-600" />
            PCP & Chão de Fábrica (Ordens de Produção)
          </h1>
          <p className="text-xs text-slate-500">
            Acompanhe OPs sob encomenda ou para estoque, modos de corte (enfesto/peça a peça) e etapas internas ou por facção.
          </p>
        </div>

        <button
          onClick={() => setModalNovaOP(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Abrir Nova OP
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {colunasKanban.map((col) => {
          const opsNaColuna = ordensProducao.filter((op) => op.status === col.id);

          return (
            <div
              key={col.id}
              className={`bg-slate-100/70 rounded-xl p-3 border-t-4 ${col.color} flex flex-col space-y-3 min-h-[620px]`}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-800">{col.title}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${col.badge}`}>
                  {opsNaColuna.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {opsNaColuna.map((op) => {
                  const progresso = Math.round(
                    ((op.quantidade_produzida || 0) / (op.quantidade_planejada || 1)) * 100
                  );

                  return (
                    <div
                      key={op.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          OP #{op.numero_op}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">
                          {op.quantidade_planejada} pçs
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {op.produto_nome}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Ref: {op.produto_referencia}
                        </span>
                      </div>

                      {/* Badges de Operação Real (PRD v2) */}
                      <div className="flex flex-wrap gap-1">
                        {/* Origem */}
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            op.origem === "pedido_venda"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          <ShoppingBag className="w-2.5 h-2.5" />
                          {op.origem === "pedido_venda"
                            ? `${op.numero_pedido_venda || "Encomenda"}`
                            : "Estoque"}
                        </span>

                        {/* Modo de Corte */}
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Scissors className="w-2.5 h-2.5" />
                          {op.modo_corte === "enfesto" ? "Enfesto" : "Peça a Peça"}
                        </span>

                        {/* Execução de Costura */}
                        {op.etapas_execucao?.costura && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              op.etapas_execucao.costura.tipo === "faccao"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {op.etapas_execucao.costura.tipo === "faccao"
                              ? `Facção: ${op.etapas_execucao.costura.terceirizado_nome || "Ext"}`
                              : "Costura Interna"}
                          </span>
                        )}
                      </div>

                      {/* Lotes / Retalhos consumidos */}
                      {op.consumos && op.consumos.length > 0 && (
                        <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center gap-1 truncate">
                          <QrCode className="w-3 h-3 text-sky-600 flex-shrink-0" />
                          <span className="truncate">{op.consumos[0].codigo_lote}</span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Produzido</span>
                          <span className="font-bold text-slate-700">
                            {op.quantidade_produzida}/{op.quantidade_planejada} ({progresso}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-sky-600 h-1.5 rounded-full"
                            style={{ width: `${progresso}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
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
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded text-[11px] transition-colors"
                        >
                          Apontamento
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

      {/* Modal Nova Ordem de Produção (PRD v2 Completo) */}
      {modalNovaOP && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-sky-600" />
                  Abertura de Ordem de Produção (OP)
                </h2>
                <p className="text-xs text-slate-500">
                  Configure a origem (encomenda vs estoque), modo de corte e mão de obra por etapa.
                </p>
              </div>
              <button
                onClick={() => setModalNovaOP(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarNovaOP} className="space-y-4 text-xs">
              {/* Section 1: Origem & Dados Básicos */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">
                  1. Origem da Ordem de Produção
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Origem *</label>
                    <select
                      value={origemOP}
                      onChange={(e: any) => setOrigemOP(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    >
                      <option value="estoque">Para Estoque (Reposição/Previsão)</option>
                      <option value="pedido_venda">Sob Encomenda (Pedido de Venda)</option>
                    </select>
                  </div>

                  {origemOP === "pedido_venda" && (
                    <>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Nº Pedido de Venda
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: PV-2026-095"
                          value={numeroPedidoVenda}
                          onChange={(e) => setNumeroPedidoVenda(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Cliente / Marca
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Lojas Renner, Riachuelo..."
                          value={clienteNome}
                          onChange={(e) => setClienteNome(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 2: Produto, Depósito e Modo de Corte */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Produto / Modelo *</label>
                  <select
                    value={produtoId}
                    onChange={(e) => setProdutoId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
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
                  <label className="block font-semibold text-slate-700 mb-1">Modo de Corte *</label>
                  <select
                    value={modoCorte}
                    onChange={(e: any) => setModoCorte(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-amber-900"
                  >
                    <option value="enfesto">Enfesto (Corte em camadas para lote)</option>
                    <option value="peca_a_peca">Peça a Peça (Corte individual sob demanda)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Depósito de Produção</label>
                  <select
                    value={depositoId}
                    onChange={(e) => setDepositoId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {depositos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Início Previsto</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entrega Prevista</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Observações da OP</label>
                  <input
                    type="text"
                    placeholder="Instruções de costura ou embalagem..."
                    value={obsOP}
                    onChange={(e) => setObsOP(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Section 3: Mão de Obra por Etapa (Interna vs Facção) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">
                  2. Definição de Mão de Obra por Etapa
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Corte */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Etapa: Corte</span>
                    <select
                      value={corteTipo}
                      onChange={(e: any) => setCorteTipo(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                    >
                      <option value="interna">Corte Interno</option>
                      <option value="faccao">Terceirizado / Facção</option>
                    </select>
                  </div>

                  {/* Costura */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Etapa: Costura</span>
                    <select
                      value={costuraTipo}
                      onChange={(e: any) => setCosturaTipo(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                    >
                      <option value="faccao">Facção Terceirizada</option>
                      <option value="interna">Costura Interna</option>
                    </select>

                    {costuraTipo === "faccao" && (
                      <select
                        value={costuraFaccaoId}
                        onChange={(e) => setCosturaFaccaoId(e.target.value)}
                        className="w-full p-1.5 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-900"
                      >
                        {fornecedores
                          .filter((f) => f.tipo === "faccao")
                          .map((fac) => (
                            <option key={fac.id} value={fac.id}>
                              {fac.nome_fantasia || fac.razao_social}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>

                  {/* Acabamento */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Etapa: Acabamento</span>
                    <select
                      value={acabamentoTipo}
                      onChange={(e: any) => setAcabamentoTipo(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                    >
                      <option value="interna">Acabamento Interno</option>
                      <option value="faccao">Facção Externa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Matriz de Quantidades por Grade */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">3. Distribuição de Peças por Grade</h3>
                  <span className="font-bold text-sky-700">
                    Total: {totalPlanejadoNovaOP} peças programadas
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {produtoSelecionado.variacoes?.map((v) => (
                    <div key={v.id} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-700 block truncate">
                        {v.cor_nome} - {v.tamanho}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Qtd"
                        value={gradeQuantidades[v.id] || ""}
                        onChange={(e) => {
                          setGradeQuantidades({
                            ...gradeQuantidades,
                            [v.id]: Number(e.target.value),
                          });
                        }}
                        className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Reserva de Lote de Tecido & Consumo de Retalhos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2">
                  <span className="font-bold text-sky-950 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-sky-600" />
                    Lote de Tecido Virgem
                  </span>
                  <select
                    value={loteConsumoId}
                    onChange={(e) => setLoteConsumoId(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-300 rounded-lg text-xs"
                  >
                    <option value="">Nenhum</option>
                    {lotes.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.codigo_lote} ({l.cor_nome}) - Saldo: {l.quantidade_atual} {l.unidade_medida}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 block">
                    Necessidade: ~{formatNumber(kgNecessariosTecido, 2)} kg
                  </span>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-amber-600" />
                    Reaproveitar Retalho Disponível
                  </span>
                  <select
                    value={retalhoConsumoId}
                    onChange={(e) => setRetalhoConsumoId(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
                  >
                    <option value="">Não utilizar retalhos</option>
                    {retalhos
                      .filter((r) => r.status === "disponivel")
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.codigo_retalho} ({r.cor_nome}) - {r.peso_residual_kg} kg ({r.metragem_residual_m}m)
                        </option>
                      ))}
                  </select>
                  <span className="text-[11px] text-amber-800 block">
                    Consumo prioritário de sobras para economia de tecido
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovaOP(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={totalPlanejadoNovaOP <= 0}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg font-semibold"
                >
                  Liberar Ordem de Produção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Apontamento de Produção em Tempo Real (com Retalhos) */}
      {opParaApontamento && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Apontamento — OP #{opParaApontamento.numero_op} ({opParaApontamento.produto_nome})
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span>Modo: <strong>{opParaApontamento.modo_corte}</strong></span>
                  <span>• Origem: <strong>{opParaApontamento.origem}</strong></span>
                  {opParaApontamento.cliente_nome && <span>• Cliente: <strong>{opParaApontamento.cliente_nome}</strong></span>}
                </div>
              </div>
              <button
                onClick={() => setOpParaApontamento(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarApontamento} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Etapa de Produção *</label>
                  <select
                    value={etapaApontamento}
                    onChange={(e: any) => setEtapaApontamento(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="enfesto_corte">1. Enfesto & Corte</option>
                    <option value="costura_interna">2. Costura Interna</option>
                    <option value="faccao_externa">3. Facção Terceirizada</option>
                    <option value="revisao_qualidade">4. Revisão / Qualidade</option>
                    <option value="embalagem">5. Embalagem & Entrada PA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {etapaApontamento === "faccao_externa" ? "Terceirizado / Facção" : "Operador / Célula"}
                  </label>
                  {etapaApontamento === "faccao_externa" ? (
                    <select
                      value={terceirizadoId}
                      onChange={(e) => setTerceirizadoId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {fornecedores
                        .filter((f) => f.tipo === "faccao")
                        .map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            {fac.nome_fantasia || fac.razao_social}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={operadorNome}
                      onChange={(e) => setOperadorNome(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quantidade de Peças Processadas *
                  </label>
                  <input
                    type="number"
                    value={qtdProcessada}
                    onChange={(e) => setQtdProcessada(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempo Gasto (minutos)</label>
                  <input
                    type="number"
                    value={tempoMinutos}
                    onChange={(e) => setTempoMinutos(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peças com Defeito / 2ª Qualidade</label>
                  <input
                    type="number"
                    value={qtdDefeito}
                    onChange={(e) => setQtdDefeito(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-rose-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Motivo do Defeito (se houver)</label>
                  <input
                    type="text"
                    placeholder="Ex: Ponto frouxo na bainha..."
                    value={motivoDefeito}
                    onChange={(e) => setMotivoDefeito(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Registro Automático de Retalho no Corte (PRD v2) */}
              {etapaApontamento === "enfesto_corte" && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-amber-700" />
                    Sobra Aproveitável de Tecido (Geração Automática de Retalho)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Peso do Retalho Gerado (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 3.5"
                        value={retalhoGeradoKg || ""}
                        onChange={(e) => setRetalhoGeradoKg(Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs font-bold"
                      />
                    </div>
                    <div className="flex items-center text-[11px] text-amber-800">
                      O sistema criará automaticamente um lote em <strong>Estoque de Retalhos</strong> vinculado a esta OP e ao lote de origem.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="finalizar"
                  checked={finalizarEtapa}
                  onChange={(e) => setFinalizarEtapa(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="finalizar" className="font-semibold text-slate-800">
                  Avançar OP para o próximo estágio automaticamente
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpParaApontamento(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold"
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
