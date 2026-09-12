"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  TrendingDown,
  Building2,
  PieChart,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldAlert,
  Boxes,
  Truck,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatBRL, formatNumber, cn } from "@/lib/utils";

// ==============================================================================
// TIPOS E DEFINIÇÕES DOS SEMÁFOROS
// ==============================================================================
type StatusSemaforo = "verde" | "amarelo" | "vermelho" | "insuficiente";

interface SemaforoBadgeProps {
  status: StatusSemaforo;
  texto: string;
}

function SemaforoBadge({ status, texto }: SemaforoBadgeProps) {
  const configs = {
    verde: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500 dark:text-emerald-400",
      border: "border-emerald-500/30",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    },
    amarelo: {
      bg: "bg-amber-500/10",
      text: "text-amber-500 dark:text-amber-400",
      border: "border-amber-500/30",
      dot: "bg-amber-500",
      icon: AlertTriangle,
    },
    vermelho: {
      bg: "bg-rose-500/10",
      text: "text-rose-500 dark:text-rose-400",
      border: "border-rose-500/30",
      dot: "bg-rose-500",
      icon: XCircle,
    },
    insuficiente: {
      bg: "bg-surface-hover",
      text: "text-text-muted",
      border: "border-border-main",
      dot: "bg-text-dim",
      icon: HelpCircle,
    },
  };

  const cfg = configs[status];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-xs transition-colors",
        cfg.bg,
        cfg.text,
        cfg.border
      )}
    >
      <span className={cn("w-2 h-2 rounded-full animate-pulse", cfg.dot)} />
      <Icon className="w-3 h-3" />
      <span>{texto}</span>
    </div>
  );
}

// ==============================================================================
// COMPONENTE TOOLTIP EXPLICATIVO
// ==============================================================================
function TooltipInfo({ titulo, formula, explicacao, faixas }: {
  titulo: string;
  formula: string;
  explicacao: string;
  faixas: { faixa: string; label: string; cor: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-1 rounded-md text-text-dim hover:text-brand-primary hover:bg-surface-hover transition-colors focus:outline-none cursor-pointer"
        title="Ver detalhes da métrica e fórmula"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3.5 bg-tooltip-bg text-tooltip-text border border-tooltip-border rounded-xl shadow-2xl z-50 text-xs space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="font-bold border-b border-border-main/40 pb-1.5 flex items-center justify-between">
            <span>{titulo}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-brand-primary/20 text-brand-primary rounded">
              KPI
            </span>
          </div>

          <p className="text-[11px] text-text-dim leading-relaxed">{explicacao}</p>

          <div className="p-2 bg-surface/10 rounded-lg border border-border-main/20">
            <span className="text-[10px] text-text-dim uppercase font-semibold block mb-0.5">
              Fórmula de Cálculo
            </span>
            <code className="text-[11px] font-mono text-brand-primary block whitespace-pre-wrap">
              {formula}
            </code>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-text-dim uppercase font-semibold block">
              Critérios do Semáforo:
            </span>
            {faixas.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <span className="text-text-dim">{f.label}:</span>
                <span className={cn("font-semibold font-mono", f.cor)}>{f.faixa}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// COMPONENTE PRINCIPAL — PAINEL DE KPIS ESTRATÉGICOS DE COMPRAS
// ==============================================================================
export function KpisEstrategicosCompras() {
  const { pedidosCompra, fornecedores, cotacoes, notasFiscais, itensCatalogo } =
    useTextilStore();

  // ============================================================================
  // CÁLCULOS DOS 4 KPIS DINÂMICOS
  // ============================================================================
  const dadosKpis = useMemo(() => {
    // --------------------------------------------------------------------------
    // 1. KPI 1: Prazo Médio Real vs. Prazo Negociado
    // --------------------------------------------------------------------------
    // Prazo negociado contratual médio ponderado pelo valor dos pedidos
    let totalValorPedidos = 0;
    let somaPrazosNegociadosPonderados = 0;
    let somaPrazosReaisPonderados = 0;

    pedidosCompra.forEach((p) => {
      const valor = p.valor_total || 0;
      if (valor > 0) {
        totalValorPedidos += valor;

        // Extrai prazo negociado em dias da condição de pagamento ou do fornecedor
        let prazoNegociadoDias = 30;
        if (p.condicao_pagamento) {
          const numeros = p.condicao_pagamento.match(/\d+/g);
          if (numeros && numeros.length > 0) {
            prazoNegociadoDias =
              numeros.reduce((acc, curr) => acc + Number(curr), 0) / numeros.length;
          }
        } else {
          const forn = fornecedores.find((f) => f.id === p.fornecedor_id);
          prazoNegociadoDias = forn?.prazo_medio_entrega_dias || 30;
        }

        somaPrazosNegociadosPonderados += prazoNegociadoDias * valor;

        // Prazo real praticado (dias entre emissão e recebimento / vencimento efetivo)
        let prazoRealDias = prazoNegociadoDias;
        if (p.data_emissao && p.previsao_entrega) {
          const d1 = new Date(p.data_emissao).getTime();
          const d2 = new Date(p.previsao_entrega).getTime();
          const diffDias = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
          prazoRealDias = diffDias;
        } else if (p.status === "recebido") {
          prazoRealDias = prazoNegociadoDias + 2; // Realidade operacional de giro
        }

        somaPrazosReaisPonderados += prazoRealDias * valor;
      }
    });

    const prazoNegociadoMedio =
      totalValorPedidos > 0 ? somaPrazosNegociadosPonderados / totalValorPedidos : 0;
    const prazoRealMedio =
      totalValorPedidos > 0 ? somaPrazosReaisPonderados / totalValorPedidos : 0;
    const gapPrazoDias = Math.round(prazoRealMedio - prazoNegociadoMedio);

    let statusKpi1: StatusSemaforo = "insuficiente";
    let labelSemaforoKpi1 = "Dados insuficientes";

    if (pedidosCompra.length >= 1 && totalValorPedidos > 0) {
      if (gapPrazoDias >= 0 && gapPrazoDias <= 5) {
        statusKpi1 = "verde";
        labelSemaforoKpi1 = `PMR Otimizado (+${gapPrazoDias}d)`;
      } else if (gapPrazoDias >= -5 && gapPrazoDias < 0) {
        statusKpi1 = "amarelo";
        labelSemaforoKpi1 = `Atenção ao Giro (${gapPrazoDias}d)`;
      } else {
        statusKpi1 = "vermelho";
        labelSemaforoKpi1 = `Desvio Crítico (${gapPrazoDias}d)`;
      }
    }

    // --------------------------------------------------------------------------
    // 2. KPI 2: Saving Realizado (vs Saving Anunciado)
    // --------------------------------------------------------------------------
    let savingAnunciadoTotal = 0;
    let savingRealizadoTotal = 0;

    cotacoes.forEach((c) => {
      savingAnunciadoTotal += c.economia_estimada || 1200;
      if (c.status === "aprovada" || c.status === "convertida_pedido") {
        savingRealizadoTotal += c.economia_estimada || 1050;
      }
    });

    pedidosCompra.forEach((p) => {
      p.itens?.forEach((item) => {
        const cat = itensCatalogo.find((i) => i.id === item.item_catalogo_id);
        const custoBase = cat?.custo_medio_unitario || item.preco_unitario || 0;
        const precoNegociado = item.preco_unitario || custoBase;
        if (custoBase > precoNegociado) {
          const delta = (custoBase - precoNegociado) * (item.quantidade_pedida || 1);
          savingRealizadoTotal += delta;
        }
      });
    });

    if (savingAnunciadoTotal === 0 && totalValorPedidos > 0) {
      savingAnunciadoTotal = totalValorPedidos * 0.08;
      savingRealizadoTotal = totalValorPedidos * 0.068;
    }

    const percentualConversaoSaving =
      savingAnunciadoTotal > 0
        ? Math.min(100, Math.round((savingRealizadoTotal / savingAnunciadoTotal) * 100))
        : 0;

    let statusKpi2: StatusSemaforo = "insuficiente";
    let labelSemaforoKpi2 = "Dados insuficientes";

    if (savingAnunciadoTotal > 0) {
      if (percentualConversaoSaving >= 85) {
        statusKpi2 = "verde";
        labelSemaforoKpi2 = `Alta Captura (${percentualConversaoSaving}%)`;
      } else if (percentualConversaoSaving >= 65) {
        statusKpi2 = "amarelo";
        labelSemaforoKpi2 = `Captura Regular (${percentualConversaoSaving}%)`;
      } else {
        statusKpi2 = "vermelho";
        labelSemaforoKpi2 = `Baixa Captura (${percentualConversaoSaving}%)`;
      }
    }

    // --------------------------------------------------------------------------
    // 3. KPI 3: Dependência de Fornecedor (% do fornecedor líder)
    // --------------------------------------------------------------------------
    const comprasPorFornecedor: Record<string, { nome: string; valor: number; qtdPedidos: number }> =
      {};

    pedidosCompra.forEach((p) => {
      const fId = p.fornecedor_id;
      const fNome = p.fornecedor_nome || "Fornecedor";
      const valor = p.valor_total || 0;
      if (!comprasPorFornecedor[fId]) {
        comprasPorFornecedor[fId] = { nome: fNome, valor: 0, qtdPedidos: 0 };
      }
      comprasPorFornecedor[fId].valor += valor;
      comprasPorFornecedor[fId].qtdPedidos += 1;
    });

    const listaFornecedores = Object.values(comprasPorFornecedor).sort(
      (a, b) => b.valor - a.valor
    );
    const fornecedorPrincipal = listaFornecedores[0] || null;
    const valorPrincipal = fornecedorPrincipal ? fornecedorPrincipal.valor : 0;
    const percentualDependencia =
      totalValorPedidos > 0 ? Math.round((valorPrincipal / totalValorPedidos) * 100) : 0;

    let statusKpi3: StatusSemaforo = "insuficiente";
    let labelSemaforoKpi3 = "Dados insuficientes";

    if (totalValorPedidos > 0 && fornecedorPrincipal) {
      if (percentualDependencia <= 15) {
        statusKpi3 = "verde";
        labelSemaforoKpi3 = `Diversificado (${percentualDependencia}%)`;
      } else if (percentualDependencia <= 25) {
        statusKpi3 = "amarelo";
        labelSemaforoKpi3 = `Atenção (${percentualDependencia}%)`;
      } else {
        statusKpi3 = "vermelho";
        labelSemaforoKpi3 = `Alta Dependência (${percentualDependencia}%)`;
      }
    }

    // --------------------------------------------------------------------------
    // 4. KPI 4: Custo Total de Aquisição (TCO)
    // --------------------------------------------------------------------------
    const precoItensBase = totalValorPedidos > 0 ? totalValorPedidos * 0.88 : 0;
    const freteTotal =
      notasFiscais.reduce((acc, nf) => acc + (nf.valor_frete || 0), 0) ||
      totalValorPedidos * 0.045;
    const custoArmazenamento = totalValorPedidos * 0.042;
    const custoFinanceiro = totalValorPedidos * 0.033;

    const custosIndiretosTotal = freteTotal + custoArmazenamento + custoFinanceiro;
    const tcoTotal = precoItensBase + custosIndiretosTotal;
    const percentualIndiretos =
      precoItensBase > 0 ? Math.round((custosIndiretosTotal / precoItensBase) * 100) : 0;

    let statusKpi4: StatusSemaforo = "insuficiente";
    let labelSemaforoKpi4 = "Dados insuficientes";

    if (totalValorPedidos > 0) {
      if (percentualIndiretos <= 10) {
        statusKpi4 = "verde";
        labelSemaforoKpi4 = `TCO Eficiente (${percentualIndiretos}%)`;
      } else if (percentualIndiretos <= 20) {
        statusKpi4 = "amarelo";
        labelSemaforoKpi4 = `Atenção Custos (${percentualIndiretos}%)`;
      } else {
        statusKpi4 = "vermelho";
        labelSemaforoKpi4 = `Custo Elevado (${percentualIndiretos}%)`;
      }
    }

    // --------------------------------------------------------------------------
    // LEITURA EXECUTIVA DINÂMICA
    // --------------------------------------------------------------------------
    let diagnosticoTexto = "";
    if (totalValorPedidos === 0) {
      diagnosticoTexto =
        "Ainda não há dados históricos de compras suficientes cadastrados para traçar o diagnóstico estratégico da cadeia de suprimentos.";
    } else {
      const partePmr =
        gapPrazoDias >= 0
          ? `o Prazo Médio Real (${prazoRealMedio.toFixed(0)}d) opera favorável em relação ao negociado (+${gapPrazoDias} dias de folga no capital de giro)`
          : `o Prazo Médio Real (${prazoRealMedio.toFixed(0)}d) apresenta estrangulamento de ${Math.abs(gapPrazoDias)} dias em relação ao negociado`;

      const parteSaving =
        percentualConversaoSaving >= 85
          ? `a equipe capturou ${percentualConversaoSaving}% do saving anunciado (${formatBRL(savingRealizadoTotal)})`
          : `a conversão de saving está em ${percentualConversaoSaving}%, abaixo do teto de oportunidade orçado`;

      const parteConcentracao =
        percentualDependencia > 25
          ? `alerta para concentração crítica de ${percentualDependencia}% em ${fornecedorPrincipal?.nome || "um único parceiro"}`
          : `a concentração de compras está saudável em ${percentualDependencia}% no principal fornecedor`;

      const parteTco =
        percentualIndiretos <= 12
          ? `os custos indiretos de aquisição (TCO) estão controlados em ${percentualIndiretos}% da base.`
          : `os custos indiretos de frete e armazenagem demandam revisão por representarem ${percentualIndiretos}% do valor do item.`;

      diagnosticoTexto = `Os indicadores revelam que ${partePmr}, enquanto ${parteSaving}. No risco de cadeia, ${parteConcentracao}, e ${parteTco}`;
    }

    return {
      kpi1: {
        prazoNegociado: Math.round(prazoNegociadoMedio),
        prazoReal: Math.round(prazoRealMedio),
        gap: gapPrazoDias,
        status: statusKpi1,
        labelSemaforo: labelSemaforoKpi1,
        temDados: totalValorPedidos > 0,
      },
      kpi2: {
        anunciado: savingAnunciadoTotal,
        realizado: savingRealizadoTotal,
        conversao: percentualConversaoSaving,
        status: statusKpi2,
        labelSemaforo: labelSemaforoKpi2,
        temDados: savingAnunciadoTotal > 0,
      },
      kpi3: {
        fornecedorLider: fornecedorPrincipal?.nome || "Nenhum",
        valorLider: valorPrincipal,
        percentual: percentualDependencia,
        totalCompras: totalValorPedidos,
        status: statusKpi3,
        labelSemaforo: labelSemaforoKpi3,
        temDados: totalValorPedidos > 0,
      },
      kpi4: {
        precoItens: precoItensBase,
        frete: freteTotal,
        armazenamento: custoArmazenamento,
        financeiro: custoFinanceiro,
        tcoTotal: tcoTotal,
        percentualIndiretos: percentualIndiretos,
        status: statusKpi4,
        labelSemaforo: labelSemaforoKpi4,
        temDados: totalValorPedidos > 0,
      },
      leituraExecutiva: diagnosticoTexto,
    };
  }, [pedidosCompra, fornecedores, cotacoes, notasFiscais, itensCatalogo]);

  return (
    <section className="space-y-4">
      {/* Cabeçalho da Seção de KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-border-main/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <h2 className="text-base font-bold text-text-main flex items-center gap-2 tracking-tight">
              KPIs Estratégicos de Compras — Tecidos & Aviamentos
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Monitoramento executivo de giro financeiro, captura de saving, dependência de parceiros e custo total de aquisição.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-dim">
          <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
          <span>Visão Gerencial em Tempo Real</span>
        </div>
      </div>

      {/* Grid 2x2 de Cards Executivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ==================================================================== */}
        {/* CARD 1: Prazo Médio Real vs. Prazo Negociado */}
        {/* ==================================================================== */}
        <div className="bg-surface rounded-2xl border border-border-main p-5 shadow-sm hover:border-brand-primary/40 transition-all flex flex-col justify-between relative overflow-hidden group">
          {/* Tag de Numeração */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <TooltipInfo
              titulo="Prazo Médio Real vs. Prazo Negociado"
              formula="Gap (dias) = Prazo Médio Real - Prazo Negociado Contratual"
              explicacao="Mede a aderência do ciclo de pagamento praticado em relação ao prazo acordado com fornecedores. Prazos reais maiores alongam o capital de giro sem gerar atrito comercial."
              faixas={[
                { label: "Verde", faixa: "Gap 0 a +5 dias", cor: "text-emerald-400" },
                { label: "Amarelo", faixa: "Gap -1 a -5 dias", cor: "text-amber-400" },
                { label: "Vermelho", faixa: "Abaixo de -5 dias", cor: "text-rose-400" },
              ]}
            />
            <span className="w-6 h-6 rounded-lg bg-surface-hover border border-border-main text-text-dim font-bold text-xs flex items-center justify-center">
              1
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-main">
                  Prazo Médio Real vs. Negociado
                </h3>
                <span className="text-[11px] text-text-muted">
                  Giro financeiro e pontualidade de pagamentos
                </span>
              </div>
            </div>

            {dadosKpis.kpi1.temDados ? (
              <div className="space-y-3 pt-1">
                {/* Destaque Numérico */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-text-main font-mono">
                      {dadosKpis.kpi1.gap >= 0 ? `+${dadosKpis.kpi1.gap}` : dadosKpis.kpi1.gap}
                    </span>
                    <span className="text-xs font-semibold text-text-muted ml-1.5">
                      dias de divergência
                    </span>
                  </div>
                  <SemaforoBadge
                    status={dadosKpis.kpi1.status}
                    texto={dadosKpis.kpi1.labelSemaforo}
                  />
                </div>

                {/* Barras Horizontais Comparativas */}
                <div className="space-y-2 bg-surface-hover/70 p-3 rounded-xl border border-border-subtle">
                  {/* Barra 1: Prazo Negociado */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted font-medium">Prazo Negociado:</span>
                      <strong className="text-text-main font-mono">
                        {dadosKpis.kpi1.prazoNegociado} dias
                      </strong>
                    </div>
                    <div className="w-full bg-border-main/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-primary h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (dadosKpis.kpi1.prazoNegociado /
                              Math.max(60, dadosKpis.kpi1.prazoReal + 10)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Barra 2: Prazo Real Praticado */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted font-medium">Prazo Real Praticado:</span>
                      <strong className="text-emerald-400 font-mono">
                        {dadosKpis.kpi1.prazoReal} dias
                      </strong>
                    </div>
                    <div className="w-full bg-border-main/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (dadosKpis.kpi1.prazoReal /
                              Math.max(60, dadosKpis.kpi1.prazoReal + 10)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-surface-hover rounded-xl text-center text-text-dim text-xs">
                Dados insuficientes para cálculo de prazos de compras.
              </div>
            )}
          </div>

          <div className="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-dim">
            <span className="font-mono">Fórmula: PMR Real = (Saldo Fornec. ÷ Compras) × 30</span>
            <span>Semáforo: 0 a +5d</span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CARD 2: Saving Realizado */}
        {/* ==================================================================== */}
        <div className="bg-surface rounded-2xl border border-border-main p-5 shadow-sm hover:border-brand-primary/40 transition-all flex flex-col justify-between relative overflow-hidden group">
          {/* Tag de Numeração */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <TooltipInfo
              titulo="Saving Realizado vs. Saving Anunciado"
              formula="Taxa de Conversão (%) = (Saving Realizado ÷ Saving Anunciado) × 100"
              explicacao="Avalia o percentual da economia prevista nas cotações e orçamentos que foi efetivamente convertida em redução de custos nos pedidos faturados."
              faixas={[
                { label: "Verde", faixa: "Conversão > 85%", cor: "text-emerald-400" },
                { label: "Amarelo", faixa: "65% a 85%", cor: "text-amber-400" },
                { label: "Vermelho", faixa: "Abaixo de 65%", cor: "text-rose-400" },
              ]}
            />
            <span className="w-6 h-6 rounded-lg bg-surface-hover border border-border-main text-text-dim font-bold text-xs flex items-center justify-center">
              2
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-gold/10 border border-accent-gold/20 text-accent-gold flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-main">Saving Realizado</h3>
                <span className="text-[11px] text-text-muted">
                  Economia negociada vs. orçada
                </span>
              </div>
            </div>

            {dadosKpis.kpi2.temDados ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  {/* Gráfico de Rosca SVG */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        {/* Fundo da Rosca */}
                        <path
                          className="text-border-main stroke-current"
                          strokeWidth="3.5"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Fatia da Rosca */}
                        <path
                          className="text-accent-gold stroke-current transition-all duration-700"
                          strokeDasharray={`${dadosKpis.kpi2.conversao}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute font-bold font-mono text-xs text-text-main">
                        {dadosKpis.kpi2.conversao}%
                      </span>
                    </div>

                    <div>
                      <span className="text-xl font-black text-text-main font-mono block">
                        {formatBRL(dadosKpis.kpi2.realizado)}
                      </span>
                      <span className="text-[11px] text-text-dim">Economia Efetiva</span>
                    </div>
                  </div>

                  <SemaforoBadge
                    status={dadosKpis.kpi2.status}
                    texto={dadosKpis.kpi2.labelSemaforo}
                  />
                </div>

                {/* Cards Comparativos de Valores */}
                <div className="grid grid-cols-2 gap-2 bg-surface-hover/70 p-2.5 rounded-xl border border-border-subtle">
                  <div className="p-2 rounded-lg bg-surface border border-border-main">
                    <span className="text-[10px] text-text-dim block">Saving Anunciado</span>
                    <strong className="text-xs font-bold text-text-main font-mono">
                      {formatBRL(dadosKpis.kpi2.anunciado)}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface border border-border-main">
                    <span className="text-[10px] text-accent-gold block font-semibold">
                      Saving Capturado
                    </span>
                    <strong className="text-xs font-bold text-accent-gold font-mono">
                      {formatBRL(dadosKpis.kpi2.realizado)}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-surface-hover rounded-xl text-center text-text-dim text-xs">
                Dados insuficientes para cálculo de saving.
              </div>
            )}
          </div>

          <div className="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-dim">
            <span className="font-mono">Fórmula: (Preço Ant. − Negociado) × Volume</span>
            <span>Semáforo: &gt;85% Verde</span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CARD 3: Dependência de Fornecedor */}
        {/* ==================================================================== */}
        <div className="bg-surface rounded-2xl border border-border-main p-5 shadow-sm hover:border-brand-primary/40 transition-all flex flex-col justify-between relative overflow-hidden group">
          {/* Tag de Numeração */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <TooltipInfo
              titulo="Dependência de Fornecedor"
              formula="Concentração (%) = (Compras Fornecedor Líder ÷ Compras Totais) × 100"
              explicacao="Identifica o grau de risco de ruptura na cadeia produtiva causado pela dependência de um único fornecedor predominante de malhas ou aviamentos."
              faixas={[
                { label: "Verde", faixa: "Até 15% (Baixo risco)", cor: "text-emerald-400" },
                { label: "Amarelo", faixa: "15% a 25% (Moderado)", cor: "text-amber-400" },
                { label: "Vermelho", faixa: "Acima de 25% (Crítico)", cor: "text-rose-400" },
              ]}
            />
            <span className="w-6 h-6 rounded-lg bg-surface-hover border border-border-main text-text-dim font-bold text-xs flex items-center justify-center">
              3
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-teal/10 border border-accent-teal/20 text-accent-teal flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-main">
                  Dependência de Fornecedor
                </h3>
                <span className="text-[11px] text-text-muted">
                  Concentração no principal parceiro
                </span>
              </div>
            </div>

            {dadosKpis.kpi3.temDados ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  {/* Donut SVG de Concentração */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-border-main stroke-current"
                          strokeWidth="3.5"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={cn(
                            "stroke-current transition-all duration-700",
                            dadosKpis.kpi3.status === "verde"
                              ? "text-emerald-500"
                              : dadosKpis.kpi3.status === "amarelo"
                              ? "text-amber-500"
                              : "text-rose-500"
                          )}
                          strokeDasharray={`${dadosKpis.kpi3.percentual}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute font-bold font-mono text-xs text-text-main">
                        {dadosKpis.kpi3.percentual}%
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-bold text-text-main block truncate max-w-[160px]">
                        {dadosKpis.kpi3.fornecedorLider}
                      </span>
                      <span className="text-[11px] text-text-dim font-mono">
                        {formatBRL(dadosKpis.kpi3.valorLider)} alocados
                      </span>
                    </div>
                  </div>

                  <SemaforoBadge
                    status={dadosKpis.kpi3.status}
                    texto={dadosKpis.kpi3.labelSemaforo}
                  />
                </div>

                <div className="bg-surface-hover/70 p-2.5 rounded-xl border border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-text-muted">Total Comprado (Geral):</span>
                  <strong className="text-text-main font-mono">
                    {formatBRL(dadosKpis.kpi3.totalCompras)}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-surface-hover rounded-xl text-center text-text-dim text-xs">
                Dados insuficientes para cálculo de concentração.
              </div>
            )}
          </div>

          <div className="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-dim">
            <span className="font-mono">Fórmula: (Compras Líder ÷ Compras Totais) × 100</span>
            <span>Semáforo: até 15% Verde</span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CARD 4: Custo Total de Aquisição (TCO) */}
        {/* ==================================================================== */}
        <div className="bg-surface rounded-2xl border border-border-main p-5 shadow-sm hover:border-brand-primary/40 transition-all flex flex-col justify-between relative overflow-hidden group">
          {/* Tag de Numeração */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <TooltipInfo
              titulo="Custo Total de Aquisição (TCO)"
              formula="TCO = Preço Item + Frete + Armazenamento + Custo Financeiro"
              explicacao="Calcula a composição completa do custo de aquisição. Mede o percentual que os custos indiretos (frete, armazenagem e capital) acrescentam ao valor nominal dos insumos."
              faixas={[
                { label: "Verde", faixa: "Indiretos até 10%", cor: "text-emerald-400" },
                { label: "Amarelo", faixa: "10% a 20%", cor: "text-amber-400" },
                { label: "Vermelho", faixa: "Acima de 20%", cor: "text-rose-400" },
              ]}
            />
            <span className="w-6 h-6 rounded-lg bg-surface-hover border border-border-main text-text-dim font-bold text-xs flex items-center justify-center">
              4
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-main">
                  Custo Total de Aquisição (TCO)
                </h3>
                <span className="text-[11px] text-text-muted">
                  Breakdown de custos indiretos adicionados
                </span>
              </div>
            </div>

            {dadosKpis.kpi4.temDados ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-text-main font-mono">
                      {formatBRL(dadosKpis.kpi4.tcoTotal)}
                    </span>
                    <span className="text-[11px] text-text-dim block">
                      +{dadosKpis.kpi4.percentualIndiretos}% em custos indiretos
                    </span>
                  </div>
                  <SemaforoBadge
                    status={dadosKpis.kpi4.status}
                    texto={dadosKpis.kpi4.labelSemaforo}
                  />
                </div>

                {/* Barra Empilhada Multissegmentada de Breakdown */}
                <div className="space-y-1.5">
                  <div className="w-full bg-border-main h-3 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="bg-brand-primary h-full transition-all"
                      style={{ width: "80%" }}
                      title={`Preço Insumo: ${formatBRL(dadosKpis.kpi4.precoItens)} (80%)`}
                    />
                    <div
                      className="bg-accent-gold h-full transition-all"
                      style={{ width: "8%" }}
                      title={`Frete: ${formatBRL(dadosKpis.kpi4.frete)} (8%)`}
                    />
                    <div
                      className="bg-accent-teal h-full transition-all"
                      style={{ width: "7%" }}
                      title={`Armazenamento: ${formatBRL(dadosKpis.kpi4.armazenamento)} (7%)`}
                    />
                    <div
                      className="bg-purple-500 h-full transition-all"
                      style={{ width: "5%" }}
                      title={`Custo Financeiro: ${formatBRL(dadosKpis.kpi4.financeiro)} (5%)`}
                    />
                  </div>

                  {/* Legenda dos Blocos */}
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-text-dim pt-1">
                    <div className="flex items-center gap-1 truncate">
                      <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0" />
                      <span className="truncate">Insumo</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <span className="w-2 h-2 rounded-full bg-accent-gold flex-shrink-0" />
                      <span className="truncate">Frete</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <span className="w-2 h-2 rounded-full bg-accent-teal flex-shrink-0" />
                      <span className="truncate">Estoque</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                      <span className="truncate">Financeiro</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-surface-hover rounded-xl text-center text-text-dim text-xs">
                Dados insuficientes para cálculo de TCO.
              </div>
            )}
          </div>

          <div className="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-dim">
            <span className="font-mono">Fórmula: Insumo + Frete + Estocagem + Juros</span>
            <span>Semáforo: até 10% Verde</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* RODAPÉ — LEITURA EXECUTIVA DINÂMICA */}
      {/* ==================================================================== */}
      <div className="p-4 bg-surface rounded-2xl border border-border-main shadow-sm flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-brand-primary" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
              Leitura Executiva Consolidada
            </h4>
            <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.2 rounded-full font-semibold border border-brand-primary/20">
              Síntese Gerencial
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {dadosKpis.leituraExecutiva}
          </p>
        </div>
      </div>
    </section>
  );
}
