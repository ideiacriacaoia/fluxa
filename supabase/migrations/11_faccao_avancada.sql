-- ==============================================================================
-- FLUXA TÊXTIL — FASE 2: FACÇÃO AVANÇADA, REMESSAS & GLOSAS (11_faccao_avancada.sql)
-- ==============================================================================

-- 1. Enum de Status de Remessa
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_remessa_faccao') THEN
    CREATE TYPE status_remessa_faccao AS ENUM (
      'enviada',
      'recebida_parcial',
      'recebida',
      'atrasada'
    );
  END IF;
END$$;

-- 2. Remessas de Facção (Controle de Envio e Prazo)
CREATE TABLE IF NOT EXISTS remessas_faccao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  ordem_producao_etapa_id uuid NOT NULL REFERENCES ordens_producao_etapas(id) ON DELETE CASCADE,
  fornecedor_faccao_id uuid NOT NULL REFERENCES fornecedores(id) ON DELETE RESTRICT,
  quantidade_enviada integer NOT NULL CHECK (quantidade_enviada > 0),
  quantidade_recebida integer NOT NULL DEFAULT 0 CHECK (quantidade_recebida >= 0),
  data_envio date NOT NULL DEFAULT current_date,
  prazo_devolucao date NOT NULL,
  status status_remessa_faccao NOT NULL DEFAULT 'enviada',
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_remessas_tenant_faccao ON remessas_faccao (tenant_id, fornecedor_faccao_id, status);
CREATE INDEX IF NOT EXISTS idx_remessas_etapa ON remessas_faccao (tenant_id, ordem_producao_etapa_id);
CREATE INDEX IF NOT EXISTS idx_remessas_prazo ON remessas_faccao (tenant_id, prazo_devolucao, status);

-- 3. Glosas de Facção (Diferenças, Defeitos e Descontos)
CREATE TABLE IF NOT EXISTS glosas_faccao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  remessa_faccao_id uuid NOT NULL REFERENCES remessas_faccao(id) ON DELETE CASCADE,
  quantidade_glosada integer NOT NULL CHECK (quantidade_glosada > 0),
  motivo text NOT NULL,
  valor_desconto numeric CHECK (valor_desconto >= 0),
  registrado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_glosas_tenant_remessa ON glosas_faccao (tenant_id, remessa_faccao_id);
