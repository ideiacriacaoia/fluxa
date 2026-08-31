"use client";

import React, { createContext, useContext, useState } from "react";
import {
  Empresa,
  Usuario,
  Deposito,
  Fornecedor,
  ItemCatalogo,
  PedidoCompra,
  LoteRecebimento,
  EstoqueRetalho,
  EstoqueSaldo,
  MovimentacaoEstoque,
  Produto,
  FichaTecnica,
  OrdemProducao,
  OPApontamento,
  OPConsumoRetalho,
} from "@/types/database.types";
import {
  initialEmpresa,
  initialUsuarios,
  initialDepositos,
  initialFornecedores,
  initialItensCatalogo,
  initialPedidosCompra,
  initialLotesRecebimento,
  initialEstoqueRetalhos,
  initialEstoqueSaldos,
  initialMovimentacoes,
  initialProdutos,
  initialFichasTecnicas,
  initialOrdensProducao,
} from "./initial-data";

interface TextilStoreContextType {
  empresa: Empresa;
  usuarios: Usuario[];
  depositos: Deposito[];
  fornecedores: Fornecedor[];
  itensCatalogo: ItemCatalogo[];
  pedidosCompra: PedidoCompra[];
  lotes: LoteRecebimento[];
  retalhos: EstoqueRetalho[];
  saldos: EstoqueSaldo[];
  movimentacoes: MovimentacaoEstoque[];
  produtos: Produto[];
  fichasTecnicas: FichaTecnica[];
  ordensProducao: OrdemProducao[];

  // Ações de Compras & Lotes
  addPedidoCompra: (pedido: Omit<PedidoCompra, "id" | "tenant_id" | "numero_pedido" | "created_at">) => void;
  updateStatusPedidoCompra: (id: string, status: PedidoCompra["status"]) => void;
  receberLoteMercadoria: (dados: {
    pedido_compra_id?: string;
    item_pedido_id?: string;
    item_catalogo_id: string;
    fornecedor_id: string;
    nota_fiscal: string;
    chave_nfe?: string;
    codigo_lote: string;
    lote_fornecedor?: string;
    cor_nome?: string;
    cor_codigo?: string;
    largura_real_m?: number;
    gramatura_real?: number;
    quantidade: number;
    unidade_medida: string;
    custo_unitario: number;
    deposito_destino_id: string;
    observacoes?: string;
  }) => void;

  // Ações de Retalhos (PRD v2)
  gerarRetalhoCorte: (dados: {
    lote_origem_id: string;
    ordem_producao_origem_id?: string;
    numero_op_origem?: number;
    cor_nome: string;
    cor_codigo?: string;
    peso_residual_kg: number;
    metragem_residual_m?: number;
    largura_aproveitavel_m?: number;
    observacoes?: string;
  }) => void;

  // Ações de Estoque
  ajustarEstoque: (dados: {
    deposito_id: string;
    item_catalogo_id?: string;
    lote_id?: string;
    produto_variacao_id?: string;
    quantidade_ajuste: number;
    motivo: string;
  }) => void;

  // Ações de Cadastros
  addItemCatalogo: (item: Omit<ItemCatalogo, "id" | "empresa_id" | "created_at">) => void;
  addFornecedor: (fornecedor: Omit<Fornecedor, "id" | "tenant_id" | "created_at">) => void;
  addDeposito: (deposito: Omit<Deposito, "id" | "tenant_id" | "created_at">) => void;

  // Ações de Produtos e Ficha Técnica
  addProduto: (produto: Omit<Produto, "id" | "tenant_id" | "created_at">) => void;
  saveFichaTecnica: (ficha: Omit<FichaTecnica, "id" | "created_at">) => void;

  // Ações de PCP / Produção (PRD v2: Origem híbrida, Modo de Corte, Etapas mistas, Consumo de Retalho)
  addOrdemProducao: (dados: {
    produto_id: string;
    ficha_tecnica_id: string;
    deposito_producao_id: string;
    origem: "estoque" | "pedido_venda";
    numero_pedido_venda?: string;
    cliente_nome?: string;
    modo_corte: "enfesto" | "peca_a_peca";
    etapas_execucao?: {
      corte: { tipo: "interna" | "faccao"; terceirizado_id?: string; terceirizado_nome?: string };
      costura: { tipo: "interna" | "faccao"; terceirizado_id?: string; terceirizado_nome?: string };
      acabamento: { tipo: "interna" | "faccao"; terceirizado_id?: string; terceirizado_nome?: string };
    };
    quantidade_planejada: number;
    data_inicio_prevista?: string;
    data_fim_prevista?: string;
    observacoes?: string;
    grade: { produto_variacao_id: string; quantidade: number }[];
    lotes_consumo?: { lote_id: string; quantidade: number }[];
    retalhos_consumo?: { retalho_id: string; quantidade_kg: number }[];
  }) => void;
  updateStatusOP: (opId: string, novoStatus: OrdemProducao["status"]) => void;
  registrarApontamentoOP: (
    opId: string,
    apontamento: Omit<OPApontamento, "id" | "ordem_producao_id" | "created_at">,
    finalizarEtapa?: boolean
  ) => void;
}

const TextilStoreContext = createContext<TextilStoreContextType | null>(null);

export function TextilStoreProvider({ children }: { children: React.ReactNode }) {
  const [empresa] = useState<Empresa>(initialEmpresa);
  const [usuarios] = useState<Usuario[]>(initialUsuarios);
  const [depositos, setDepositos] = useState<Deposito[]>(initialDepositos);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(initialFornecedores);
  const [itensCatalogo, setItensCatalogo] = useState<ItemCatalogo[]>(initialItensCatalogo);
  const [pedidosCompra, setPedidosCompra] = useState<PedidoCompra[]>(initialPedidosCompra);
  const [lotes, setLotes] = useState<LoteRecebimento[]>(initialLotesRecebimento);
  const [retalhos, setRetalhos] = useState<EstoqueRetalho[]>(initialEstoqueRetalhos);
  const [saldos, setSaldos] = useState<EstoqueSaldo[]>(initialEstoqueSaldos);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>(initialMovimentacoes);
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>(initialFichasTecnicas);
  const [ordensProducao, setOrdensProducao] = useState<OrdemProducao[]>(initialOrdensProducao);

  // 1. Criar Pedido de Compra
  const addPedidoCompra = (
    dados: Omit<PedidoCompra, "id" | "tenant_id" | "numero_pedido" | "created_at">
  ) => {
    const fornecedor = fornecedores.find((f) => f.id === dados.fornecedor_id);
    const novoNumero = pedidosCompra.length > 0 ? Math.max(...pedidosCompra.map((p) => p.numero_pedido || 2000)) + 1 : 2001;
    const novoPedido: PedidoCompra = {
      ...dados,
      id: "pc_" + Math.random().toString(36).substr(2, 9),
      tenant_id: empresa.id,
      numero_pedido: novoNumero,
      fornecedor_nome: fornecedor?.nome_fantasia || fornecedor?.razao_social || fornecedor?.nome,
      created_at: new Date().toISOString(),
    };
    setPedidosCompra([novoPedido, ...pedidosCompra]);
  };

  // 2. Atualizar Status do Pedido de Compra
  const updateStatusPedidoCompra = (id: string, status: PedidoCompra["status"]) => {
    setPedidosCompra(
      pedidosCompra.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  // 3. Receber Lote de Mercadoria
  const receberLoteMercadoria = (dados: {
    pedido_compra_id?: string;
    item_pedido_id?: string;
    item_catalogo_id: string;
    fornecedor_id: string;
    nota_fiscal: string;
    chave_nfe?: string;
    codigo_lote: string;
    lote_fornecedor?: string;
    cor_nome?: string;
    cor_codigo?: string;
    largura_real_m?: number;
    gramatura_real?: number;
    quantidade: number;
    unidade_medida: string;
    custo_unitario: number;
    deposito_destino_id: string;
    observacoes?: string;
  }) => {
    const item = itensCatalogo.find((i) => i.id === dados.item_catalogo_id);
    const fornecedor = fornecedores.find((f) => f.id === dados.fornecedor_id);
    const deposito = depositos.find((d) => d.id === dados.deposito_destino_id);

    const novoLoteId = "lote_" + Math.random().toString(36).substr(2, 9);
    const novoLote: LoteRecebimento = {
      id: novoLoteId,
      empresa_id: empresa.id,
      item_catalogo_id: dados.item_catalogo_id,
      item_codigo: item?.codigo,
      item_descricao: item?.descricao,
      fornecedor_id: dados.fornecedor_id,
      fornecedor_nome: fornecedor?.nome_fantasia || fornecedor?.razao_social,
      pedido_compra_id: dados.pedido_compra_id,
      item_pedido_id: dados.item_pedido_id,
      codigo_lote: dados.codigo_lote,
      lote_fornecedor: dados.lote_fornecedor,
      nota_fiscal: dados.nota_fiscal,
      chave_nfe: dados.chave_nfe,
      cor_nome: dados.cor_nome,
      cor_codigo: dados.cor_codigo,
      largura_real_m: dados.largura_real_m,
      gramatura_real: dados.gramatura_real,
      quantidade_inicial: dados.quantidade,
      quantidade_atual: dados.quantidade,
      unidade_medida: dados.unidade_medida,
      custo_unitario: dados.custo_unitario,
      data_recebimento: new Date().toISOString().split("T")[0],
      deposito_destino_id: dados.deposito_destino_id,
      deposito_nome: deposito?.nome,
      observacoes: dados.observacoes,
      created_at: new Date().toISOString(),
    };

    const novoSaldo: EstoqueSaldo = {
      id: "saldo_" + Math.random().toString(36).substr(2, 9),
      empresa_id: empresa.id,
      deposito_id: dados.deposito_destino_id,
      deposito_nome: deposito?.nome,
      item_catalogo_id: dados.item_catalogo_id,
      item_codigo: item?.codigo,
      item_descricao: item?.descricao,
      lote_id: novoLoteId,
      codigo_lote: dados.codigo_lote,
      cor_nome: dados.cor_nome,
      quantidade_atual: dados.quantidade,
      quantidade_reservada: 0,
      unidade_medida: dados.unidade_medida,
      updated_at: new Date().toISOString(),
    };

    const novaMovimentacao: MovimentacaoEstoque = {
      id: "mov_" + Math.random().toString(36).substr(2, 9),
      empresa_id: empresa.id,
      deposito_id: dados.deposito_destino_id,
      deposito_nome: deposito?.nome,
      item_catalogo_id: dados.item_catalogo_id,
      item_descricao: item?.descricao,
      lote_id: novoLoteId,
      codigo_lote: dados.codigo_lote,
      tipo_movimento: "entrada_compra",
      quantidade: dados.quantidade,
      saldo_anterior: 0,
      saldo_posterior: dados.quantidade,
      unidade_medida: dados.unidade_medida,
      documento_origem_tipo: "lote_recebimento",
      documento_origem_id: novoLoteId,
      usuario_nome: usuarios[0]?.nome || "Sistema",
      created_at: new Date().toISOString(),
    };

    setLotes([novoLote, ...lotes]);
    setSaldos([novoSaldo, ...saldos]);
    setMovimentacoes([novaMovimentacao, ...movimentacoes]);

    if (dados.pedido_compra_id) {
      setPedidosCompra(
        pedidosCompra.map((pc) => {
          if (pc.id === dados.pedido_compra_id) {
            const novosItens = pc.itens?.map((it) => {
              if (it.id === dados.item_pedido_id || it.item_catalogo_id === dados.item_catalogo_id) {
                return { ...it, quantidade_entregue: (it.quantidade_entregue || 0) + dados.quantidade };
              }
              return it;
            });
            const todosEntregues = novosItens?.every(
              (it) => (it.quantidade_entregue || 0) >= (it.quantidade_pedida || it.quantidade || 0)
            );
            return {
              ...pc,
              status: todosEntregues ? ("recebido" as const) : ("parcial" as const),
              itens: novosItens,
            };
          }
          return pc;
        })
      );
    }
  };

  // 4. Gerar Estoque de Retalho a partir do Corte (PRD v2)
  const gerarRetalhoCorte = (dados: {
    lote_origem_id: string;
    ordem_producao_origem_id?: string;
    numero_op_origem?: number;
    cor_nome: string;
    cor_codigo?: string;
    peso_residual_kg: number;
    metragem_residual_m?: number;
    largura_aproveitavel_m?: number;
    observacoes?: string;
  }) => {
    const loteOrigem = lotes.find((l) => l.id === dados.lote_origem_id);
    const depRetalho =
      depositos.find((d) => d.tipo === "retalho") ||
      depositos.find((d) => d.codigo === "ALM-RET") ||
      depositos[0];

    const countSufixo = retalhos.filter((r) => r.lote_origem_id === dados.lote_origem_id).length + 1;
    const sufixoLetra = String.fromCharCode(64 + countSufixo); // A, B, C...
    const codigoRetalho = `RET-${loteOrigem?.codigo_lote || "LOTE"}-${sufixoLetra}`;

    const novoRetalho: EstoqueRetalho = {
      id: "ret_" + Math.random().toString(36).substr(2, 9),
      empresa_id: empresa.id,
      deposito_id: depRetalho.id,
      deposito_nome: depRetalho.nome,
      lote_origem_id: dados.lote_origem_id,
      codigo_lote_origem: loteOrigem?.codigo_lote,
      item_catalogo_id: loteOrigem?.item_catalogo_id || "",
      item_descricao: `${loteOrigem?.item_descricao || "Tecido"} (Sobra/Retalho)`,
      ordem_producao_origem_id: dados.ordem_producao_origem_id,
      numero_op_origem: dados.numero_op_origem,
      codigo_retalho: codigoRetalho,
      cor_nome: dados.cor_nome,
      cor_codigo: dados.cor_codigo,
      metragem_residual_m: dados.metragem_residual_m,
      peso_residual_kg: dados.peso_residual_kg,
      largura_aproveitavel_m: dados.largura_aproveitavel_m,
      status: "disponivel",
      observacoes: dados.observacoes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Ledger entry
    const novaMov: MovimentacaoEstoque = {
      id: "mov_" + Math.random().toString(36).substr(2, 9),
      empresa_id: empresa.id,
      deposito_id: depRetalho.id,
      deposito_nome: depRetalho.nome,
      item_catalogo_id: loteOrigem?.item_catalogo_id,
      item_descricao: `${loteOrigem?.item_descricao || "Tecido"} (Retalho)`,
      codigo_lote: codigoRetalho,
      tipo_movimento: "entrada_retalho_corte",
      quantidade: dados.peso_residual_kg,
      saldo_anterior: 0,
      saldo_posterior: dados.peso_residual_kg,
      unidade_medida: "kg",
      documento_origem_tipo: "estoque_retalho",
      documento_origem_id: novoRetalho.id,
      motivo_ajuste: `Sobra aproveitável gerada no corte da OP #${dados.numero_op_origem || "-"}`,
      usuario_nome: usuarios[0]?.nome || "Operador",
      created_at: new Date().toISOString(),
    };

    setRetalhos([novoRetalho, ...retalhos]);
    setMovimentacoes([novaMov, ...movimentacoes]);
  };

  // 5. Ajuste de Estoque Manual com Auditoria
  const ajustarEstoque = (dados: {
    deposito_id: string;
    item_catalogo_id?: string;
    lote_id?: string;
    produto_variacao_id?: string;
    quantidade_ajuste: number;
    motivo: string;
  }) => {
    setSaldos((prevSaldos) => {
      const idx = prevSaldos.findIndex(
        (s) =>
          s.deposito_id === dados.deposito_id &&
          (dados.lote_id ? s.lote_id === dados.lote_id : true) &&
          (dados.produto_variacao_id ? s.produto_variacao_id === dados.produto_variacao_id : true)
      );

      if (idx >= 0) {
        const saldoAtual = prevSaldos[idx];
        const saldoNovo = saldoAtual.quantidade_atual + dados.quantidade_ajuste;

        const novaMov: MovimentacaoEstoque = {
          id: "mov_" + Math.random().toString(36).substr(2, 9),
          empresa_id: empresa.id,
          deposito_id: dados.deposito_id,
          deposito_nome: saldoAtual.deposito_nome,
          item_catalogo_id: saldoAtual.item_catalogo_id,
          item_descricao: saldoAtual.item_descricao,
          lote_id: saldoAtual.lote_id,
          codigo_lote: saldoAtual.codigo_lote,
          produto_variacao_id: saldoAtual.produto_variacao_id,
          tipo_movimento: "ajuste_inventario",
          quantidade: dados.quantidade_ajuste,
          saldo_anterior: saldoAtual.quantidade_atual,
          saldo_posterior: saldoNovo,
          unidade_medida: saldoAtual.unidade_medida,
          motivo_ajuste: dados.motivo,
          usuario_nome: usuarios[0]?.nome || "Operador",
          created_at: new Date().toISOString(),
        };
        setMovimentacoes((m) => [novaMov, ...m]);

        const updated = [...prevSaldos];
        updated[idx] = { ...saldoAtual, quantidade_atual: saldoNovo, updated_at: new Date().toISOString() };
        return updated;
      }
      return prevSaldos;
    });
  };

  // 6. Cadastros
  const addItemCatalogo = (item: Omit<ItemCatalogo, "id" | "empresa_id" | "created_at">) => {
    const novo: ItemCatalogo = {
      ...item,
      id: "item_" + Math.random().toString(36).substr(2, 9),
      empresa_id: empresa.id,
      created_at: new Date().toISOString(),
    };
    setItensCatalogo([novo, ...itensCatalogo]);
  };

  const addFornecedor = (fornecedor: Omit<Fornecedor, "id" | "tenant_id" | "created_at">) => {
    const novo: Fornecedor = {
      ...fornecedor,
      id: "forn_" + Math.random().toString(36).substr(2, 9),
      tenant_id: empresa.id,
      created_at: new Date().toISOString(),
    };
    setFornecedores([novo, ...fornecedores]);
  };

  const addDeposito = (deposito: Omit<Deposito, "id" | "tenant_id" | "created_at">) => {
    const novo: Deposito = {
      ...deposito,
      id: "dep_" + Math.random().toString(36).substr(2, 9),
      tenant_id: empresa.id,
      created_at: new Date().toISOString(),
    };
    setDepositos([novo, ...depositos]);
  };

  // 7. Produtos e Ficha Técnica
  const addProduto = (produto: Omit<Produto, "id" | "tenant_id" | "created_at">) => {
    const novo: Produto = {
      ...produto,
      id: "prod_" + Math.random().toString(36).substr(2, 9),
      tenant_id: empresa.id,
      created_at: new Date().toISOString(),
    };
    setProdutos([novo, ...produtos]);
  };

  const saveFichaTecnica = (ficha: Omit<FichaTecnica, "id" | "created_at">) => {
    const nova: FichaTecnica = {
      ...ficha,
      id: "ft_" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setFichasTecnicas([nova, ...fichasTecnicas.filter((f) => f.produto_id !== ficha.produto_id)]);
  };

  // 8. PCP / Ordens de Produção (PRD v2: Origem híbrida, Modo de corte, Etapas mistas, Consumo de retalhos)
  const addOrdemProducao = (dados: {
    produto_id: string;
    ficha_tecnica_id: string;
    deposito_producao_id: string;
    origem: "estoque" | "pedido_venda";
    numero_pedido_venda?: string;
    cliente_nome?: string;
    modo_corte: "enfesto" | "peca_a_peca";
    etapas_execucao?: {
      corte: { tipo: "interna" | "faccao"; terceirizado_id?: string; terceirizado_nome?: string };
      costura: { tipo: "interna" | "faccao"; terceirizado_id?: string; terceirizado_nome?: string };
      acabamento: { tipo: "interna" | "faccao"; terceirizado_id?: string; terceirizado_nome?: string };
    };
    quantidade_planejada: number;
    data_inicio_prevista?: string;
    data_fim_prevista?: string;
    observacoes?: string;
    grade: { produto_variacao_id: string; quantidade: number }[];
    lotes_consumo?: { lote_id: string; quantidade: number }[];
    retalhos_consumo?: { retalho_id: string; quantidade_kg: number }[];
  }) => {
    const produto = produtos.find((p) => p.id === dados.produto_id);
    const novoNumero = ordensProducao.length > 0 ? Math.max(...ordensProducao.map((o) => o.numero_op || 1000)) + 1 : 1001;
    const opId = "op_" + Math.random().toString(36).substr(2, 9);

    const gradeItens = dados.grade.map((g) => {
      const variacao = produto?.variacoes?.find((v) => v.id === g.produto_variacao_id);
      return {
        id: "opg_" + Math.random().toString(36).substr(2, 9),
        ordem_producao_id: opId,
        produto_variacao_id: g.produto_variacao_id,
        sku: variacao?.sku,
        cor_nome: variacao?.cor_nome,
        tamanho: variacao?.tamanho,
        quantidade_planejada: g.quantidade,
        quantidade_cortada: 0,
        quantidade_finalizada: 0,
      };
    });

    const consumos = dados.lotes_consumo?.map((lc) => {
      const lote = lotes.find((l) => l.id === lc.lote_id);
      return {
        id: "opc_" + Math.random().toString(36).substr(2, 9),
        ordem_producao_id: opId,
        lote_id: lc.lote_id,
        codigo_lote: lote?.codigo_lote,
        item_descricao: lote?.item_descricao,
        quantidade_consumida: lc.quantidade,
        unidade_medida: lote?.unidade_medida || "kg",
        data_consumo: new Date().toISOString(),
      };
    });

    const consumosRetalhos = dados.retalhos_consumo?.map((rc) => {
      const ret = retalhos.find((r) => r.id === rc.retalho_id);
      return {
        id: "opcr_" + Math.random().toString(36).substr(2, 9),
        ordem_producao_id: opId,
        retalho_id: rc.retalho_id,
        codigo_retalho: ret?.codigo_retalho || "",
        cor_nome: ret?.cor_nome || "",
        quantidade_consumida_kg: rc.quantidade_kg,
        data_consumo: new Date().toISOString(),
      };
    });

    // Se consumiu retalhos, atualizar status dos retalhos
    if (dados.retalhos_consumo && dados.retalhos_consumo.length > 0) {
      setRetalhos((prevRet) =>
        prevRet.map((r) => {
          const itemConsumido = dados.retalhos_consumo?.find((rc) => rc.retalho_id === r.id);
          if (itemConsumido) {
            const pesoRestante = (r.peso_residual_kg || r.metragem || 0) - itemConsumido.quantidade_kg;
            return {
              ...r,
              peso_residual_kg: Math.max(0, pesoRestante),
              status: pesoRestante <= 0 ? "consumido" : "disponivel",
              updated_at: new Date().toISOString(),
            };
          }
          return r;
        })
      );
    }

    const novaOP: OrdemProducao = {
      id: opId,
      empresa_id: empresa.id,
      numero_op: novoNumero,
      produto_id: dados.produto_id,
      produto_referencia: produto?.referencia,
      produto_nome: produto?.nome,
      ficha_tecnica_id: dados.ficha_tecnica_id,
      deposito_producao_id: dados.deposito_producao_id,
      origem: dados.origem,
      numero_pedido_venda: dados.numero_pedido_venda,
      cliente_nome: dados.cliente_nome,
      modo_corte: dados.modo_corte,
      etapas_execucao: dados.etapas_execucao || {
        corte: { tipo: "interna" },
        costura: { tipo: "interna" },
        acabamento: { tipo: "interna" },
      },
      status: "planejada",
      quantidade_planejada: dados.quantidade_planejada,
      quantidade_cortada: 0,
      quantidade_produzida: 0,
      quantidade_segunda_qualidade: 0,
      data_inicio_prevista: dados.data_inicio_prevista,
      data_fim_prevista: dados.data_fim_prevista,
      observacoes: dados.observacoes,
      grade: gradeItens,
      consumos: consumos || [],
      consumos_retalhos: consumosRetalhos || [],
      apontamentos: [],
      created_at: new Date().toISOString(),
    };

    setOrdensProducao([novaOP, ...ordensProducao]);
  };

  const updateStatusOP = (opId: string, novoStatus: OrdemProducao["status"]) => {
    setOrdensProducao(
      ordensProducao.map((op) => (op.id === opId ? { ...op, status: novoStatus } : op))
    );
  };

  const registrarApontamentoOP = (
    opId: string,
    apontamento: Omit<OPApontamento, "id" | "ordem_producao_id" | "created_at">,
    finalizarEtapa: boolean = false
  ) => {
    setOrdensProducao((prevOPs) =>
      prevOPs.map((op) => {
        if (op.id === opId) {
          const novoAp: OPApontamento = {
            ...apontamento,
            id: "ap_" + Math.random().toString(36).substr(2, 9),
            ordem_producao_id: opId,
            created_at: new Date().toISOString(),
          };

          // Se gerou retalho no corte, registrar automaticamente no estoque de retalhos
          if (apontamento.etapa === "enfesto_corte" && (apontamento.retalho_gerado_kg || 0) > 0) {
            const loteConsumido = op.consumos?.[0]?.lote_id || lotes[0]?.id;
            if (loteConsumido) {
              gerarRetalhoCorte({
                lote_origem_id: loteConsumido,
                ordem_producao_origem_id: op.id,
                numero_op_origem: op.numero_op,
                cor_nome: op.grade?.[0]?.cor_nome || "Preto",
                peso_residual_kg: Number(apontamento.retalho_gerado_kg),
                metragem_residual_m: Number(apontamento.retalho_gerado_kg) * 3.35,
                largura_aproveitavel_m: 1.8,
                observacoes: `Sobra de corte gerada na OP #${op.numero_op}`,
              });
            }
          }

          let novoStatus = op.status;
          let qtdCortada = op.quantidade_cortada || 0;
          let qtdProduzida = op.quantidade_produzida || 0;
          const qtdPlan = op.quantidade_planejada || 0;

          if (apontamento.etapa === "enfesto_corte") {
            novoStatus = "em_corte";
            qtdCortada = Math.min(qtdPlan, (op.quantidade_cortada || 0) + (apontamento.quantidade_processada || 0));
            if (finalizarEtapa || qtdCortada >= qtdPlan) {
              novoStatus = "em_costura";
            }
          } else if (apontamento.etapa === "costura_interna" || apontamento.etapa === "faccao_externa") {
            novoStatus = "em_costura";
            if (finalizarEtapa) novoStatus = "em_acabamento";
          } else if (apontamento.etapa === "embalagem" || apontamento.etapa === "revisao_qualidade") {
            qtdProduzida = Math.min(qtdPlan, (op.quantidade_produzida || 0) + (apontamento.quantidade_processada || 0));
            if (qtdProduzida >= qtdPlan || finalizarEtapa) {
              novoStatus = "finalizada";
            }
          }

          return {
            ...op,
            status: novoStatus,
            quantidade_cortada: qtdCortada,
            quantidade_produzida: qtdProduzida,
            quantidade_segunda_qualidade: (op.quantidade_segunda_qualidade || 0) + (apontamento.quantidade_defeito || 0),
            apontamentos: [novoAp, ...(op.apontamentos || [])],
          };
        }
        return op;
      })
    );
  };

  return (
    <TextilStoreContext.Provider
      value={{
        empresa,
        usuarios,
        depositos,
        fornecedores,
        itensCatalogo,
        pedidosCompra,
        lotes,
        retalhos,
        saldos,
        movimentacoes,
        produtos,
        fichasTecnicas,
        ordensProducao,
        addPedidoCompra,
        updateStatusPedidoCompra,
        receberLoteMercadoria,
        gerarRetalhoCorte,
        ajustarEstoque,
        addItemCatalogo,
        addFornecedor,
        addDeposito,
        addProduto,
        saveFichaTecnica,
        addOrdemProducao,
        updateStatusOP,
        registrarApontamentoOP,
      }}
    >
      {children}
    </TextilStoreContext.Provider>
  );
}

export function useTextilStore() {
  const context = useContext(TextilStoreContext);
  if (!context) {
    throw new Error("useTextilStore deve ser utilizado dentro de TextilStoreProvider");
  }
  return context;
}
