-- ==============================================================================
-- FLUXA TÊXTIL — FUNÇÕES DE AUTORIZAÇÃO E RLS GRANULAR (15_funcoes_rls_permissoes.sql)
-- ==============================================================================

-- 1. Função Auxiliar: Obter o ID do Usuário Logado
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), '')::uuid,
    (auth.jwt() ->> 'sub')::uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Função de Validação de Permissão Hierárquica por Módulo
CREATE OR REPLACE FUNCTION fn_has_permission(
  p_modulo modulo_sistema,
  p_nivel_minimo nivel_permissao
)
RETURNS boolean AS $$
DECLARE
  v_user_id uuid;
  v_ativo boolean;
  v_nivel_usuario nivel_permissao;
  v_peso_usuario integer;
  v_peso_minimo integer;
BEGIN
  v_user_id := current_user_id();
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Verificar se usuário existe e está ativo no tenant
  SELECT u.ativo INTO v_ativo
  FROM usuarios u
  WHERE u.id = v_user_id AND u.tenant_id = current_tenant_id();

  IF v_ativo IS NOT TRUE THEN
    RETURN false;
  END IF;

  -- 2. Buscar primeiro em usuario_permissoes (exceção específica)
  SELECT up.nivel_acesso INTO v_nivel_usuario
  FROM usuario_permissoes up
  WHERE up.usuario_id = v_user_id 
    AND up.tenant_id = current_tenant_id()
    AND up.modulo = p_modulo;

  -- 3. Se não houver exceção, buscar no papel_permissoes do papel do usuário
  IF v_nivel_usuario IS NULL THEN
    SELECT pp.nivel_acesso INTO v_nivel_usuario
    FROM usuarios u
    JOIN papel_permissoes pp ON pp.papel_id = u.papel_id AND pp.tenant_id = u.tenant_id
    WHERE u.id = v_user_id 
      AND u.tenant_id = current_tenant_id()
      AND pp.modulo = p_modulo;
  END IF;

  IF v_nivel_usuario IS NULL THEN
    v_nivel_usuario := 'nenhum';
  END IF;

  -- 4. Avaliação hierárquica (administrar: 3, editar: 2, visualizar: 1, nenhum: 0)
  v_peso_usuario := CASE v_nivel_usuario
    WHEN 'administrar' THEN 3
    WHEN 'editar' THEN 2
    WHEN 'visualizar' THEN 1
    ELSE 0
  END;

  v_peso_minimo := CASE p_nivel_minimo
    WHEN 'administrar' THEN 3
    WHEN 'editar' THEN 2
    WHEN 'visualizar' THEN 1
    ELSE 0
  END;

  RETURN v_peso_usuario >= v_peso_minimo;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Habilitação de RLS nas Tabelas de Gestão de Usuários
ALTER TABLE papeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE papel_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_permissoes ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
DROP POLICY IF EXISTS p_papeis_select ON papeis;
CREATE POLICY p_papeis_select ON papeis FOR SELECT
  USING (tenant_id = current_tenant_id() AND (fn_has_permission('cadastros_base', 'visualizar') OR fn_has_permission('usuarios_permissoes', 'visualizar')));

DROP POLICY IF EXISTS p_papeis_all ON papeis;
CREATE POLICY p_papeis_all ON papeis FOR ALL
  USING (tenant_id = current_tenant_id() AND fn_has_permission('usuarios_permissoes', 'administrar'))
  WITH CHECK (tenant_id = current_tenant_id() AND fn_has_permission('usuarios_permissoes', 'administrar'));

DROP POLICY IF EXISTS p_papel_permissoes_select ON papel_permissoes;
CREATE POLICY p_papel_permissoes_select ON papel_permissoes FOR SELECT
  USING (tenant_id = current_tenant_id() AND (fn_has_permission('cadastros_base', 'visualizar') OR fn_has_permission('usuarios_permissoes', 'visualizar')));

DROP POLICY IF EXISTS p_papel_permissoes_all ON papel_permissoes;
CREATE POLICY p_papel_permissoes_all ON papel_permissoes FOR ALL
  USING (tenant_id = current_tenant_id() AND fn_has_permission('usuarios_permissoes', 'administrar'))
  WITH CHECK (tenant_id = current_tenant_id() AND fn_has_permission('usuarios_permissoes', 'administrar'));

DROP POLICY IF EXISTS p_usuarios_select ON usuarios;
CREATE POLICY p_usuarios_select ON usuarios FOR SELECT
  USING (tenant_id = current_tenant_id() AND (id = current_user_id() OR fn_has_permission('usuarios_permissoes', 'visualizar')));

DROP POLICY IF EXISTS p_usuarios_modify ON usuarios;
CREATE POLICY p_usuarios_modify ON usuarios FOR ALL
  USING (tenant_id = current_tenant_id() AND fn_has_permission('usuarios_permissoes', 'administrar'))
  WITH CHECK (tenant_id = current_tenant_id() AND fn_has_permission('usuarios_permissoes', 'administrar'));

DROP POLICY IF EXISTS p_usuario_permissoes_select ON usuario_permissoes;
CREATE POLICY p_usuario_permissoes_select ON usuario_permissoes FOR SELECT
  USING (tenant_id = current_tenant_id() AND (usuario_id = current_user_id() OR fn_has_permission('usuarios_permissoes', 'visualizar')));

DROP POLICY IF EXISTS p_usuario_permissoes_all ON usuario_permissoes;
CREATE POLICY p_usuario_permissoes_all ON usuario_permissoes FOR ALL
  USING (tenant_id = current_tenant_id() AND fn_has_permission('usuarios_permissoes', 'administrar'))
  WITH CHECK (tenant_id = current_tenant_id() AND fn_has_permission('usuarios_permissoes', 'administrar'));

DROP POLICY IF EXISTS p_auditoria_permissoes_select ON auditoria_permissoes;
CREATE POLICY p_auditoria_permissoes_select ON auditoria_permissoes FOR SELECT
  USING (tenant_id = current_tenant_id() AND fn_has_permission('usuarios_permissoes', 'visualizar'));

DROP POLICY IF EXISTS p_auditoria_permissoes_insert ON auditoria_permissoes;
CREATE POLICY p_auditoria_permissoes_insert ON auditoria_permissoes FOR INSERT
  WITH CHECK (tenant_id = current_tenant_id());
