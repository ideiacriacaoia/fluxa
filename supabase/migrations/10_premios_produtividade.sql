-- ==============================================================================
-- FLUXA TÊXTIL — FASE 2: PRÊMIO POR PRODUTIVIDADE & SNAPSHOT AUDITÁVEL (10_premios_produtividade.sql)
-- ==============================================================================

-- 1. Regras de Prêmio por Faixa de Eficiência
CREATE TABLE IF NOT EXISTS regras_premio_produtividade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  eficiencia_minima_percentual numeric NOT NULL CHECK (eficiencia_minima_percentual >= 0),
  valor_premio_por_peca numeric NOT NULL CHECK (valor_premio_por_peca >= 0),
  vigente_desde date NOT NULL DEFAULT current_date,
  vigente_ate date,
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regras_premio_tenant ON regras_premio_produtividade (tenant_id, ativa, vigente_desde);

-- 2. Snapshot Auditável e Imutável de Prêmios Calculados
CREATE TABLE IF NOT EXISTS premios_calculados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
  periodo_inicio date NOT NULL,
  periodo_fim date NOT NULL,
  eficiencia_media_percentual numeric NOT NULL,
  regra_aplicada_id uuid NOT NULL REFERENCES regras_premio_produtividade(id) ON DELETE RESTRICT,
  valor_total_premio numeric NOT NULL CHECK (valor_total_premio >= 0),
  premio_anterior_id uuid REFERENCES premios_calculados(id),
  motivo_retificacao text,
  calculado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_premios_tenant_colab ON premios_calculados (tenant_id, colaborador_id, periodo_inicio, periodo_fim);

-- 3. Trigger de Imutabilidade Estrita: Impede UPDATE e DELETE em premios_calculados
CREATE OR REPLACE FUNCTION fn_trg_bloquear_mutacao_premios()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'A tabela premios_calculados e imutavel para fins de auditoria e conformidade trabalhista. Retificacoes devem ser inseridas como novos registros referenciando o premio_anterior_id.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bloquear_mutacao_premios ON premios_calculados;
CREATE TRIGGER trg_bloquear_mutacao_premios
  BEFORE UPDATE OR DELETE ON premios_calculados
  FOR EACH ROW
  EXECUTE FUNCTION fn_trg_bloquear_mutacao_premios();
