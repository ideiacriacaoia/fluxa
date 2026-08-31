-- ==============================================================================
-- FLUXA TÊXTIL — FASE 2: POLÍTICAS DE SEGURANÇA RLS MULTI-TENANT (13_fase2_rls_policies.sql)
-- ==============================================================================

-- 1. Habilitar RLS em todas as tabelas da Fase 2
ALTER TABLE celulas_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE operacoes_padrao ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_operacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE apontamentos_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE desvios_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE regras_premio_produtividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE premios_calculados ENABLE ROW LEVEL SECURITY;
ALTER TABLE remessas_faccao ENABLE ROW LEVEL SECURITY;
ALTER TABLE glosas_faccao ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Isolamento por Tenant (current_tenant_id)
DROP POLICY IF EXISTS p_celulas_tenant ON celulas_producao;
CREATE POLICY p_celulas_tenant ON celulas_producao
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS p_colaboradores_tenant ON colaboradores;
CREATE POLICY p_colaboradores_tenant ON colaboradores
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS p_operacoes_tenant ON operacoes_padrao;
CREATE POLICY p_operacoes_tenant ON operacoes_padrao
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS p_produto_operacoes_tenant ON produto_operacoes;
CREATE POLICY p_produto_operacoes_tenant ON produto_operacoes
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS p_apontamentos_tenant ON apontamentos_producao;
CREATE POLICY p_apontamentos_tenant ON apontamentos_producao
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS p_desvios_tenant ON desvios_producao;
CREATE POLICY p_desvios_tenant ON desvios_producao
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS p_regras_premio_tenant ON regras_premio_produtividade;
CREATE POLICY p_regras_premio_tenant ON regras_premio_produtividade
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS p_premios_calculados_tenant ON premios_calculados;
CREATE POLICY p_premios_calculados_tenant ON premios_calculados
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS p_remessas_faccao_tenant ON remessas_faccao;
CREATE POLICY p_remessas_faccao_tenant ON remessas_faccao
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS p_glosas_faccao_tenant ON glosas_faccao;
CREATE POLICY p_glosas_faccao_tenant ON glosas_faccao
  FOR ALL USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());
