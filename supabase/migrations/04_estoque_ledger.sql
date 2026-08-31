-- ==============================================================================
-- 04. ESTOQUE (Ledger de Movimentações, View de Saldos e Retalhos)
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE tipo_movimentacao AS ENUM ('entrada', 'saida', 'ajuste', 'transferencia');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE origem_movimentacao AS ENUM (
      'recebimento_compra', 'consumo_producao', 'geracao_retalho',
      'consumo_retalho', 'entrada_producao', 'venda_expedicao',
      'ajuste_inventario', 'transferencia_deposito'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA ESTOQUE_MOVIMENTACOES (Livro-Razão Imutável)
CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  deposito_id uuid NOT NULL REFERENCES depositos(id),
  lote_id uuid REFERENCES lotes_recebimento(id), -- nulo para produto acabado
  produto_id uuid REFERENCES produtos(id),
  grade_id uuid REFERENCES grades(id),
  tipo tipo_movimentacao NOT NULL,
  origem origem_movimentacao NOT NULL,
  quantidade numeric NOT NULL, -- sempre positivo
  unidade text NOT NULL,
  referencia_id uuid, -- id da OP, lote de recebimento, ajuste, etc.
  observacao text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_tenant ON estoque_movimentacoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_deposito_lote ON estoque_movimentacoes(tenant_id, deposito_id, lote_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_deposito_grade ON estoque_movimentacoes(tenant_id, deposito_id, produto_id, grade_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_referencia ON estoque_movimentacoes(tenant_id, referencia_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created_at ON estoque_movimentacoes(tenant_id, created_at DESC);

-- 3. VIEW ESTOQUE_SALDO_ATUAL (Calculada - Fonte Única de Verdade)
CREATE OR REPLACE VIEW estoque_saldo_atual AS
SELECT
  tenant_id,
  deposito_id,
  lote_id,
  produto_id,
  grade_id,
  unidade,
  SUM(CASE WHEN tipo = 'entrada' THEN quantidade
           WHEN tipo = 'saida' THEN -quantidade
           WHEN tipo = 'ajuste' THEN quantidade
           ELSE 0 END) AS saldo
FROM estoque_movimentacoes
GROUP BY tenant_id, deposito_id, lote_id, produto_id, grade_id, unidade;

-- 4. TABELA ESTOQUE_RETALHO (Sobra de Corte Rastreável)
CREATE TABLE IF NOT EXISTS estoque_retalho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  lote_origem_id uuid NOT NULL REFERENCES lotes_recebimento(id),
  ordem_producao_id uuid, -- FK conectada após criação da tabela ordens_producao
  metragem numeric NOT NULL,
  cor text,
  deposito_id uuid NOT NULL REFERENCES depositos(id),
  disponivel boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retalho_tenant ON estoque_retalho(tenant_id);
CREATE INDEX IF NOT EXISTS idx_retalho_lote ON estoque_retalho(tenant_id, lote_origem_id);
CREATE INDEX IF NOT EXISTS idx_retalho_disponivel ON estoque_retalho(tenant_id, disponivel);
