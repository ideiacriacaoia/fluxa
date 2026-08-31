// ==============================================================================
// FLUXA TÊXTIL — TIPOS TYPESCRIPT OFICIAIS (Fase 1 - Postgres / Supabase)
// ==============================================================================

// Enums
export type TipoFornecedor = 'tecido' | 'aviamento' | 'faccao' | 'misto';
export type TipoDeposito =
  | 'materia_prima'
  | 'retalho'
  | 'wip'
  | 'wip_processo'
  | 'produto_acabado'
  | 'terceirizado_faccao'
  | 'defeito';
export type StatusPedidoCompra =
  | 'cotacao'
  | 'pendente'
  | 'aprovado'
  | 'enviado'
  | 'em_transito'
  | 'recebido_parcial'
  | 'parcial'
  | 'recebido'
  | 'cancelado';
export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste' | 'transferencia';
export type OrigemMovimentacao =
  | 'recebimento_compra'
  | 'consumo_producao'
  | 'geracao_retalho'
  | 'consumo_retalho'
  | 'entrada_producao'
  | 'venda_expedicao'
  | 'ajuste_inventario'
  | 'transferencia_deposito';
export type OrigemOP = 'pedido_venda' | 'reposicao_estoque' | 'estoque' | 'venda';
export type ModoCorte = 'enfesto' | 'peca_a_peca';
export type TipoExecucao = 'interna' | 'faccao';
export type EtapaOP = 'corte' | 'costura' | 'acabamento' | 'expedicao';
export type StatusOP =
  | 'planejada'
  | 'em_andamento'
  | 'em_corte'
  | 'em_costura'
  | 'em_acabamento'
  | 'concluida'
  | 'finalizada'
  | 'cancelada';

// 1. Cadastros Base
export type Fornecedor = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  nome?: string;
  razao_social?: string;
  nome_fantasia?: string;
  tipo: TipoFornecedor;
  documento?: string;
  cnpj_cpf?: string;
  contato_nome?: string;
  contato_telefone?: string;
  contato_email?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  uf?: string;
  prazo_medio_entrega_dias?: number;
  avaliacao_nota?: number;
  ativo?: boolean;
  created_at: string;
  updated_at?: string;
};

export type Deposito = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  codigo?: string;
  nome: string;
  tipo: TipoDeposito;
  permite_saldo_negativo?: boolean;
  ativo?: boolean;
  created_at: string;
};

export type Grade = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  cor?: string;
  tamanho?: string;
  created_at?: string;
};

// 2. Produtos & Ficha Técnica
export type Produto = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  nome: string;
  referencia?: string;
  categoria?: string;
  colecao?: string;
  descricao?: string;
  preco_venda_sugerido?: number;
  foto_url?: string;
  ativo?: boolean;
  created_at: string;
  updated_at?: string;
  variacoes?: ProdutoVariacao[];
  fichas_tecnicas?: FichaTecnica[];
};

export type FichaTecnica = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  produto_id: string;
  versao: number;
  composicao?: string;
  gramatura?: number;
  vigente?: boolean;
  status?: 'rascunho' | 'aprovada' | 'obsoleta';
  observacoes_corte?: string;
  observacoes_costura?: string;
  custo_estimado_mp?: number;
  custo_estimado_mo?: number;
  custo_estimado_total?: number;
  aprovado_por?: string;
  created_at: string;
  consumos_tecido?: FichaTecnicaConsumoTecido[];
  aviamentos?: FichaTecnicaAviamento[];
  materiais?: FichaTecnicaMaterial[];
};

export type FichaTecnicaMaterial = {
  id: string;
  ficha_tecnica_id: string;
  item_catalogo_id: string;
  item_codigo?: string;
  item_descricao?: string;
  unidade_medida?: string;
  tipo?: string;
  aplicacao: string;
  consumo_por_peca: number;
  percentual_perda: number;
  custo_unitario_base: number;
  custo_total_estimado: number;
  tamanhos_aplicaveis?: string[];
};

export type FichaTecnicaConsumoTecido = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  ficha_tecnica_id: string;
  grade_id: string;
  consumo_metros: number;
  cor?: string;
  tamanho?: string;
  created_at?: string;
};

export type FichaTecnicaAviamento = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  ficha_tecnica_id: string;
  descricao_aviamento: string;
  quantidade: number;
  unidade: string;
  created_at?: string;
};

// 3. Compras
export type PedidoCompra = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  numero_pedido?: number;
  fornecedor_id: string;
  fornecedor_nome?: string;
  status: StatusPedidoCompra;
  data_emissao?: string;
  previsao_entrega?: string;
  data_prevista_entrega?: string;
  condicao_pagamento?: string;
  valor_total?: number;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
  itens?: PedidoCompraItem[];
};

export type PedidoCompraItem = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  pedido_compra_id: string;
  item_catalogo_id?: string;
  item_codigo?: string;
  item_descricao?: string;
  descricao?: string;
  quantidade?: number;
  quantidade_pedida?: number;
  quantidade_entregue?: number;
  unidade?: string;
  unidade_medida?: string;
  preco_unitario?: number;
  valor_total?: number;
  cor?: string;
  cor_referencia?: string;
  largura_tecido?: number;
  created_at?: string;
};

export type LoteRecebimento = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  pedido_compra_item_id?: string;
  pedido_compra_id?: string;
  item_pedido_id?: string;
  codigo_lote: string;
  quantidade_recebida?: number;
  quantidade_inicial?: number;
  quantidade_atual?: number;
  unidade?: string;
  unidade_medida?: string;
  cor?: string;
  cor_nome?: string;
  cor_codigo?: string;
  largura_tecido?: number;
  largura_real_m?: number;
  gramatura_real?: number;
  custo_unitario?: number;
  nota_fiscal?: string;
  chave_nfe?: string;
  lote_fornecedor?: string;
  observacoes?: string;
  data_recebimento: string;
  deposito_id?: string;
  deposito_destino_id?: string;
  deposito_nome?: string;
  fornecedor_id?: string;
  fornecedor_nome?: string;
  item_catalogo_id?: string;
  item_codigo?: string;
  item_descricao?: string;
  created_at: string;
};

// 4. Estoque & Ledger
export type EstoqueMovimentacao = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  deposito_id: string;
  deposito_nome?: string;
  lote_id?: string;
  codigo_lote?: string;
  produto_id?: string;
  produto_nome?: string;
  grade_id?: string;
  tipo: TipoMovimentacao;
  origem: OrigemMovimentacao;
  quantidade: number;
  unidade: string;
  referencia_id?: string;
  observacao?: string;
  created_by?: string;
  created_at: string;
};

export type EstoqueSaldoAtual = {
  tenant_id?: string;
  empresa_id?: string;
  deposito_id: string;
  deposito_nome?: string;
  lote_id?: string;
  codigo_lote?: string;
  cor?: string;
  produto_id?: string;
  produto_nome?: string;
  grade_id?: string;
  cor_grade?: string;
  tamanho_grade?: string;
  unidade: string;
  saldo: number;
};

export type EstoqueRetalho = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  lote_origem_id?: string;
  codigo_lote_origem?: string;
  ordem_producao_id?: string;
  ordem_producao_origem_id?: string;
  numero_op_origem?: number;
  codigo_retalho?: string;
  metragem?: number;
  metragem_residual_m?: number;
  peso_residual_kg?: number;
  largura_aproveitavel_m?: number;
  cor?: string;
  cor_nome?: string;
  cor_codigo?: string;
  item_catalogo_id?: string;
  item_descricao?: string;
  deposito_id?: string;
  deposito_nome?: string;
  disponivel?: boolean;
  status?: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
};

// 5. Produção & PCP
export type OrdemProducao = {
  id: string;
  tenant_id?: string;
  empresa_id?: string;
  numero_op?: number;
  produto_id: string;
  produto_nome?: string;
  produto_referencia?: string;
  ficha_tecnica_id: string;
  deposito_producao_id?: string;
  origem: OrigemOP;
  pedido_venda_id?: string;
  numero_pedido_venda?: string;
  cliente_nome?: string;
  modo_corte: ModoCorte;
  quantidade_planejada: number;
  quantidade_cortada?: number;
  quantidade_produzida?: number;
  quantidade_segunda_qualidade?: number;
  status: StatusOP;
  data_abertura?: string;
  data_prevista?: string;
  data_inicio_prevista?: string;
  data_fim_prevista?: string;
  data_inicio_real?: string;
  data_fim_real?: string;
  observacoes?: string;
  etapas_execucao?: {
    corte: { tipo: 'interna' | 'faccao'; terceirizado_id?: string; terceirizado_nome?: string };
    costura: { tipo: 'interna' | 'faccao'; terceirizado_id?: string; terceirizado_nome?: string };
    acabamento: { tipo: 'interna' | 'faccao'; terceirizado_id?: string; terceirizado_nome?: string };
  };
  grade?: any[];
  consumos?: any[];
  consumos_retalhos?: any[];
  created_at: string;
  updated_at?: string;
  etapas?: OrdemProducaoEtapa[];
  apontamentos?: OrdemProducaoApontamento[];
  retalhos?: EstoqueRetalho[];
};

export type OrdemProducaoEtapa = {
  id: string;
  tenant_id: string;
  ordem_producao_id: string;
  etapa: EtapaOP;
  tipo_execucao: TipoExecucao;
  fornecedor_faccao_id?: string;
  fornecedor_nome?: string;
  status: StatusOP;
  data_inicio?: string;
  data_fim?: string;
  created_at?: string;
};

export type OrdemProducaoApontamento = {
  id: string;
  tenant_id?: string;
  ordem_producao_id?: string;
  ordem_producao_etapa_id?: string;
  etapa?: any;
  tipo_execucao?: 'interna' | 'faccao';
  terceirizado_id?: string;
  terceirizado_nome?: string;
  operador_nome?: string;
  quantidade_processada?: number;
  quantidade_produzida?: number;
  quantidade_defeito?: number;
  motivo_defeito?: string;
  retalho_gerado_kg?: number;
  tempo_minutos?: number;
  data_apontamento?: string;
  observacao?: string;
  created_at: string;
};

// Aliases de compatibilidade
export type OPApontamento = OrdemProducaoApontamento;
export type OPItemGrade = {
  id: string;
  ordem_producao_id: string;
  produto_variacao_id: string;
  sku?: string;
  cor_nome?: string;
  tamanho?: string;
  quantidade_planejada: number;
  quantidade_cortada: number;
  quantidade_finalizada: number;
};
export type OPConsumoLote = {
  id: string;
  ordem_producao_id: string;
  lote_id: string;
  codigo_lote?: string;
  item_descricao?: string;
  quantidade_consumida: number;
  unidade_medida: string;
  data_consumo: string;
};
export type OPConsumoRetalho = {
  id: string;
  ordem_producao_id: string;
  retalho_id: string;
  codigo_retalho: string;
  cor_nome: string;
  quantidade_consumida_kg: number;
  data_consumo: string;
};
export type EstoqueSaldo = {
  id: string;
  empresa_id?: string;
  tenant_id?: string;
  deposito_id: string;
  deposito_nome?: string;
  item_catalogo_id?: string;
  item_codigo?: string;
  item_descricao?: string;
  lote_id?: string;
  codigo_lote?: string;
  cor_nome?: string;
  produto_variacao_id?: string;
  produto_referencia?: string;
  produto_nome?: string;
  sku?: string;
  tamanho?: string;
  quantidade_atual: number;
  quantidade_reservada: number;
  unidade_medida: string;
  updated_at: string;
};
export type MovimentacaoEstoque = {
  id: string;
  empresa_id?: string;
  tenant_id?: string;
  deposito_id: string;
  deposito_nome?: string;
  item_catalogo_id?: string;
  item_descricao?: string;
  lote_id?: string;
  codigo_lote?: string;
  produto_variacao_id?: string;
  tipo_movimento: string;
  quantidade: number;
  saldo_anterior: number;
  saldo_posterior: number;
  unidade_medida: string;
  documento_origem_tipo?: string;
  documento_origem_id?: string;
  motivo_ajuste?: string;
  usuario_nome?: string;
  created_at: string;
};
export type ItemCatalogo = {
  id: string;
  empresa_id?: string;
  tenant_id?: string;
  codigo: string;
  descricao: string;
  tipo: 'tecido' | 'aviamento' | 'fio' | 'embalagem';
  unidade_medida: 'metro' | 'kg' | 'unidade' | 'rolo' | 'cone' | 'cento';
  composicao?: string;
  gramatura_g_m2?: number;
  largura_padrao_m?: number;
  rendimento_m_kg?: number;
  estoque_minimo: number;
  ponto_pedido: number;
  custo_medio_unitario: number;
  ativo: boolean;
  created_at: string;
};
export type ProdutoVariacao = {
  id: string;
  produto_id: string;
  sku: string;
  cor_nome: string;
  tamanho: string;
  codigo_barras?: string;
  estoque_minimo: number;
  estoque_atual?: number;
  ativo: boolean;
};
export type Empresa = {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  ie?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  uf?: string;
  configuracoes: {
    permitir_saldo_negativo_geral?: boolean;
    alerta_estoque_minimo?: boolean;
  };
  created_at: string;
};
export type Usuario = {
  id: string;
  empresa_id: string;
  nome: string;
  email: string;
  cargo?: string;
  nivel_acesso: 'admin' | 'gerente_pcp' | 'comprador' | 'operador';
  ativo: boolean;
  created_at: string;
};

// ==============================================================================
// 6. FASE 2 — CHÃO DE FÁBRICA, CRONOANÁLISE, APONTAMENTOS & EFICIÊNCIA
// ==============================================================================

export type TipoDesvio =
  | 'falta_material'
  | 'atraso'
  | 'troca_operacao'
  | 'regulagem_maquina'
  | 'retrabalho'
  | 'outro';

export type StatusRemessaFaccao =
  | 'enviada'
  | 'recebida_parcial'
  | 'recebida'
  | 'atrasada';

export type CelulaProducao = {
  id: string;
  tenant_id?: string;
  nome: string;
  etapa_padrao?: EtapaOP;
  ativa: boolean;
  created_at?: string;
};

export type Colaborador = {
  id: string;
  tenant_id?: string;
  nome: string;
  matricula?: string;
  celula_padrao_id?: string;
  celula_padrao_nome?: string;
  ativo: boolean;
  created_at?: string;
};

export type OperacaoPadrao = {
  id: string;
  tenant_id?: string;
  nome: string;
  etapa: EtapaOP;
  tempo_padrao_segundos: number;
  ativa: boolean;
  created_at?: string;
};

export type ProdutoOperacao = {
  id: string;
  tenant_id?: string;
  produto_id: string;
  operacao_padrao_id: string;
  operacao_nome?: string;
  tempo_padrao_segundos?: number;
  sequencia: number;
  created_at?: string;
};

export type ApontamentoProducao = {
  id: string;
  tenant_id?: string;
  ordem_producao_etapa_id: string;
  celula_id: string;
  celula_nome?: string;
  colaborador_id: string;
  colaborador_nome?: string;
  operacao_padrao_id: string;
  operacao_nome?: string;
  quantidade_produzida: number;
  tempo_gasto_segundos: number;
  registrado_em: string;
};

export type DesvioProducao = {
  id: string;
  tenant_id?: string;
  ordem_producao_etapa_id: string;
  celula_id?: string;
  celula_nome?: string;
  colaborador_id?: string;
  colaborador_nome?: string;
  tipo: TipoDesvio;
  tempo_parado_segundos?: number;
  observacao?: string;
  registrado_em: string;
};

export type EficienciaApontamento = {
  apontamento_id: string;
  tenant_id: string;
  ordem_producao_etapa_id: string;
  celula_id: string;
  colaborador_id: string;
  operacao_padrao_id: string;
  quantidade_produzida: number;
  tempo_gasto_segundos: number;
  registrado_em: string;
  tempo_padrao_segundos: number;
  eficiencia_percentual: number;
};

export type RegraPremioProdutividade = {
  id: string;
  tenant_id?: string;
  eficiencia_minima_percentual: number;
  valor_premio_por_peca: number;
  vigente_desde: string;
  vigente_ate?: string;
  ativa: boolean;
  created_at?: string;
};

export type PremioCalculado = {
  id: string;
  tenant_id?: string;
  colaborador_id: string;
  colaborador_nome?: string;
  periodo_inicio: string;
  periodo_fim: string;
  eficiencia_media_percentual: number;
  regra_aplicada_id: string;
  valor_total_premio: number;
  premio_anterior_id?: string;
  motivo_retificacao?: string;
  calculado_em: string;
};

export type RemessaFaccao = {
  id: string;
  tenant_id?: string;
  ordem_producao_etapa_id: string;
  fornecedor_faccao_id: string;
  fornecedor_nome?: string;
  quantidade_enviada: number;
  quantidade_recebida?: number;
  data_envio: string;
  prazo_devolucao: string;
  status: StatusRemessaFaccao;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  glosas?: GlosaFaccao[];
};

export type GlosaFaccao = {
  id: string;
  tenant_id?: string;
  remessa_faccao_id: string;
  quantidade_glosada: number;
  motivo: string;
  valor_desconto?: number;
  registrado_em: string;
};

export type PainelGestaoAVista = {
  tenant_id?: string;
  celula_id: string;
  celula_nome: string;
  etapa_padrao?: EtapaOP;
  dia: string;
  total_produzido: number;
  eficiencia_media: number;
  total_desvios: number;
  tempo_total_parado_segundos: number;
};
