-- ==============================================================================
-- 02. PRODUTOS E FICHA TÉCNICA
-- ==============================================================================

-- 1. TABELA PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  nome text NOT NULL,
  referencia text, -- código interno / SKU base
  categoria text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_produtos_tenant ON produtos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_produtos_referencia ON produtos(tenant_id, referencia);

-- 2. TABELA FICHAS TÉCNICAS (Versionada)
CREATE TABLE IF NOT EXISTS fichas_tecnicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  produto_id uuid NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  versao integer NOT NULL,
  composicao text, -- ex: "100% algodão"
  gramatura numeric,
  vigente boolean NOT NULL DEFAULT true, -- só uma versão vigente por produto
  created_at timestamptz DEFAULT now(),
  UNIQUE (produto_id, versao)
);

CREATE INDEX IF NOT EXISTS idx_fichas_tenant ON fichas_tecnicas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fichas_produto_vigente ON fichas_tecnicas(tenant_id, produto_id, vigente);

-- 3. CONSUMO DE TECIDO POR GRADE (Varia por tamanho)
CREATE TABLE IF NOT EXISTS ficha_tecnica_consumo_tecido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  ficha_tecnica_id uuid NOT NULL REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  grade_id uuid NOT NULL REFERENCES grades(id),
  consumo_metros numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consumo_tecido_ficha ON ficha_tecnica_consumo_tecido(tenant_id, ficha_tecnica_id);

-- 4. LISTA DE AVIAMENTOS NECESSÁRIOS POR PEÇA
CREATE TABLE IF NOT EXISTS ficha_tecnica_aviamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  ficha_tecnica_id uuid NOT NULL REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  descricao_aviamento text NOT NULL,
  quantidade numeric NOT NULL,
  unidade text NOT NULL, -- un, m, cm, etc.
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aviamentos_ficha ON ficha_tecnica_aviamentos(tenant_id, ficha_tecnica_id);
