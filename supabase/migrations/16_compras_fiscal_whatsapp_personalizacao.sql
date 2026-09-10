-- ==============================================================================
-- FLUXA TÊXTIL — SCHEMA FASE 3: COMPRAS, FISCAL, WHATSAPP E OS PERSONALIZAÇÃO
-- ==============================================================================

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE status_fornecedor_enum AS ENUM ('ativo', 'inativo', 'bloqueado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE status_cotacao_enum AS ENUM ('aberta', 'em_negociacao', 'respondida', 'aprovada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE status_pedido_compra_enum AS ENUM ('pendente', 'confirmado', 'em_transito', 'entregue', 'atrasado', 'cancelado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_nota_fiscal_enum AS ENUM ('NFe', 'NFCe');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE status_sefaz_enum AS ENUM ('pendente_envio', 'autorizada', 'rejeitada', 'cancelada', 'denegada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE direcao_whatsapp_enum AS ENUM ('enviada', 'recebida');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE status_whatsapp_enum AS ENUM ('enviado', 'entregue', 'lido', 'erro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE status_os_personalizacao_enum AS ENUM ('orcamento', 'aprovada', 'em_producao', 'aguardando_bordado', 'aguardando_etiqueta', 'finalizada', 'entregue', 'cancelada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_componente_os_enum AS ENUM ('materia_prima', 'bordado', 'tag', 'etiqueta', 'outro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE status_componente_os_enum AS ENUM ('pendente', 'em_execucao', 'concluido');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  razao_social text NOT NULL,
  nome_fantasia text,
  cnpj varchar(14) NOT NULL, -- Validação regex: ^[A-Z0-9]{12}[0-9]{2}$
  contato_nome text,
  contato_whatsapp text,
  categoria_fornecimento text, -- matéria-prima, aviamento, bordado terceirizado
  avaliacao numeric(2,1) DEFAULT 5.0 CHECK (avaliacao >= 1.0 AND avaliacao <= 5.0),
  prazo_medio_entrega_dias integer DEFAULT 7,
  status status_fornecedor_enum NOT NULL DEFAULT 'ativo',
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Tabela de Cotações
CREATE TABLE IF NOT EXISTS cotacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  numero text NOT NULL UNIQUE, -- ex: COT-2026-001
  data_abertura date NOT NULL DEFAULT CURRENT_DATE,
  solicitante text NOT NULL,
  status status_cotacao_enum NOT NULL DEFAULT 'aberta',
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itens da Cotação
CREATE TABLE IF NOT EXISTS cotacao_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  cotacao_id uuid NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
  descricao_item text NOT NULL,
  quantidade numeric(12,3) NOT NULL,
  unidade varchar(10) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Respostas de Fornecedores (N respostas por cotação para comparação lado a lado)
CREATE TABLE IF NOT EXISTS cotacao_respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  cotacao_id uuid NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
  fornecedor_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES cotacao_itens(id) ON DELETE CASCADE,
  preco_unitario numeric(12,4) NOT NULL,
  prazo_entrega_dias integer NOT NULL DEFAULT 7,
  condicao_pagamento text DEFAULT '28/42 DDL',
  data_resposta date DEFAULT CURRENT_DATE,
  selecionada boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. Notas Fiscais (Integração Sefaz)
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tipo tipo_nota_fiscal_enum NOT NULL DEFAULT 'NFe',
  pedido_compra_id uuid,
  pedido_venda_id uuid,
  cnpj_emitente varchar(14) NOT NULL,
  cnpj_destinatario varchar(14) NOT NULL,
  chave_acesso varchar(44) UNIQUE,
  status_sefaz status_sefaz_enum NOT NULL DEFAULT 'pendente_envio',
  motivo_rejeicao text,
  xml_retorno text,
  data_emissao timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 5. Pedidos de Compra
CREATE TABLE IF NOT EXISTS pedidos_compra_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  numero text NOT NULL UNIQUE,
  cotacao_id uuid REFERENCES cotacoes(id) ON DELETE SET NULL,
  fornecedor_id uuid NOT NULL,
  itens jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{descricao, quantidade, preco_unitario, subtotal}]
  valor_total numeric(14,2) NOT NULL DEFAULT 0,
  prazo_entrega_previsto date,
  status status_pedido_compra_enum NOT NULL DEFAULT 'pendente',
  nota_fiscal_id uuid REFERENCES notas_fiscais(id) ON DELETE SET NULL,
  historico_status jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{status, data, usuario}]
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. WhatsApp Mensagens
CREATE TABLE IF NOT EXISTS whatsapp_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  fornecedor_id uuid NOT NULL,
  cotacao_id uuid REFERENCES cotacoes(id) ON DELETE SET NULL,
  direcao direcao_whatsapp_enum NOT NULL,
  conteudo text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  status_entrega status_whatsapp_enum NOT NULL DEFAULT 'enviado',
  created_at timestamptz DEFAULT now()
);

-- 7. Ordem de Serviço — Personalização
CREATE TABLE IF NOT EXISTS os_personalizacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  numero text NOT NULL UNIQUE, -- ex: OS-2026-001
  cliente_id uuid NOT NULL,
  peca_base_id uuid NOT NULL, -- Referência ao produto pronto no estoque
  peca_base_descricao text NOT NULL, -- Snapshot, ex: "Jaqueta Preta P"
  custo_total numeric(14,2) NOT NULL DEFAULT 0,
  prazo_entrega date NOT NULL,
  status status_os_personalizacao_enum NOT NULL DEFAULT 'orcamento',
  historico_status jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{status, data, usuario}]
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Componentes da OS de Personalização
CREATE TABLE IF NOT EXISTS os_componentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  os_id uuid NOT NULL REFERENCES os_personalizacao(id) ON DELETE CASCADE,
  tipo tipo_componente_os_enum NOT NULL DEFAULT 'outro',
  descricao text NOT NULL,
  fornecedor_id uuid, -- Se terceirizado (ex: bordado externo)
  custo numeric(12,4) NOT NULL DEFAULT 0,
  status status_componente_os_enum NOT NULL DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

-- 8. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_cotacoes_tenant_status ON cotacoes(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_cotacao_respostas_cotacao ON cotacao_respostas(cotacao_id);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_chave ON notas_fiscais(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_cotacao ON whatsapp_mensagens(cotacao_id, fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_os_personalizacao_tenant_status ON os_personalizacao(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_os_componentes_os ON os_componentes(os_id);
