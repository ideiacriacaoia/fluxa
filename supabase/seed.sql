-- ==============================================================================
-- FLUXA TÊXTIL — DADOS DE SEED REALISTAS (Fase 1 - Schema Oficial)
-- ==============================================================================

-- 1. TENANT DEMO ID
-- Usaremos 'e1111111-1111-1111-1111-111111111111' como tenant_id da fábrica modelo

-- 2. FORNECEDORES
INSERT INTO fornecedores (id, tenant_id, nome, tipo, documento, contato_nome, contato_telefone, contato_email, ativo)
VALUES 
  ('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Têxtil Blumenau S/A', 'tecido', '88.123.456/0001-10', 'Carlos Eduardo', '(47) 3333-5500', 'vendas@textilblumenau.com.br', true),
  ('f2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Aviamentos Santa Catarina Ltda', 'aviamento', '77.654.321/0001-22', 'Ana Paula', '(47) 3251-8800', 'comercial@aviamentossc.com.br', true),
  ('f3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'Facção de Costura Silva', 'faccao', '19.876.543/0001-99', 'Sebastião Silva', '(47) 9988-1234', 'faccao.silva@gmail.com', true)
ON CONFLICT (id) DO NOTHING;

-- 3. DEPÓSITOS
INSERT INTO depositos (id, tenant_id, nome, tipo, permite_saldo_negativo, ativo)
VALUES 
  ('d1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Almoxarifado Matéria-Prima & Tecidos', 'materia_prima', false, true),
  ('d2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Chão de Fábrica (WIP)', 'wip', false, true),
  ('d3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'Expedição / Produto Acabado', 'produto_acabado', false, true),
  ('d4444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'Almoxarifado de Retalhos & Sobras', 'retalho', false, true)
ON CONFLICT (id) DO NOTHING;

-- 4. GRADES (Cor x Tamanho)
INSERT INTO grades (id, tenant_id, cor, tamanho)
VALUES 
  ('g1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Preto', 'P'),
  ('g2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Preto', 'M'),
  ('g3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'Preto', 'G'),
  ('g4444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'Preto', 'GG'),
  ('g5555555-5555-5555-5555-555555555555', 'e1111111-1111-1111-1111-111111111111', 'Branco', 'P'),
  ('g6666666-6666-6666-6666-666666666666', 'e1111111-1111-1111-1111-111111111111', 'Branco', 'M'),
  ('g7777777-7777-7777-7777-777777777777', 'e1111111-1111-1111-1111-111111111111', 'Branco', 'G')
ON CONFLICT DO NOTHING;

-- 5. PRODUTOS
INSERT INTO produtos (id, tenant_id, nome, referencia, categoria, ativo)
VALUES 
  ('p1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Camiseta Masculina Básica 30.1', 'CAM-BASIC-01', 'Camisaria Básica', true),
  ('p2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Camisa Polo Piquet Classic', 'POLO-CLASSIC-02', 'Polos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. FICHAS TÉCNICAS
INSERT INTO fichas_tecnicas (id, tenant_id, produto_id, versao, composicao, gramatura, vigente)
VALUES 
  ('ft111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 1, '100% Algodão Meia Malha Penteada', 165.0, true)
ON CONFLICT DO NOTHING;

INSERT INTO ficha_tecnica_consumo_tecido (tenant_id, ficha_tecnica_id, grade_id, consumo_metros)
VALUES 
  ('e1111111-1111-1111-1111-111111111111', 'ft111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 0.65), -- P
  ('e1111111-1111-1111-1111-111111111111', 'ft111111-1111-1111-1111-111111111111', 'g2222222-2222-2222-2222-222222222222', 0.72), -- M
  ('e1111111-1111-1111-1111-111111111111', 'ft111111-1111-1111-1111-111111111111', 'g3333333-3333-3333-3333-333333333333', 0.78), -- G
  ('e1111111-1111-1111-1111-111111111111', 'ft111111-1111-1111-1111-111111111111', 'g4444444-4444-4444-4444-444444444444', 0.85); -- GG

INSERT INTO ficha_tecnica_aviamentos (tenant_id, ficha_tecnica_id, descricao_aviamento, quantidade, unidade)
VALUES 
  ('e1111111-1111-1111-1111-111111111111', 'ft111111-1111-1111-1111-111111111111', 'Linha de Costura 120 100% Poliéster', 0.05, 'cone'),
  ('e1111111-1111-1111-1111-111111111111', 'ft111111-1111-1111-1111-111111111111', 'Etiqueta de Composição Cetim', 1.00, 'un');

-- 7. PEDIDOS DE COMPRA & LOTES DE RECEBIMENTO
INSERT INTO pedidos_compra (id, tenant_id, fornecedor_id, status, previsao_entrega, observacoes)
VALUES 
  ('pc111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'recebido', '2026-08-16', 'Entrega regular com NF-10492')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pedidos_compra_itens (id, tenant_id, pedido_compra_id, descricao, quantidade, unidade, preco_unitario, cor, largura_tecido)
VALUES 
  ('pci11111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'pc111111-1111-1111-1111-111111111111', 'Meia Malha Penteada 30.1', 250.0, 'kg', 38.50, 'Preto Reativo', 1.82)
ON CONFLICT (id) DO NOTHING;

-- Ao inserir o lote, o trigger fn_trg_lote_recebimento_entrada gera automaticamente a movimentação de entrada no estoque
INSERT INTO lotes_recebimento (id, tenant_id, pedido_compra_item_id, codigo_lote, quantidade_recebida, unidade, cor, largura_tecido, nota_fiscal, data_recebimento, deposito_id)
VALUES 
  ('l1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'pci11111-1111-1111-1111-111111111111', 'LT-2026-MALHA-PT-01', 250.0, 'kg', 'Preto Reativo', 1.82, 'NF-10492', '2026-08-15', 'd1111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- 8. ORDEM DE PRODUÇÃO (PCP)
INSERT INTO ordens_producao (id, tenant_id, produto_id, ficha_tecnica_id, origem, modo_corte, quantidade_planejada, status, data_abertura, data_prevista)
VALUES 
  ('op111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'ft111111-1111-1111-1111-111111111111', 'reposicao_estoque', 'enfesto', 150, 'em_andamento', '2026-08-25', '2026-09-05')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ordens_producao_etapas (id, tenant_id, ordem_producao_id, etapa, tipo_execucao, fornecedor_faccao_id, status, data_inicio)
VALUES 
  ('ope11111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'op111111-1111-1111-1111-111111111111', 'corte', 'interna', null, 'concluida', '2026-08-25'),
  ('ope22222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'op111111-1111-1111-1111-111111111111', 'costura', 'faccao', 'f3333333-3333-3333-3333-333333333333', 'em_andamento', '2026-08-27'),
  ('ope33333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'op111111-1111-1111-1111-111111111111', 'acabamento', 'interna', null, 'planejada', null)
ON CONFLICT DO NOTHING;

-- 9. RETALHO CONTROLADO
INSERT INTO estoque_retalho (id, tenant_id, lote_origem_id, ordem_producao_id, metragem, cor, deposito_id, disponivel)
VALUES 
  ('ret11111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'op111111-1111-1111-1111-111111111111', 12.5, 'Preto Reativo', 'd4444444-4444-4444-4444-444444444444', true)
ON CONFLICT (id) DO NOTHING;
