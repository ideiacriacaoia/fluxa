"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Empresa,
  Usuario,
  Papel,
  PapelPermissao,
  UsuarioPermissao,
  AuditoriaPermissao,
  ModuloSistema,
  NivelPermissao,
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
  CotacaoCompra,
  CotacaoPropostaFornecedor,
  CotacaoAprovacaoLog,
  NotaFiscalEletronica,
  MensagemWhatsAppFornecedor,
  OrdemServicoPersonalizacao,
  StatusOSPersonalizacao,
  ComponentePersonalizacaoItem,
  EtapaHistoricoOS,
} from "@/types/database.types";
import {
  initialEmpresa,
  initialUsuarios,
  initialPapeis,
  initialPapelPermissoes,
  initialUsuarioPermissoes,
  initialAuditoriaPermissoes,
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
  initialCotacoes,
  initialNotasFiscais,
  initialMensagensWhatsApp,
  initialOrdensPersonalizacao,
} from "./initial-data";

export type TemaTipo = 'padrao' | 'dark-night' | 'tokyo' | 'ideia';

interface TextilStoreContextType {
  empresa: Empresa;
  usuarios: Usuario[];
  papeis: Papel[];
  papelPermissoes: PapelPermissao[];
  usuarioPermissoes: UsuarioPermissao[];
  auditoriaPermissoes: AuditoriaPermissao[];
  usuarioLogado: Usuario;
  temaAtual: TemaTipo;
  sidebarRecolhida: boolean;
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
  cotacoes: CotacaoCompra[];
  notasFiscais: NotaFiscalEletronica[];
  mensagensWhatsApp: MensagemWhatsAppFornecedor[];
  ordensPersonalizacao: OrdemServicoPersonalizacao[];

  // Ações de Tema & Layout
  setTemaAtual: (tema: TemaTipo) => void;
  toggleSidebarRecolhida: () => void;

  // Ações de Usuários & Permissões
  setUsuarioLogado: (usuario: Usuario) => void;
  addUsuario: (usuario: { nome: string; email: string; papel_id: string; cargo?: string }) => void;
  updateUsuario: (id: string, dados: { nome?: string; email?: string; papel_id?: string; cargo?: string }) => void;
  toggleStatusUsuario: (id: string) => void;
  setUsuarioPermissao: (usuario_id: string, modulo: ModuloSistema, nivel_acesso: NivelPermissao) => void;
  resetUsuarioPermissoes: (usuario_id: string) => void;
  getUsuarioPermissoesEfetivas: (usuario_id: string) => Record<ModuloSistema, NivelPermissao>;

  // Ações de Compras & Lotes
  addPedidoCompra: (pedido: Omit<PedidoCompra, "id" | "tenant_id" | "numero_pedido" | "created_at">) => void;
  updateStatusPedidoCompra: (id: string, status: PedidoCompra["status"]) => void;

  // Ações de Cotações Multi-Fornecedor & WhatsApp
  addCotacao: (cotacao: {
    titulo: string;
    item_catalogo_id: string;
    quantidade_solicitada: number;
    cor_especificacao?: string;
    data_limite_resposta: string;
    margem_comercial_sugerida?: number;
    fornecedores_ids?: string[];
  }) => void;
  addPropostaCotacao: (cotacaoId: string, proposta: {
    fornecedor_id: string;
    preco_unitario: number;
    prazo_entrega_dias: number;
    tipo_frete: "CIF" | "FOB";
    valor_frete: number;
    condicao_pagamento: string;
    observacoes?: string;
  }) => void;
  selecionarPropostaCotacao: (cotacaoId: string, propostaId: string) => void;
  aprovarCotacao: (cotacaoId: string, parecer: string) => void;
  converterCotacaoEmPedido: (cotacaoId: string) => void;
  enviarCotacaoWhatsApp: (cotacaoId: string, fornecedorId: string, mensagem: string) => void;

  // Ações Fiscais (Sefaz / Receita Federal)
  emitirNotaFiscal: (dados: {
    tipo: NotaFiscalEletronica["tipo"];
    natureza_operacao: string;
    emitente_razao: string;
    emitente_cnpj: string;
    destinatario_razao: string;
    destinatario_doc: string;
    destinatario_cidade: string;
    destinatario_uf: string;
    itens: {
      codigo_produto: string;
      descricao: string;
      ncm: string;
      cfop: string;
      unidade: string;
      quantidade: number;
      valor_unitario: number;
      aliquota_icms: number;
    }[];
    pedido_origem_id?: string;
  }) => void;
  cancelarNotaFiscal: (notaId: string, motivo: string) => void;

  // Ações de Personalização de Peça Pronta (OS)
  addOrdemPersonalizacao: (os: {
    cliente_nome: string;
    cliente_documento: string;
    cliente_contato?: string;
    cliente_whatsapp?: string;
    peca_base_produto_id: string;
    peca_base_cor: string;
    peca_base_tamanho_grade: Record<string, number>;
    componentes: {
      tipo: OrdemServicoPersonalizacao["componentes"][0]["tipo"];
      descricao: string;
      quantidade_por_peca: number;
      unidade: string;
      custo_unitario: number;
      pontos_bordado?: number;
      tempo_maquina_min?: number;
      observacoes?: string;
    }[];
    margem_lucro_percentual: number;
    data_previsao_entrega: string;
    prioridade: "normal" | "alta" | "urgente";
    observacoes?: string;
  }) => void;
  updateStatusOSPersonalizacao: (osId: string, novoStatus: StatusOSPersonalizacao, observacao?: string) => void;
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
  const [papeis, setPapeis] = useState<Papel[]>(initialPapeis);
  const [papelPermissoes, setPapelPermissoes] = useState<PapelPermissao[]>(initialPapelPermissoes);
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [usuarioPermissoes, setUsuarioPermissoes] = useState<UsuarioPermissao[]>(initialUsuarioPermissoes);
  const [auditoriaPermissoes, setAuditoriaPermissoes] = useState<AuditoriaPermissao[]>(initialAuditoriaPermissoes);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario>(initialUsuarios[0]);

  // Estados de Tema e Layout Retrátil
  const [temaAtual, setTemaAtualState] = useState<TemaTipo>("padrao");
  const [sidebarRecolhida, setSidebarRecolhida] = useState<boolean>(false);

  // Sincronização inicial com localStorage / DOM
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("fluxa_theme") as TemaTipo;
      if (savedTheme && ["padrao", "dark-night", "tokyo", "ideia"].includes(savedTheme)) {
        setTemaAtualState(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        document.documentElement.setAttribute("data-theme", "padrao");
      }

      const savedSidebar = localStorage.getItem("fluxa_sidebar_collapsed");
      if (savedSidebar !== null) {
        setSidebarRecolhida(savedSidebar === "true");
      }
    } catch {
      // ambiente SSR ou sem suporte a localStorage
    }
  }, []);

  const setTemaAtual = (novoTema: TemaTipo) => {
    setTemaAtualState(novoTema);
    try {
      document.documentElement.setAttribute("data-theme", novoTema);
      localStorage.setItem("fluxa_theme", novoTema);
    } catch {
      // fallback
    }
  };

  const toggleSidebarRecolhida = () => {
    setSidebarRecolhida((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("fluxa_sidebar_collapsed", String(next));
      } catch {
        // fallback
      }
      return next;
    });
  };

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
  const [cotacoes, setCotacoes] = useState<CotacaoCompra[]>(initialCotacoes);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalEletronica[]>(initialNotasFiscais);
  const [mensagensWhatsApp, setMensagensWhatsApp] = useState<MensagemWhatsAppFornecedor[]>(initialMensagensWhatsApp);
  const [ordensPersonalizacao, setOrdensPersonalizacao] = useState<OrdemServicoPersonalizacao[]>(initialOrdensPersonalizacao);

  // Cálculo de permissões efetivas para um usuário
  const getUsuarioPermissoesEfetivas = (usuarioId: string): Record<ModuloSistema, NivelPermissao> => {
    const user = usuarios.find((u) => u.id === usuarioId);
    const modulos: ModuloSistema[] = [
      "compras",
      "estoque",
      "fichas_tecnicas",
      "pcp_producao",
      "vendas",
      "financeiro",
      "cadastros_base",
      "usuarios_permissoes",
    ];

    const resultado = {} as Record<ModuloSistema, NivelPermissao>;

    modulos.forEach((mod) => {
      // 1. Verificar se existe exceção específica
      const excecao = usuarioPermissoes.find(
        (up) => up.usuario_id === usuarioId && up.modulo === mod
      );
      if (excecao) {
        resultado[mod] = excecao.nivel_acesso;
        return;
      }

      // 2. Se não, buscar no papel
      if (user?.papel_id) {
        const permPapel = papelPermissoes.find(
          (pp) => pp.papel_id === user.papel_id && pp.modulo === mod
        );
        if (permPapel) {
          resultado[mod] = permPapel.nivel_acesso;
          return;
        }
      }

      // 3. Fallback
      resultado[mod] = user?.nivel_acesso === "admin" ? "administrar" : "nenhum";
    });

    return resultado;
  };

  // Criar Usuário
  const addUsuario = (dados: { nome: string; email: string; papel_id: string; cargo?: string }) => {
    const papel = papeis.find((p) => p.id === dados.papel_id);
    const novoUsuario: Usuario = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      tenant_id: empresa.id,
      empresa_id: empresa.id,
      nome: dados.nome,
      email: dados.email,
      papel_id: dados.papel_id,
      papel_nome: papel?.nome || "Personalizado",
      cargo: dados.cargo || "Colaborador",
      ativo: true,
      ultimo_acesso: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setUsuarios([novoUsuario, ...usuarios]);

    const novoLog: AuditoriaPermissao = {
      id: "aud_" + Math.random().toString(36).substr(2, 9),
      tenant_id: empresa.id,
      usuario_alterado_id: novoUsuario.id,
      usuario_alterado_nome: novoUsuario.nome,
      alterado_por_id: usuarioLogado.id,
      alterado_por_nome: usuarioLogado.nome,
      tipo_alteracao: "criacao_usuario",
      detalhes: {
        papel: papel?.nome,
        cargo: dados.cargo,
        email: dados.email,
      },
      registrado_em: new Date().toISOString(),
    };
    setAuditoriaPermissoes([novoLog, ...auditoriaPermissoes]);
  };

  // Editar Usuário
  const updateUsuario = (id: string, dados: { nome?: string; email?: string; papel_id?: string; cargo?: string }) => {
    const papel = dados.papel_id ? papeis.find((p) => p.id === dados.papel_id) : undefined;
    const userAntigo = usuarios.find((u) => u.id === id);

    setUsuarios(
      usuarios.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            ...dados,
            papel_nome: papel ? papel.nome : u.papel_nome,
            updated_at: new Date().toISOString(),
          };
        }
        return u;
      })
    );

    if (dados.papel_id && userAntigo && userAntigo.papel_id !== dados.papel_id) {
      const novoLog: AuditoriaPermissao = {
        id: "aud_" + Math.random().toString(36).substr(2, 9),
        tenant_id: empresa.id,
        usuario_alterado_id: id,
        usuario_alterado_nome: dados.nome || userAntigo.nome,
        alterado_por_id: usuarioLogado.id,
        alterado_por_nome: usuarioLogado.nome,
        tipo_alteracao: "mudanca_papel",
        detalhes: {
          papel_anterior: userAntigo.papel_nome,
          papel_novo: papel?.nome,
        },
        registrado_em: new Date().toISOString(),
      };
      setAuditoriaPermissoes([novoLog, ...auditoriaPermissoes]);
    }
  };

  // Ativar / Desativar Usuário
  const toggleStatusUsuario = (id: string) => {
    const user = usuarios.find((u) => u.id === id);
    if (!user) return;
    const novoStatus = !user.ativo;

    setUsuarios(
      usuarios.map((u) => (u.id === id ? { ...u, ativo: novoStatus, updated_at: new Date().toISOString() } : u))
    );

    const novoLog: AuditoriaPermissao = {
      id: "aud_" + Math.random().toString(36).substr(2, 9),
      tenant_id: empresa.id,
      usuario_alterado_id: id,
      usuario_alterado_nome: user.nome,
      alterado_por_id: usuarioLogado.id,
      alterado_por_nome: usuarioLogado.nome,
      tipo_alteracao: novoStatus ? "reativacao_usuario" : "desativacao_usuario",
      detalhes: {
        motivo: novoStatus ? "Reativação de acesso pelo administrador" : "Desativação de acesso pelo administrador",
      },
      registrado_em: new Date().toISOString(),
    };
    setAuditoriaPermissoes([novoLog, ...auditoriaPermissoes]);
  };

  // Definir Exceção de Permissão para Usuário
  const setUsuarioPermissao = (usuario_id: string, modulo: ModuloSistema, nivel_acesso: NivelPermissao) => {
    const user = usuarios.find((u) => u.id === usuario_id);
    const existingIndex = usuarioPermissoes.findIndex(
      (up) => up.usuario_id === usuario_id && up.modulo === modulo
    );

    const updatedPermissoes = [...usuarioPermissoes];
    if (existingIndex >= 0) {
      updatedPermissoes[existingIndex] = {
        ...updatedPermissoes[existingIndex],
        nivel_acesso,
      };
    } else {
      updatedPermissoes.push({
        id: "up_" + Math.random().toString(36).substr(2, 9),
        tenant_id: empresa.id,
        usuario_id,
        modulo,
        nivel_acesso,
      });
    }
    setUsuarioPermissoes(updatedPermissoes);

    const novoLog: AuditoriaPermissao = {
      id: "aud_" + Math.random().toString(36).substr(2, 9),
      tenant_id: empresa.id,
      usuario_alterado_id: usuario_id,
      usuario_alterado_nome: user?.nome,
      alterado_por_id: usuarioLogado.id,
      alterado_por_nome: usuarioLogado.nome,
      tipo_alteracao: "excecao_permissao",
      detalhes: {
        modulo,
        nivel_acesso,
        tipo: "Ajuste de permissão granular individual",
      },
      registrado_em: new Date().toISOString(),
    };
    setAuditoriaPermissoes([novoLog, ...auditoriaPermissoes]);
  };

  // Restaurar Permissões Padrão do Papel
  const resetUsuarioPermissoes = (usuario_id: string) => {
    const user = usuarios.find((u) => u.id === usuario_id);
    setUsuarioPermissoes(usuarioPermissoes.filter((up) => up.usuario_id !== usuario_id));

    const novoLog: AuditoriaPermissao = {
      id: "aud_" + Math.random().toString(36).substr(2, 9),
      tenant_id: empresa.id,
      usuario_alterado_id: usuario_id,
      usuario_alterado_nome: user?.nome,
      alterado_por_id: usuarioLogado.id,
      alterado_por_nome: usuarioLogado.nome,
      tipo_alteracao: "restauracao_padrao_papel",
      detalhes: {
        papel: user?.papel_nome,
        mensagem: "Todas as exceções foram removidas e o usuário herdou as permissões do papel base.",
      },
      registrado_em: new Date().toISOString(),
    };
    setAuditoriaPermissoes([novoLog, ...auditoriaPermissoes]);
  };

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

  // ============================================================================
  // COTAÇÕES & COMPRAS MULTI-FORNECEDOR
  // ============================================================================
  const addCotacao = (dados: {
    titulo: string;
    item_catalogo_id: string;
    quantidade_solicitada: number;
    cor_especificacao?: string;
    data_limite_resposta: string;
    margem_comercial_sugerida?: number;
    fornecedores_ids?: string[];
  }) => {
    const itemCat = itensCatalogo.find((i) => i.id === dados.item_catalogo_id);
    const novoCodigo = `COT-2026-${String(cotacoes.length + 1).padStart(3, "0")}`;
    
    // Gera propostas iniciais se fornecedores foram selecionados
    const fornecedoresAlvo = dados.fornecedores_ids && dados.fornecedores_ids.length > 0
      ? fornecedores.filter((f) => dados.fornecedores_ids?.includes(f.id))
      : fornecedores.slice(0, 3);

    const propostasIniciais: CotacaoPropostaFornecedor[] = fornecedoresAlvo.map((forn, idx) => ({
      id: `prop_${Date.now()}_${idx}`,
      cotacao_id: "",
      fornecedor_id: forn.id,
      fornecedor_nome: forn.nome_fantasia || forn.razao_social || forn.nome || "Fornecedor",
      fornecedor_documento: forn.cnpj_cpf || forn.documento,
      contato_nome: forn.contato_nome,
      contato_whatsapp: forn.contato_telefone || forn.telefone,
      preco_unitario: Number(itemCat?.custo_medio_unitario || 30) * (1 + (idx * 0.05)),
      valor_total: (Number(itemCat?.custo_medio_unitario || 30) * (1 + (idx * 0.05))) * dados.quantidade_solicitada,
      prazo_entrega_dias: forn.prazo_medio_entrega_dias || (7 + idx * 2),
      tipo_frete: idx === 0 ? "CIF" : "FOB",
      valor_frete: idx === 0 ? 0 : 350,
      condicao_pagamento: "28/42 DDL",
      avaliacao_desempenho_fornecedor: forn.avaliacao_nota || 4.5,
      pontualidade_score: 90 + (idx === 0 ? 5 : -5),
      qualidade_score: 95,
      selecionada: idx === 0,
      status_whatsapp: "nao_enviado",
    }));

    const precoVencedor = propostasIniciais[0]?.preco_unitario || itemCat?.custo_medio_unitario || 35;
    const margem = dados.margem_comercial_sugerida || 45;
    const precoVendaCalculado = Number((precoVencedor / (1 - margem / 100)).toFixed(2));

    const novaCotacao: CotacaoCompra = {
      id: `cot_${Date.now()}`,
      codigo: novoCodigo,
      titulo: dados.titulo,
      item_catalogo_id: dados.item_catalogo_id,
      item_codigo: itemCat?.codigo || "ITEM",
      item_descricao: itemCat?.descricao || "Item",
      unidade_medida: itemCat?.unidade_medida || "un",
      quantidade_solicitada: Number(dados.quantidade_solicitada),
      cor_especificacao: dados.cor_especificacao,
      data_abertura: new Date().toISOString().split("T")[0],
      data_limite_resposta: dados.data_limite_resposta,
      solicitante_id: usuarioLogado.id,
      solicitante_nome: `${usuarioLogado.nome} (${usuarioLogado.cargo || "Comprador"})`,
      status: "em_analise",
      propostas: propostasIniciais,
      aprovacoes_logs: [],
      proposta_comercial_vinculada: false,
      margem_comercial_sugerida: margem,
      preco_venda_calculado: precoVendaCalculado,
      economia_estimada: 1200.0,
      created_at: new Date().toISOString(),
    };

    setCotacoes([novaCotacao, ...cotacoes]);
  };

  const addPropostaCotacao = (cotacaoId: string, proposta: {
    fornecedor_id: string;
    preco_unitario: number;
    prazo_entrega_dias: number;
    tipo_frete: "CIF" | "FOB";
    valor_frete: number;
    condicao_pagamento: string;
    observacoes?: string;
  }) => {
    const forn = fornecedores.find((f) => f.id === proposta.fornecedor_id);
    setCotacoes((prev) =>
      prev.map((c) => {
        if (c.id !== cotacaoId) return c;
        const novaProp: CotacaoPropostaFornecedor = {
          id: `prop_${Date.now()}`,
          cotacao_id: cotacaoId,
          fornecedor_id: proposta.fornecedor_id,
          fornecedor_nome: forn?.nome_fantasia || forn?.razao_social || "Fornecedor",
          fornecedor_documento: forn?.cnpj_cpf || forn?.documento,
          contato_nome: forn?.contato_nome,
          contato_whatsapp: forn?.contato_telefone || forn?.telefone,
          preco_unitario: Number(proposta.preco_unitario),
          valor_total: Number(proposta.preco_unitario) * c.quantidade_solicitada,
          prazo_entrega_dias: Number(proposta.prazo_entrega_dias),
          tipo_frete: proposta.tipo_frete,
          valor_frete: Number(proposta.valor_frete),
          condicao_pagamento: proposta.condicao_pagamento,
          avaliacao_desempenho_fornecedor: forn?.avaliacao_nota || 4.5,
          pontualidade_score: 92,
          qualidade_score: 95,
          observacoes: proposta.observacoes,
          selecionada: c.propostas.length === 0,
          status_whatsapp: "respondido",
          data_resposta: new Date().toISOString(),
        };
        return {
          ...c,
          propostas: [...c.propostas, novaProp],
        };
      })
    );
  };

  const selecionarPropostaCotacao = (cotacaoId: string, propostaId: string) => {
    setCotacoes((prev) =>
      prev.map((c) => {
        if (c.id !== cotacaoId) return c;
        const novasPropostas = c.propostas.map((p) => ({
          ...p,
          selecionada: p.id === propostaId,
        }));
        const propSel = novasPropostas.find((p) => p.id === propostaId);
        const precoVencedor = propSel?.preco_unitario || 30;
        const margem = c.margem_comercial_sugerida || 45;
        const precoVendaCalculado = Number((precoVencedor / (1 - margem / 100)).toFixed(2));
        
        return {
          ...c,
          propostas: novasPropostas,
          preco_venda_calculado: precoVendaCalculado,
        };
      })
    );
  };

  const aprovarCotacao = (cotacaoId: string, parecer: string) => {
    setCotacoes((prev) =>
      prev.map((c) => {
        if (c.id !== cotacaoId) return c;
        const propSel = c.propostas.find((p) => p.selecionada) || c.propostas[0];
        const valorTotal = propSel?.valor_total || 0;

        let alcada: "comprador" | "gerente" | "diretor" = "comprador";
        if (valorTotal > 50000) alcada = "diretor";
        else if (valorTotal > 10000) alcada = "gerente";

        const novoLog: CotacaoAprovacaoLog = {
          id: `log_${Date.now()}`,
          cotacao_id: cotacaoId,
          usuario_id: usuarioLogado.id,
          usuario_nome: usuarioLogado.nome,
          cargo: usuarioLogado.cargo || "Responsável Técnico",
          alcada,
          valor_aprovado: valorTotal,
          data_aprovacao: new Date().toISOString(),
          parecer: parecer || `Aprovada proposta do fornecedor ${propSel?.fornecedor_nome}`,
          status: "aprovado",
        };

        return {
          ...c,
          status: "aprovada",
          aprovacoes_logs: [novoLog, ...c.aprovacoes_logs],
          proposta_comercial_vinculada: true,
        };
      })
    );
  };

  const converterCotacaoEmPedido = (cotacaoId: string) => {
    const cot = cotacoes.find((c) => c.id === cotacaoId);
    if (!cot) return;
    const propSel = cot.propostas.find((p) => p.selecionada) || cot.propostas[0];
    if (!propSel) return;

    const itemCat = itensCatalogo.find((i) => i.id === cot.item_catalogo_id);

    const novoPedidoId = `pc_${Date.now()}`;
    const novoPedido: PedidoCompra = {
      id: novoPedidoId,
      numero_pedido: 2040 + pedidosCompra.length + 1,
      fornecedor_id: propSel.fornecedor_id,
      fornecedor_nome: propSel.fornecedor_nome,
      status: "aprovado",
      data_emissao: new Date().toISOString().split("T")[0],
      data_prevista_entrega: new Date(Date.now() + (propSel.prazo_entrega_dias * 86400000)).toISOString().split("T")[0],
      condicao_pagamento: propSel.condicao_pagamento,
      valor_total: propSel.valor_total,
      observacoes: `Gerado automaticamente da Cotação ${cot.codigo}. ${propSel.observacoes || ""}`,
      created_at: new Date().toISOString(),
      itens: [
        {
          id: `it_${Date.now()}`,
          pedido_compra_id: novoPedidoId,
          item_catalogo_id: cot.item_catalogo_id,
          item_codigo: cot.item_codigo,
          item_descricao: cot.item_descricao,
          unidade_medida: cot.unidade_medida,
          cor_referencia: cot.cor_especificacao || "Padrão",
          quantidade_pedida: cot.quantidade_solicitada,
          quantidade_entregue: 0,
          preco_unitario: propSel.preco_unitario,
          valor_total: propSel.valor_total,
        },
      ],
    };

    setPedidosCompra([novoPedido, ...pedidosCompra]);

    setCotacoes((prev) =>
      prev.map((c) =>
        c.id === cotacaoId
          ? {
              ...c,
              status: "convertida_pedido",
              pedido_compra_gerado_id: novoPedidoId,
            }
          : c
      )
    );
  };

  const enviarCotacaoWhatsApp = (cotacaoId: string, fornecedorId: string, mensagem: string) => {
    const forn = fornecedores.find((f) => f.id === fornecedorId);
    const cot = cotacoes.find((c) => c.id === cotacaoId);

    const novaMensagem: MensagemWhatsAppFornecedor = {
      id: `msg_${Date.now()}`,
      cotacao_id: cotacaoId,
      fornecedor_id: fornecedorId,
      fornecedor_nome: forn?.nome_fantasia || forn?.razao_social || "Fornecedor",
      telefone_destinatario: forn?.contato_telefone || forn?.telefone || "(47) 99999-0000",
      remetente: "comprador",
      conteudo: mensagem || `Solicitação da Cotação ${cot?.codigo}: ${cot?.titulo}. Favor enviar proposta formal.`,
      data_envio: new Date().toISOString(),
      status_envio: "enviado",
      anexo_nome: `${cot?.codigo || "Cotacao"}-Solicitacao.pdf`,
      anexo_tipo: "cotacao_pdf",
    };

    setMensagensWhatsApp([novaMensagem, ...mensagensWhatsApp]);

    setCotacoes((prev) =>
      prev.map((c) => {
        if (c.id !== cotacaoId) return c;
        return {
          ...c,
          propostas: c.propostas.map((p) =>
            p.fornecedor_id === fornecedorId
              ? { ...p, status_whatsapp: "enviado" }
              : p
          ),
        };
      })
    );
  };

  // ============================================================================
  // INTEGRAÇÃO FISCAL (SEFAZ / RECEITA FEDERAL)
  // ============================================================================
  const emitirNotaFiscal = (dados: {
    tipo: NotaFiscalEletronica["tipo"];
    natureza_operacao: string;
    emitente_razao: string;
    emitente_cnpj: string;
    destinatario_razao: string;
    destinatario_doc: string;
    destinatario_cidade: string;
    destinatario_uf: string;
    itens: {
      codigo_produto: string;
      descricao: string;
      ncm: string;
      cfop: string;
      unidade: string;
      quantidade: number;
      valor_unitario: number;
      aliquota_icms: number;
    }[];
    pedido_origem_id?: string;
  }) => {
    const novoNumero = 10520 + notasFiscais.length + 1;
    const chaveGerada = `422609${Math.random().toString().slice(2, 10)}${Math.random().toString().slice(2, 10)}${Math.random().toString().slice(2, 10)}550010000${novoNumero}10000${novoNumero}`.slice(0, 44);
    const protocoloGerado = `14226000${Math.random().toString().slice(2, 9)}`;

    const itensCalculados = dados.itens.map((it, idx) => ({
      id: `nfi_${Date.now()}_${idx}`,
      ...it,
      valor_total: Number(it.quantidade) * Number(it.valor_unitario),
    }));

    const valorProdutos = itensCalculados.reduce((acc, curr) => acc + curr.valor_total, 0);
    const valorIcms = itensCalculados.reduce((acc, curr) => acc + (curr.valor_total * (curr.aliquota_icms / 100)), 0);

    const novaNota: NotaFiscalEletronica = {
      id: `nfe_${Date.now()}`,
      numero_nota: novoNumero,
      serie: 1,
      modelo: "55",
      tipo: dados.tipo,
      chave_acesso_44: chaveGerada,
      data_emissao: new Date().toISOString(),
      status: "autorizada",
      protocolo_autorizacao: protocoloGerado,
      codigo_status_sefaz: 100,
      motivo_status_sefaz: "Autorizado o uso da NF-e (SEFAZ Homologada)",
      natureza_operacao: dados.natureza_operacao,
      emitente_razao: dados.emitente_razao,
      emitente_cnpj: dados.emitente_cnpj,
      emitente_uf: "SC",
      destinatario_razao: dados.destinatario_razao,
      destinatario_doc: dados.destinatario_doc,
      destinatario_cidade: dados.destinatario_cidade,
      destinatario_uf: dados.destinatario_uf,
      valor_produtos: valorProdutos,
      valor_frete: 0,
      valor_total_nota: valorProdutos,
      base_calculo_icms: valorProdutos,
      valor_icms: Number(valorIcms.toFixed(2)),
      pedido_origem_id: dados.pedido_origem_id,
      itens: itensCalculados,
      xml_conteudo: `<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe${chaveGerada}" versao="4.00"><ide><cUF>42</cUF><cNF>${String(novoNumero).padStart(9, '0')}</cNF><natOp>${dados.natureza_operacao}</natOp><mod>55</mod><serie>1</serie><nNF>${novoNumero}</nNF><dhEmi>${new Date().toISOString()}</dhEmi><tpNF>${dados.tipo.startsWith('entrada') ? '0' : '1'}</tpNF></ide><emit><CNPJ>${dados.emitente_cnpj.replace(/[^A-Za-z0-9]/g, '')}</CNPJ><xNome>${dados.emitente_razao}</xNome><UF>SC</UF></emit><dest><CNPJ>${dados.destinatario_doc.replace(/[^A-Za-z0-9]/g, '')}</CNPJ><xNome>${dados.destinatario_razao}</xNome><UF>${dados.destinatario_uf}</UF></dest><total><ICMSTot><vProd>${valorProdutos.toFixed(2)}</vProd><vNF>${valorProdutos.toFixed(2)}</vNF><vICMS>${valorIcms.toFixed(2)}</vICMS></ICMSTot></total></infNFe></NFe><protNFe versao="4.00"><infProt><tpAmb>1</tpAmb><verAplic>SC_NFE_V4_00</verAplic><chNFe>${chaveGerada}</chNFe><dhRecbto>${new Date().toISOString()}</dhRecbto><nProt>${protocoloGerado}</nProt><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></infProt></protNFe></nfeProc>`,
      created_at: new Date().toISOString(),
    };

    setNotasFiscais([novaNota, ...notasFiscais]);
  };

  const cancelarNotaFiscal = (notaId: string, motivo: string) => {
    setNotasFiscais((prev) =>
      prev.map((n) =>
        n.id === notaId
          ? {
              ...n,
              status: "cancelada",
              motivo_status_sefaz: `Cancelamento homologado pela SEFAZ: ${motivo}`,
            }
          : n
      )
    );
  };

  // ============================================================================
  // ORDEM DE SERVIÇO (OS) — PERSONALIZAÇÃO DE PEÇA PRONTA
  // ============================================================================
  const addOrdemPersonalizacao = (os: {
    cliente_nome: string;
    cliente_documento: string;
    cliente_contato?: string;
    cliente_whatsapp?: string;
    peca_base_produto_id: string;
    peca_base_cor: string;
    peca_base_tamanho_grade: Record<string, number>;
    componentes: {
      tipo: OrdemServicoPersonalizacao["componentes"][0]["tipo"];
      descricao: string;
      quantidade_por_peca: number;
      unidade: string;
      custo_unitario: number;
      pontos_bordado?: number;
      tempo_maquina_min?: number;
      observacoes?: string;
    }[];
    margem_lucro_percentual: number;
    data_previsao_entrega: string;
    prioridade: "normal" | "alta" | "urgente";
    observacoes?: string;
  }) => {
    const prod = produtos.find((p) => p.id === os.peca_base_produto_id);
    const qtdTotal = Object.values(os.peca_base_tamanho_grade).reduce((a, b) => a + Number(b), 0);
    const custoPecaBaseUnit = Number(prod?.preco_venda_sugerido ? prod.preco_venda_sugerido * 0.45 : 20.0);

    const componentesCalculados: ComponentePersonalizacaoItem[] = os.componentes.map((c, idx) => ({
      id: `comp_${Date.now()}_${idx}`,
      ...c,
      custo_total_por_peca: Number(c.quantidade_por_peca) * Number(c.custo_unitario),
    }));

    const custoPersonalizacaoUnit = componentesCalculados.reduce((a, b) => a + b.custo_total_por_peca, 0);
    const custoTotalUnit = custoPecaBaseUnit + custoPersonalizacaoUnit;
    const custoTotalOS = custoTotalUnit * qtdTotal;

    const margem = os.margem_lucro_percentual || 50;
    const precoVendaUnitarioSugerido = Number((custoTotalUnit / (1 - margem / 100)).toFixed(2));
    const valorTotalOS = Number((precoVendaUnitarioSugerido * qtdTotal).toFixed(2));

    const novaOS: OrdemServicoPersonalizacao = {
      id: `os_${Date.now()}`,
      numero_os: `OS-2026-${String(ordensPersonalizacao.length + 91).padStart(3, "0")}`,
      cliente_nome: os.cliente_nome,
      cliente_documento: os.cliente_documento,
      cliente_contato: os.cliente_contato,
      cliente_whatsapp: os.cliente_whatsapp,
      peca_base_produto_id: os.peca_base_produto_id,
      peca_base_nome: prod?.nome || "Peça Pronta Acabada",
      peca_base_referencia: prod?.referencia || "SKU-BASE",
      peca_base_cor: os.peca_base_cor,
      peca_base_tamanho_grade: os.peca_base_tamanho_grade,
      quantidade_total_pecas: qtdTotal,
      custo_peca_base_unitario: custoPecaBaseUnit,
      componentes: componentesCalculados,
      custo_personalizacao_unitario: Number(custoPersonalizacaoUnit.toFixed(2)),
      custo_total_unitario: Number(custoTotalUnit.toFixed(2)),
      custo_total_os: Number(custoTotalOS.toFixed(2)),
      margem_lucro_percentual: margem,
      preco_venda_unitario_sugerido: precoVendaUnitarioSugerido,
      valor_total_os: valorTotalOS,
      data_abertura: new Date().toISOString().split("T")[0],
      data_previsao_entrega: os.data_previsao_entrega,
      status: "aguardando_insumos",
      prioridade: os.prioridade,
      observacoes: os.observacoes,
      created_at: new Date().toISOString(),
      historico_etapas: [
        {
          id: `etp_${Date.now()}`,
          etapa_nome: "Abertura & Separação de Peças Base",
          data_inicio: new Date().toISOString(),
          responsavel_nome: usuarioLogado.nome,
          observacao: `Abertura da OS para ${qtdTotal} unidades de ${prod?.nome}.`,
          concluida: true,
        },
      ],
    };

    setOrdensPersonalizacao([novaOS, ...ordensPersonalizacao]);
  };

  const updateStatusOSPersonalizacao = (osId: string, novoStatus: StatusOSPersonalizacao, observacao?: string) => {
    setOrdensPersonalizacao((prev) =>
      prev.map((os) => {
        if (os.id !== osId) return os;
        const novaEtapa: EtapaHistoricoOS = {
          id: `etp_${Date.now()}`,
          etapa_nome: `Mudança de Status: ${novoStatus.toUpperCase()}`,
          data_inicio: new Date().toISOString(),
          responsavel_nome: usuarioLogado.nome,
          observacao: observacao || `Status alterado para ${novoStatus}`,
          concluida: true,
        };
        return {
          ...os,
          status: novoStatus,
          data_entrega_efetiva: novoStatus === "entregue" ? new Date().toISOString().split("T")[0] : os.data_entrega_efetiva,
          historico_etapas: [novaEtapa, ...os.historico_etapas],
        };
      })
    );
  };

  return (
    <TextilStoreContext.Provider
      value={{
        empresa,
        usuarios,
        papeis,
        papelPermissoes,
        usuarioPermissoes,
        auditoriaPermissoes,
        usuarioLogado,
        temaAtual,
        sidebarRecolhida,
        setTemaAtual,
        toggleSidebarRecolhida,
        setUsuarioLogado,
        addUsuario,
        updateUsuario,
        toggleStatusUsuario,
        setUsuarioPermissao,
        resetUsuarioPermissoes,
        getUsuarioPermissoesEfetivas,
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
        cotacoes,
        notasFiscais,
        mensagensWhatsApp,
        ordensPersonalizacao,
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
        addCotacao,
        addPropostaCotacao,
        selecionarPropostaCotacao,
        aprovarCotacao,
        converterCotacaoEmPedido,
        enviarCotacaoWhatsApp,
        emitirNotaFiscal,
        cancelarNotaFiscal,
        addOrdemPersonalizacao,
        updateStatusOSPersonalizacao,
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
