-- ==============================================================================
-- FLUXA TÊXTIL — SCRIPT DE INICIALIZAÇÃO DE BANCO DE DADOS (PostgreSQL / Supabase - v2)
-- ==============================================================================

-- 1. EXTENSÕES & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE EMPRESAS (Multi-Tenancy)
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    ie TEXT,
    telefone TEXT,
    email TEXT,
    cidade TEXT,
    uf VARCHAR(2),
    configuracoes JSONB DEFAULT '{"permitir_saldo_negativo_geral": false, "alerta_estoque_minimo": true}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cargo TEXT,
    nivel_acesso TEXT DEFAULT 'operador', -- 'admin', 'gerente_pcp', 'comprador', 'operador'
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. DEPÓSITOS E ALMOXARIFADO
CREATE TABLE IF NOT EXISTS depositos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'materia_prima', 'retalho', 'wip_processo', 'produto_acabado', 'terceirizado_faccao', 'defeito'
    permite_saldo_negativo BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(empresa_id, codigo)
);

-- 5. FORNECEDORES E PRESTADORES DE SERVIÇOS (FACÇÃO)
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    cnpj_cpf TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'tecido', 'aviamento', 'faccao', 'servicos', 'geral'
    contato_nome TEXT,
    telefone TEXT,
    email TEXT,
    cidade TEXT,
    uf VARCHAR(2),
    prazo_medio_entrega_dias INT DEFAULT 7,
    avaliacao_nota NUMERIC(3,2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CATÁLOGO DE MATÉRIA-PRIMA & INSUMOS (Tecidos, Fios, Aviamentos)
CREATE TABLE IF NOT EXISTS itens_catalogo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'tecido', 'aviamento', 'fio', 'embalagem'
    unidade_medida TEXT NOT NULL, -- 'metro', 'kg', 'unidade', 'rolo', 'cone', 'cento'
    composicao TEXT, -- '100% Algodão', '96% Viscose 4% Elastano'
    gramatura_g_m2 NUMERIC(10,2), -- g/m² para cálculo de rendimento
    largura_padrao_m NUMERIC(10,3), -- ex: 1.60m
    rendimento_m_kg NUMERIC(10,3), -- Metros lineares por kg
    estoque_minimo NUMERIC(12,3) DEFAULT 0,
    ponto_pedido NUMERIC(12,3) DEFAULT 0,
    custo_medio_unitario NUMERIC(14,4) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(empresa_id, codigo)
);

-- 7. COMPRAS & ITENS DE PEDIDO
CREATE TABLE IF NOT EXISTS pedidos_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    numero_pedido SERIAL,
    fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
    status TEXT NOT NULL DEFAULT 'rascunho', -- 'rascunho', 'cotacao', 'aprovado', 'parcial', 'recebido', 'cancelado'
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prevista_entrega DATE,
    condicao_pagamento TEXT,
    valor_total NUMERIC(14,2) DEFAULT 0,
    observacoes TEXT,
    criado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS itens_pedido_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_compra_id UUID NOT NULL REFERENCES pedidos_compra(id) ON DELETE CASCADE,
    item_catalogo_id UUID NOT NULL REFERENCES itens_catalogo(id),
    cor_referencia TEXT,
    quantidade_pedida NUMERIC(12,3) NOT NULL,
    quantidade_entregue NUMERIC(12,3) DEFAULT 0,
    preco_unitario NUMERIC(14,4) NOT NULL,
    valor_total NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. LOTES DE RECEBIMENTO (Rastreabilidade Ponta a Ponta)
CREATE TABLE IF NOT EXISTS lotes_recebimento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    item_catalogo_id UUID NOT NULL REFERENCES itens_catalogo(id),
    fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
    pedido_compra_id UUID REFERENCES pedidos_compra(id),
    item_pedido_id UUID REFERENCES itens_pedido_compra(id),
    codigo_lote TEXT NOT NULL, -- Ex: 'LT-2026-MALHA-PT-01'
    lote_fornecedor TEXT,
    nota_fiscal TEXT NOT NULL,
    chave_nfe TEXT,
    cor_nome TEXT,
    cor_codigo TEXT,
    largura_real_m NUMERIC(10,3),
    gramatura_real NUMERIC(10,2),
    quantidade_inicial NUMERIC(12,3) NOT NULL,
    unidade_medida TEXT NOT NULL,
    custo_unitario NUMERIC(14,4) NOT NULL,
    data_recebimento DATE NOT NULL DEFAULT CURRENT_DATE,
    deposito_destino_id UUID NOT NULL REFERENCES depositos(id),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(empresa_id, codigo_lote)
);

-- 9. SALDOS DE ESTOQUE & AUDITORIA (Ledger)
CREATE TABLE IF NOT EXISTS estoque_saldos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    deposito_id UUID NOT NULL REFERENCES depositos(id),
    item_catalogo_id UUID REFERENCES itens_catalogo(id),
    lote_id UUID REFERENCES lotes_recebimento(id),
    produto_variacao_id UUID, -- Usado quando for saldo de produto acabado
    quantidade_atual NUMERIC(14,3) NOT NULL DEFAULT 0,
    quantidade_reservada NUMERIC(14,3) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(empresa_id, deposito_id, lote_id, produto_variacao_id)
);

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    deposito_id UUID NOT NULL REFERENCES depositos(id),
    item_catalogo_id UUID REFERENCES itens_catalogo(id),
    lote_id UUID REFERENCES lotes_recebimento(id),
    produto_variacao_id UUID,
    tipo_movimento TEXT NOT NULL, -- 'entrada_compra', 'saida_corte_op', 'retorno_sobra_op', 'entrada_retalho_corte', 'transferencia_deposito', 'ajuste_inventario', 'entrada_producao_pa', 'saida_venda'
    quantidade NUMERIC(14,3) NOT NULL,
    saldo_anterior NUMERIC(14,3) NOT NULL,
    saldo_posterior NUMERIC(14,3) NOT NULL,
    documento_origem_tipo TEXT, -- 'pedido_compra', 'lote_recebimento', 'ordem_producao', 'inventario', 'pedido_venda', 'estoque_retalho'
    documento_origem_id UUID,
    motivo_ajuste TEXT,
    usuario_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. PRODUTOS ACABADOS & VARIAÇÕES (Grade Cor x Tamanho)
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    referencia TEXT NOT NULL,
    nome TEXT NOT NULL,
    categoria TEXT,
    colecao TEXT,
    descricao TEXT,
    preco_venda_sugerido NUMERIC(12,2) DEFAULT 0,
    foto_url TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(empresa_id, referencia)
);

CREATE TABLE IF NOT EXISTS produtos_variacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    cor_nome TEXT NOT NULL,
    tamanho TEXT NOT NULL,
    codigo_barras TEXT,
    estoque_minimo INT DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. FICHAS TÉCNICAS E CONSUMO DE MATERIAIS
CREATE TABLE IF NOT EXISTS fichas_tecnicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    versao INT NOT NULL DEFAULT 1,
    status TEXT DEFAULT 'aprovada', -- 'rascunho', 'aprovada', 'obsoleta'
    observacoes_corte TEXT,
    observacoes_costura TEXT,
    custo_estimado_mp NUMERIC(12,4) DEFAULT 0,
    custo_estimado_mo NUMERIC(12,4) DEFAULT 0,
    custo_estimado_total NUMERIC(12,4) DEFAULT 0,
    aprovado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(produto_id, versao)
);

CREATE TABLE IF NOT EXISTS ficha_tecnica_materiais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ficha_tecnica_id UUID NOT NULL REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
    item_catalogo_id UUID NOT NULL REFERENCES itens_catalogo(id),
    aplicacao TEXT NOT NULL,
    consumo_por_peca NUMERIC(10,4) NOT NULL,
    percentual_perda NUMERIC(5,2) DEFAULT 0,
    custo_unitario_base NUMERIC(12,4) DEFAULT 0,
    custo_total_estimado NUMERIC(12,4) DEFAULT 0,
    tamanhos_aplicaveis TEXT[]
);

-- 12. ORDENS DE PRODUÇÃO (PCP v2: Origem Híbrida, Modo de Corte, Etapas Mistas)
CREATE TABLE IF NOT EXISTS ordens_producao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    numero_op SERIAL,
    produto_id UUID NOT NULL REFERENCES produtos(id),
    ficha_tecnica_id UUID NOT NULL REFERENCES fichas_tecnicas(id),
    deposito_producao_id UUID NOT NULL REFERENCES depositos(id),
    origem TEXT NOT NULL DEFAULT 'estoque', -- 'estoque' | 'pedido_venda'
    pedido_venda_id UUID,
    numero_pedido_venda TEXT,
    cliente_nome TEXT,
    modo_corte TEXT NOT NULL DEFAULT 'enfesto', -- 'enfesto' | 'peca_a_peca'
    status TEXT NOT NULL DEFAULT 'planejada', -- 'planejada', 'em_corte', 'em_costura', 'em_acabamento', 'finalizada', 'cancelada'
    etapas_execucao JSONB DEFAULT '{
        "corte": {"tipo": "interna", "terceirizado_id": null},
        "costura": {"tipo": "interna", "terceirizado_id": null},
        "acabamento": {"tipo": "interna", "terceirizado_id": null}
    }',
    quantidade_planejada INT NOT NULL,
    quantidade_cortada INT DEFAULT 0,
    quantidade_produzida INT DEFAULT 0,
    quantidade_segunda_qualidade INT DEFAULT 0,
    data_inicio_prevista DATE,
    data_fim_prevista DATE,
    data_inicio_real TIMESTAMPTZ,
    data_fim_real TIMESTAMPTZ,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS op_itens_grade (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ordem_producao_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
    produto_variacao_id UUID NOT NULL REFERENCES produtos_variacoes(id),
    quantidade_planejada INT NOT NULL,
    quantidade_cortada INT DEFAULT 0,
    quantidade_finalizada INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS op_consumo_lotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ordem_producao_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
    lote_id UUID NOT NULL REFERENCES lotes_recebimento(id),
    quantidade_consumida NUMERIC(12,3) NOT NULL,
    unidade_medida TEXT NOT NULL,
    data_consumo TIMESTAMPTZ DEFAULT now()
);

-- 13. ESTOQUE DE RETALHOS (Sobras Controladas do Corte)
CREATE TABLE IF NOT EXISTS estoque_retalho (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    deposito_id UUID NOT NULL REFERENCES depositos(id),
    lote_origem_id UUID NOT NULL REFERENCES lotes_recebimento(id),
    item_catalogo_id UUID NOT NULL REFERENCES itens_catalogo(id),
    ordem_producao_origem_id UUID REFERENCES ordens_producao(id),
    codigo_retalho TEXT NOT NULL, -- Ex: 'RET-LT2026-MALHA-PT-01-A'
    cor_nome TEXT NOT NULL,
    cor_codigo TEXT,
    metragem_residual_m NUMERIC(10,3),
    peso_residual_kg NUMERIC(10,3) NOT NULL,
    largura_aproveitavel_m NUMERIC(10,3),
    status TEXT NOT NULL DEFAULT 'disponivel', -- 'disponivel', 'reservado_op', 'consumido', 'descartado'
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(empresa_id, codigo_retalho)
);

CREATE TABLE IF NOT EXISTS op_consumo_retalhos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ordem_producao_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
    retalho_id UUID NOT NULL REFERENCES estoque_retalho(id),
    quantidade_consumida_kg NUMERIC(10,3) NOT NULL,
    data_consumo TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS op_apontamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ordem_producao_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
    etapa TEXT NOT NULL, -- 'enfesto_corte', 'costura_interna', 'faccao_externa', 'revisao_qualidade', 'embalagem'
    tipo_execucao TEXT NOT NULL DEFAULT 'interna', -- 'interna' | 'faccao'
    terceirizado_id UUID REFERENCES fornecedores(id),
    operador_nome TEXT,
    quantidade_processada INT NOT NULL,
    quantidade_defeito INT DEFAULT 0,
    motivo_defeito TEXT,
    retalho_gerado_kg NUMERIC(10,3) DEFAULT 0,
    tempo_minutos INT,
    created_at TIMESTAMPTZ DEFAULT now()
);
