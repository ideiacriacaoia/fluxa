-- ==============================================================================
-- 07. POLÍTICAS DE ROW LEVEL SECURITY (RLS) MULTI-TENANT
-- ==============================================================================

-- 1. FUNÇÃO AUXILIAR PARA EXTRAÇÃO SEGURA DO TENANT_ID
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS uuid AS $$
  SELECT NULLIF(
    COALESCE(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id',
      current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'
    ),
    ''
  )::uuid;
$$ LANGUAGE sql STABLE;

-- 2. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE depositos ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_tecnica_consumo_tecido ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_tecnica_aviamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_compra_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes_recebimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_retalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_producao_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_producao_apontamentos ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS RLS BASEADAS EM TENANT_ID

-- Fornecedores
DROP POLICY IF EXISTS p_fornecedores_tenant ON fornecedores;
CREATE POLICY p_fornecedores_tenant ON fornecedores
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Depósitos
DROP POLICY IF EXISTS p_depositos_tenant ON depositos;
CREATE POLICY p_depositos_tenant ON depositos
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Grades
DROP POLICY IF EXISTS p_grades_tenant ON grades;
CREATE POLICY p_grades_tenant ON grades
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Produtos
DROP POLICY IF EXISTS p_produtos_tenant ON produtos;
CREATE POLICY p_produtos_tenant ON produtos
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Fichas Técnicas
DROP POLICY IF EXISTS p_fichas_tenant ON fichas_tecnicas;
CREATE POLICY p_fichas_tenant ON fichas_tecnicas
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Ficha Consumo Tecido
DROP POLICY IF EXISTS p_consumo_tecido_tenant ON ficha_tecnica_consumo_tecido;
CREATE POLICY p_consumo_tecido_tenant ON ficha_tecnica_consumo_tecido
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Ficha Aviamentos
DROP POLICY IF EXISTS p_aviamentos_tenant ON ficha_tecnica_aviamentos;
CREATE POLICY p_aviamentos_tenant ON ficha_tecnica_aviamentos
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Pedidos de Compra
DROP POLICY IF EXISTS p_pedidos_compra_tenant ON pedidos_compra;
CREATE POLICY p_pedidos_compra_tenant ON pedidos_compra
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Pedidos Compra Itens
DROP POLICY IF EXISTS p_pedidos_itens_tenant ON pedidos_compra_itens;
CREATE POLICY p_pedidos_itens_tenant ON pedidos_compra_itens
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Lotes de Recebimento
DROP POLICY IF EXISTS p_lotes_recebimento_tenant ON lotes_recebimento;
CREATE POLICY p_lotes_recebimento_tenant ON lotes_recebimento
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Estoque Movimentações (Ledger)
DROP POLICY IF EXISTS p_movimentacoes_tenant ON estoque_movimentacoes;
CREATE POLICY p_movimentacoes_tenant ON estoque_movimentacoes
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Estoque Retalho
DROP POLICY IF EXISTS p_retalho_tenant ON estoque_retalho;
CREATE POLICY p_retalho_tenant ON estoque_retalho
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Ordens de Produção
DROP POLICY IF EXISTS p_op_tenant ON ordens_producao;
CREATE POLICY p_op_tenant ON ordens_producao
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Ordens Produção Etapas
DROP POLICY IF EXISTS p_op_etapas_tenant ON ordens_producao_etapas;
CREATE POLICY p_op_etapas_tenant ON ordens_producao_etapas
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Ordens Produção Apontamentos
DROP POLICY IF EXISTS p_op_apontamentos_tenant ON ordens_producao_apontamentos;
CREATE POLICY p_op_apontamentos_tenant ON ordens_producao_apontamentos
  FOR ALL USING (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL);
