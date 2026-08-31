-- ==============================================================================
-- FLUXA TÊXTIL — FASE 2: VIEWS DE EFICIÊNCIA & GESTÃO À VISTA (12_views_gestao_a_vista.sql)
-- ==============================================================================

-- 1. View de Eficiência por Apontamento Individual
CREATE OR REPLACE VIEW eficiencia_apontamentos AS
SELECT
  ap.id AS apontamento_id,
  ap.tenant_id,
  ap.ordem_producao_etapa_id,
  ap.celula_id,
  ap.colaborador_id,
  ap.operacao_padrao_id,
  ap.quantidade_produzida,
  ap.tempo_gasto_segundos,
  ap.registrado_em,
  op.tempo_padrao_segundos,
  ROUND(
    (op.tempo_padrao_segundos * ap.quantidade_produzida) / NULLIF(ap.tempo_gasto_segundos, 0) * 100, 2
  ) AS eficiencia_percentual
FROM apontamentos_producao ap
JOIN operacoes_padrao op ON op.id = ap.operacao_padrao_id;

-- 2. View Agregada para Painel de Gestão à Vista (TV Chão de Fábrica)
-- Utiliza CTEs pré-agrupadas para garantir exatidão matemática sem produto cartesiano
CREATE OR REPLACE VIEW painel_gestao_a_vista AS
WITH apontamentos_agg AS (
  SELECT
    ap.tenant_id,
    ap.celula_id,
    date_trunc('day', ap.registrado_em) AS dia,
    SUM(ap.quantidade_produzida) AS total_produzido,
    ROUND(AVG(
      (op.tempo_padrao_segundos * ap.quantidade_produzida) / NULLIF(ap.tempo_gasto_segundos, 0) * 100
    ), 2) AS eficiencia_media
  FROM apontamentos_producao ap
  JOIN operacoes_padrao op ON op.id = ap.operacao_padrao_id
  GROUP BY ap.tenant_id, ap.celula_id, date_trunc('day', ap.registrado_em)
),
desvios_agg AS (
  SELECT
    d.tenant_id,
    d.celula_id,
    date_trunc('day', d.registrado_em) AS dia,
    COUNT(d.id) AS total_desvios,
    COALESCE(SUM(d.tempo_parado_segundos), 0) AS tempo_total_parado_segundos
  FROM desvios_producao d
  WHERE d.celula_id IS NOT NULL
  GROUP BY d.tenant_id, d.celula_id, date_trunc('day', d.registrado_em)
)
SELECT
  c.tenant_id,
  c.id AS celula_id,
  c.nome AS celula_nome,
  c.etapa_padrao,
  COALESCE(a.dia, d.dia, date_trunc('day', now())) AS dia,
  COALESCE(a.total_produzido, 0) AS total_produzido,
  COALESCE(a.eficiencia_media, 0) AS eficiencia_media,
  COALESCE(d.total_desvios, 0) AS total_desvios,
  COALESCE(d.tempo_total_parado_segundos, 0) AS tempo_total_parado_segundos
FROM celulas_producao c
LEFT JOIN apontamentos_agg a ON a.celula_id = c.id AND a.tenant_id = c.tenant_id
LEFT JOIN desvios_agg d ON d.celula_id = c.id AND d.tenant_id = c.tenant_id AND d.dia = a.dia;
