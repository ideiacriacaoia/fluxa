-- ==============================================================================
-- 05. PRODUÇÃO E PCP (Ordens de Produção, Etapas, Apontamentos e Vínculo Retalho)
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE origem_op AS ENUM ('pedido_venda', 'reposicao_estoque');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE modo_corte AS ENUM ('enfesto', 'peca_a_peca');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_execucao AS ENUM ('interna', 'faccao');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE etapa_op AS ENUM ('corte', 'costura', 'acabamento', 'expedicao');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_op AS ENUM ('planejada', 'em_andamento', 'concluida', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA ORDENS DE PRODUÇÃO
CREATE TABLE IF NOT EXISTS ordens_producao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  produto_id uuid NOT NULL REFERENCES produtos(id),
  ficha_tecnica_id uuid NOT NULL REFERENCES fichas_tecnicas(id),
  origem origem_op NOT NULL,
  pedido_venda_id uuid, -- nulo quando origem = reposicao_estoque
  modo_corte modo_corte NOT NULL,
  quantidade_planejada integer NOT NULL,
  status status_op NOT NULL DEFAULT 'planejada',
  data_abertura date NOT NULL DEFAULT current_date,
  data_prevista date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_op_tenant ON ordens_producao(tenant_id);
CREATE INDEX IF NOT EXISTS idx_op_produto ON ordens_producao(tenant_id, produto_id);
CREATE INDEX IF NOT EXISTS idx_op_status ON ordens_producao(tenant_id, status);

-- 3. TABELA ETAPAS DA OP (Mão de Obra por Etapa)
CREATE TABLE IF NOT EXISTS ordens_producao_etapas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  ordem_producao_id uuid NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
  etapa etapa_op NOT NULL,
  tipo_execucao tipo_execucao NOT NULL,
  fornecedor_faccao_id uuid REFERENCES fornecedores(id), -- se tipo_execucao = 'faccao'
  status status_op NOT NULL DEFAULT 'planejada',
  data_inicio date,
  data_fim date,
  created_at timestamptz DEFAULT now(),
  UNIQUE (ordem_producao_id, etapa)
);

CREATE INDEX IF NOT EXISTS idx_op_etapas_op ON ordens_producao_etapas(tenant_id, ordem_producao_id);

-- 4. TABELA APONTAMENTOS DE PRODUÇÃO
CREATE TABLE IF NOT EXISTS ordens_producao_apontamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  ordem_producao_etapa_id uuid NOT NULL REFERENCES ordens_producao_etapas(id) ON DELETE CASCADE,
  quantidade_produzida integer NOT NULL,
  data_apontamento date NOT NULL DEFAULT current_date,
  observacao text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_op_apontamentos_etapa ON ordens_producao_apontamentos(tenant_id, ordem_producao_etapa_id);

-- 5. VINCULAR RETALHO À ORDEM DE PRODUÇÃO
DO $$ BEGIN
  ALTER TABLE estoque_retalho
    ADD CONSTRAINT fk_retalho_op FOREIGN KEY (ordem_producao_id) REFERENCES ordens_producao(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
