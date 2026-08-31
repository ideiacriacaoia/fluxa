-- ==============================================================================
-- 06. TRIGGERS E REGRAS DE NEGÓCIO AUTOMATIZADAS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TRIGGER: Auto-entrada no Ledger ao Inserir Lote de Recebimento
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_lote_recebimento_entrada()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO estoque_movimentacoes (
    tenant_id,
    deposito_id,
    lote_id,
    tipo,
    origem,
    quantidade,
    unidade,
    referencia_id,
    observacao
  ) VALUES (
    NEW.tenant_id,
    NEW.deposito_id,
    NEW.id,
    'entrada',
    'recebimento_compra',
    NEW.quantidade_recebida,
    NEW.unidade,
    NEW.id,
    'Entrada automática gerada pelo recebimento do lote ' || NEW.codigo_lote || ' (NF: ' || COALESCE(NEW.nota_fiscal, 'S/N') || ')'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lotes_recebimento_after_insert ON lotes_recebimento;
CREATE TRIGGER trg_lotes_recebimento_after_insert
AFTER INSERT ON lotes_recebimento
FOR EACH ROW EXECUTE FUNCTION fn_trg_lote_recebimento_entrada();


-- ------------------------------------------------------------------------------
-- 2. TRIGGER: Validação de Saldo Negativo (BEFORE INSERT em estoque_movimentacoes)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_validar_saldo_estoque()
RETURNS TRIGGER AS $$
DECLARE
  v_permite_negativo boolean;
  v_saldo_atual numeric;
BEGIN
  -- Apenas valida quando for saída
  IF NEW.tipo = 'saida' THEN
    SELECT permite_saldo_negativo INTO v_permite_negativo
    FROM depositos
    WHERE id = NEW.deposito_id AND tenant_id = NEW.tenant_id;

    IF NOT COALESCE(v_permite_negativo, false) THEN
      IF NEW.lote_id IS NOT NULL THEN
        SELECT COALESCE(saldo, 0) INTO v_saldo_atual
        FROM estoque_saldo_atual
        WHERE tenant_id = NEW.tenant_id 
          AND deposito_id = NEW.deposito_id 
          AND lote_id = NEW.lote_id;
      ELSIF NEW.produto_id IS NOT NULL AND NEW.grade_id IS NOT NULL THEN
        SELECT COALESCE(saldo, 0) INTO v_saldo_atual
        FROM estoque_saldo_atual
        WHERE tenant_id = NEW.tenant_id 
          AND deposito_id = NEW.deposito_id 
          AND produto_id = NEW.produto_id 
          AND grade_id = NEW.grade_id;
      ELSE
        v_saldo_atual := 0;
      END IF;

      IF (COALESCE(v_saldo_atual, 0) - NEW.quantidade) < 0 THEN
        RAISE EXCEPTION 'Operação bloqueada: Saldo insuficiente no depósito (Saldo atual: %, Quantidade solicitada: %). Depósito não permite saldo negativo.',
          COALESCE(v_saldo_atual, 0), NEW.quantidade;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_estoque_movimentacoes_before_insert ON estoque_movimentacoes;
CREATE TRIGGER trg_estoque_movimentacoes_before_insert
BEFORE INSERT ON estoque_movimentacoes
FOR EACH ROW EXECUTE FUNCTION fn_trg_validar_saldo_estoque();


-- ------------------------------------------------------------------------------
-- 3. TRIGGER: Conclusão da Etapa de Acabamento -> Entrada em Produto Acabado
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_concluir_acabamento_op()
RETURNS TRIGGER AS $$
DECLARE
  v_op record;
  v_deposito_pa_id uuid;
  v_total_produzido integer;
BEGIN
  IF NEW.etapa = 'acabamento' AND NEW.status = 'concluida' AND (OLD.status IS DISTINCT FROM 'concluida') THEN
    SELECT * INTO v_op FROM ordens_producao WHERE id = NEW.ordem_producao_id;
    
    -- Busca depósito de produto acabado padrão
    SELECT id INTO v_deposito_pa_id 
    FROM depositos 
    WHERE tenant_id = NEW.tenant_id AND tipo = 'produto_acabado' 
    LIMIT 1;

    -- Soma quantidade total apontada na etapa
    SELECT COALESCE(SUM(quantidade_produzida), v_op.quantidade_planejada) INTO v_total_produzido
    FROM ordens_producao_apontamentos
    WHERE ordem_producao_etapa_id = NEW.id;

    IF v_deposito_pa_id IS NOT NULL AND v_total_produzido > 0 THEN
      INSERT INTO estoque_movimentacoes (
        tenant_id,
        deposito_id,
        produto_id,
        tipo,
        origem,
        quantidade,
        unidade,
        referencia_id,
        observacao
      ) VALUES (
        NEW.tenant_id,
        v_deposito_pa_id,
        v_op.produto_id,
        'entrada',
        'entrada_producao',
        v_total_produzido,
        'un',
        v_op.id,
        'Entrada de produto acabado gerada pela conclusão da OP #' || v_op.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_op_etapa_acabamento ON ordens_producao_etapas;
CREATE TRIGGER trg_op_etapa_acabamento
AFTER UPDATE ON ordens_producao_etapas
FOR EACH ROW EXECUTE FUNCTION fn_trg_concluir_acabamento_op();
