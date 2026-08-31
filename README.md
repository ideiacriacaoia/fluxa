# Fluxa Têxtil — ERP para Indústria Têxtil e Confecção

> "Do fio ao produto acabado, sem planilha paralela."

O **Fluxa Têxtil** é um ERP vertical *cloud-native* e *multi-tenant* construído especificamente para confecções e indústrias têxteis de pequeno e médio porte no Brasil.

---

## 🛠️ Stack Tecnológica

- **Frontend & API:** Next.js 15 (App Router, Server Actions) + React 19 + TypeScript
- **Estilização:** Tailwind CSS + Lucide Icons + Recharts
- **Banco de Dados & Auth:** PostgreSQL / Supabase com isolamento Multi-tenant (RLS)
- **Validações:** Zod

---

## 📦 Módulos Implementados (Fase 1)

1. **Dashboard & KPIs Têxteis (`/`)**:
   - Visão consolidada de saldo de tecidos (kg/metros) e aviamentos.
   - OPs ativas no chão de fábrica e status por estágio.
   - Rendimento e valor estimado em estoque.

2. **Compras & Insumos (`/compras`)**:
   - Emissão e gestão de Pedidos de Compra de tecidos e aviamentos.
   - Status: Rascunho, Cotação, Aprovado, Parcial e Recebido.

3. **Recebimento de Mercadorias & Geração de Lotes (`/compras/recebimento`)**:
   - Conferência física de tecido: Largura real medida (m), Gramatura real (g/m²) e Quantidade pesada (kg).
   - Cálculo automático de rendimento: \( \text{Rendimento (m/kg)} = \frac{1000}{\text{Gramatura} \times \text{Largura}} \).
   - Geração de código de lote rastreável vinculado à NF de entrada.
   - Entrada transacional automática no depósito e gravação no Ledger de movimentações.

4. **Estoque & Almoxarifado Multi-depósito (`/estoque`)**:
   - Visão por depósito (Almoxarifado MP, WIP Chão de Fábrica, Facção, Produto Acabado).
   - Bloqueio rigoroso de saldo negativo sem flag autorizada.
   - Ajustes de inventário com justificativa obrigatória para auditoria.

5. **Rastreabilidade de Lotes (`/estoque/lotes`)**:
   - Árvore de rastreabilidade ponta a ponta: NF de entrada $\rightarrow$ Lote $\rightarrow$ OPs $\rightarrow$ Peças finalizadas.

6. **Auditoria / Ledger de Movimentações (`/estoque/movimentacoes`)**:
   - Registro imutável de todas as movimentações (entradas por compra, consumos de OP, ajustes e transferências).

7. **Engenharia de Produto & Grades (`/produtos`)**:
   - Catálogo de produtos acabados com matriz de grade (Cor x Tamanho: P, M, G, GG).
   - Gestão de SKUs e estoques mínimos.

8. **Editor de Ficha Técnica Versionada (`/produtos/ficha-tecnica`)**:
   - Consumo líquido de tecidos por peça + margem de perda no corte.
   - Lista de aviamentos e mão de obra por peça.
   - Apuração do custo padrão e margem bruta sobre o preço de venda.

9. **PCP & Apontamentos em Tempo Real (`/producao`)**:
   - Quadro Kanban: Planejada $\rightarrow$ Em Corte $\rightarrow$ Em Costura/Facção $\rightarrow$ Acabamento $\rightarrow$ Finalizada.
   - Abertura de OP com explosão de materiais e reserva de lote de tecido.
   - Apontamento de chão de fábrica com registro de operador, facção, tempo e peças de 2ª qualidade.

10. **Cadastros Base (`/cadastros`)**:
    - Fornecedores e Facções (`/cadastros/fornecedores`)
    - Catálogo de Insumos & Malhas (`/cadastros/insumos`)
    - Depósitos & Almoxarifados (`/cadastros/depositos`)

---

## 🚀 Como Executar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Build de produção
npm run build
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.
