-- ==============================================================================
-- FLUXA TÊXTIL — FASE 2: APONTAMENTOS EM TEMPO REAL & DESVIOS (09_apontamentos_desvios.sql)
-- ==============================================================================

-- 1. Enum de Desvios Operacionais
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_desvio') THEN
    CREATE TYPE tipo_desvio AS ENUM (
      'falta_material',
      'atraso',
      'troca_operacao',
      'regulagem_maquina',
      'retrabalho',
      'outro'
    );
  END IF;
END$$;

-- 2. Apontamentos de Produção Granulares
CREATE TABLE IF NOT EXISTS apontamentos_producao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  ordem_producao_etapa_id uuid NOT NULL REFERENCES ordens_producao_etapas(id) ON DELETE CASCADE,
  celula_id uuid NOT NULL REFERENCES celulas_producao(id) ON DELETE RESTRICT,
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
  operacao_padrao_id uuid NOT NULL REFERENCES operacoes_padrao(id) ON DELETE RESTRICT,
  quantidade_produzida integer NOT NULL CHECK (quantidade_produzida > 0),
  tempo_gasto_segundos numeric NOT NULL CHECK (tempo_gasto_segundos > 0),
  registrado_em timestamptz NOT NULL DEFAULT now()
);

-- Índices de Alta Frequência para Chão de Fábrica e TV
CREATE INDEX IF NOT EXISTS idx_apontamentos_tenant_data ON apontamentos_producao (tenant_id, registrado_em DESC);
CREATE INDEX IF NOT EXISTS idx_apontamentos_celula_data ON apontamentos_producao (tenant_id, celula_id, registrado_em DESC);
CREATE INDEX IF NOT EXISTS idx_apontamentos_colab_data ON apontamentos_producao (tenant_id, colaborador_id, registrado_em DESC);
CREATE INDEX IF NOT EXISTS idx_apontamentos_etapa ON apontamentos_producao (tenant_id, ordem_producao_etapa_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_operacao ON apontamentos_producao (tenant_id, operacao_padrao_id);

-- 3. Desvios e Paradas de Produção
CREATE TABLE IF NOT EXISTS desvios_producao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  ordem_producao_etapa_id uuid NOT NULL REFERENCES ordens_producao_etapas(id) ON DELETE CASCADE,
  celula_id uuid REFERENCES celulas_producao(id) ON DELETE SET NULL,
  colaborador_id uuid REFERENCES colaboradores(id) ON DELETE SET NULL,
  tipo tipo_desvio NOT NULL,
  tempo_parado_segundos numeric CHECK (tempo_parado_segundos >= 0),
  observacao text,
  registrado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_desvios_tenant_data ON desvios_producao (tenant_id, registrado_em DESC);
CREATE INDEX IF NOT EXISTS idx_desvios_celula_data ON desvios_producao (tenant_id, celula_id, registrado_em DESC);
CREATE INDEX IF NOT EXISTS idx_desvios_colab_data ON desvios_producao (tenant_id, colaborador_id, registrado_em DESC);
