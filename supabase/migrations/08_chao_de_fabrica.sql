-- ==============================================================================
-- FLUXA TÊXTIL — FASE 2: CHÃO DE FÁBRICA & CRONOANÁLISE (08_chao_de_fabrica.sql)
-- ==============================================================================

-- 1. Células de Produção
CREATE TABLE IF NOT EXISTS celulas_producao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  nome text NOT NULL,
  etapa_padrao etapa_op,
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_celulas_tenant ON celulas_producao (tenant_id);
CREATE INDEX IF NOT EXISTS idx_celulas_etapa ON celulas_producao (tenant_id, etapa_padrao);

-- 2. Colaboradores / Operadores de Produção
CREATE TABLE IF NOT EXISTS colaboradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  nome text NOT NULL,
  matricula text,
  celula_padrao_id uuid REFERENCES celulas_producao(id),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_colaboradores_tenant ON colaboradores (tenant_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_celula ON colaboradores (tenant_id, celula_padrao_id);

-- 3. Operações Padrão (Cronoanálise)
CREATE TABLE IF NOT EXISTS operacoes_padrao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  nome text NOT NULL,
  etapa etapa_op NOT NULL,
  tempo_padrao_segundos numeric NOT NULL CHECK (tempo_padrao_segundos > 0),
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operacoes_tenant_etapa ON operacoes_padrao (tenant_id, etapa);

-- 4. Roteiro de Produção do Produto (Produto x Operações)
CREATE TABLE IF NOT EXISTS produto_operacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  produto_id uuid NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  operacao_padrao_id uuid NOT NULL REFERENCES operacoes_padrao(id) ON DELETE RESTRICT,
  sequencia integer NOT NULL CHECK (sequencia > 0),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT uq_produto_operacao UNIQUE (tenant_id, produto_id, operacao_padrao_id)
);

CREATE INDEX IF NOT EXISTS idx_produto_operacoes_seq ON produto_operacoes (tenant_id, produto_id, sequencia);
