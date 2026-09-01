-- ==============================================================================
-- FLUXA TÊXTIL — USUÁRIOS, PAPÉIS & PERMISSÕES GRANULARES (14_usuarios_permissoes.sql)
-- ==============================================================================

-- 1. Enums de Módulos e Níveis de Acesso
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'modulo_sistema') THEN
    CREATE TYPE modulo_sistema AS ENUM (
      'compras',
      'estoque',
      'fichas_tecnicas',
      'pcp_producao',
      'vendas',
      'financeiro',
      'cadastros_base',
      'usuarios_permissoes'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivel_permissao') THEN
    CREATE TYPE nivel_permissao AS ENUM (
      'nenhum',
      'visualizar',
      'editar',
      'administrar'
    );
  END IF;
END$$;

-- 2. Tabela de Papéis (Perfis Padrão e Customizados)
CREATE TABLE IF NOT EXISTS papeis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  nome text NOT NULL,
  descricao text,
  is_sistema boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT uq_papel_tenant_nome UNIQUE (tenant_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_papeis_tenant ON papeis (tenant_id);

-- 3. Permissões por Papel (Matriz Base)
CREATE TABLE IF NOT EXISTS papel_permissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  papel_id uuid NOT NULL REFERENCES papeis(id) ON DELETE CASCADE,
  modulo modulo_sistema NOT NULL,
  nivel_acesso nivel_permissao NOT NULL DEFAULT 'nenhum',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT uq_papel_modulo UNIQUE (tenant_id, papel_id, modulo)
);

CREATE INDEX IF NOT EXISTS idx_papel_permissoes_lookup ON papel_permissoes (tenant_id, papel_id, modulo);

-- 4. Tabela de Usuários / Perfis (Vinculada ao auth.users e ao tenant)
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  nome text NOT NULL,
  email text NOT NULL,
  papel_id uuid REFERENCES papeis(id) ON DELETE RESTRICT,
  cargo text,
  ativo boolean NOT NULL DEFAULT true,
  ultimo_acesso timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT uq_usuario_tenant_email UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_tenant_status ON usuarios (tenant_id, ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);

-- 5. Exceções de Permissões por Usuário (Sobrescreve o Papel Base)
CREATE TABLE IF NOT EXISTS usuario_permissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo modulo_sistema NOT NULL,
  nivel_acesso nivel_permissao NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT uq_usuario_modulo UNIQUE (tenant_id, usuario_id, modulo)
);

CREATE INDEX IF NOT EXISTS idx_usuario_permissoes_lookup ON usuario_permissoes (tenant_id, usuario_id, modulo);

-- 6. Auditoria de Alterações de Permissão e Acesso
CREATE TABLE IF NOT EXISTS auditoria_permissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  usuario_alterado_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  alterado_por_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo_alteracao text NOT NULL,
  detalhes jsonb NOT NULL,
  registrado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_permissoes_tenant ON auditoria_permissoes (tenant_id, usuario_alterado_id, registrado_em DESC);
