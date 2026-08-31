-- ==============================================================================
-- 03. COMPRAS E LOTES DE RECEBIMENTO
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE status_pedido_compra AS ENUM ('cotacao', 'aprovado', 'enviado', 'recebido_parcial', 'recebido', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA PEDIDOS DE COMPRA
CREATE TABLE IF NOT EXISTS pedidos_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  fornecedor_id uuid NOT NULL REFERENCES fornecedores(id),
  status status_pedido_compra NOT NULL DEFAULT 'cotacao',
  previsao_entrega date,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_compra_tenant ON pedidos_compra(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_fornecedor ON pedidos_compra(tenant_id, fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_status ON pedidos_compra(tenant_id, status);

-- 3. TABELA ITENS DO PEDIDO DE COMPRA
CREATE TABLE IF NOT EXISTS pedidos_compra_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  pedido_compra_id uuid NOT NULL REFERENCES pedidos_compra(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  quantidade numeric NOT NULL,
  unidade text NOT NULL, -- metros, kg, un
  preco_unitario numeric,
  cor text,
  largura_tecido numeric,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_itens_pedido ON pedidos_compra_itens(tenant_id, pedido_compra_id);

-- 4. TABELA LOTES DE RECEBIMENTO (Rastreabilidade Física Real com NF)
CREATE TABLE IF NOT EXISTS lotes_recebimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  pedido_compra_item_id uuid NOT NULL REFERENCES pedidos_compra_itens(id),
  codigo_lote text NOT NULL,
  quantidade_recebida numeric NOT NULL,
  unidade text NOT NULL,
  cor text,
  largura_tecido numeric,
  nota_fiscal text,
  data_recebimento date NOT NULL DEFAULT current_date,
  deposito_id uuid NOT NULL REFERENCES depositos(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lotes_recebimento_tenant ON lotes_recebimento(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lotes_codigo ON lotes_recebimento(tenant_id, codigo_lote);
CREATE INDEX IF NOT EXISTS idx_lotes_deposito ON lotes_recebimento(tenant_id, deposito_id);
CREATE INDEX IF NOT EXISTS idx_lotes_pedido_item ON lotes_recebimento(tenant_id, pedido_compra_item_id);
