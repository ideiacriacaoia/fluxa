-- ==============================================================================
-- 01. CADASTROS BASE (Fornecedores, Depósitos e Grades)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE tipo_fornecedor AS ENUM ('tecido', 'aviamento', 'faccao', 'misto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_deposito AS ENUM ('materia_prima', 'retalho', 'wip', 'produto_acabado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA FORNECEDORES
CREATE TABLE IF NOT EXISTS fornecedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  nome text NOT NULL,
  tipo tipo_fornecedor NOT NULL,
  documento text, -- CNPJ/CPF
  contato_nome text,
  contato_telefone text,
  contato_email text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fornecedores_tenant ON fornecedores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_tipo ON fornecedores(tenant_id, tipo);

-- 3. TABELA DEPÓSITOS (Multi-depósito)
CREATE TABLE IF NOT EXISTS depositos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  nome text NOT NULL,
  tipo tipo_deposito NOT NULL,
  permite_saldo_negativo boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_depositos_tenant ON depositos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_depositos_tipo ON depositos(tenant_id, tipo);

-- 4. TABELA GRADES (Cor x Tamanho)
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  cor text NOT NULL,
  tamanho text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, cor, tamanho)
);

CREATE INDEX IF NOT EXISTS idx_grades_tenant ON grades(tenant_id);
