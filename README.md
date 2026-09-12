# 🧵 Fluxa Têxtil — ERP Especializado para Indústria Têxtil e Confecção

> *"Do fio ao produto acabado, sem planilha paralela."*

O **Fluxa Têxtil** é um ERP vertical *cloud-native* e *multi-tenant* de alta performance, projetado especificamente para as necessidades operacionais e fiscais de confecções e indústrias têxteis brasileiras de pequeno e médio porte.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend & SSR** | [Next.js 15](https://nextjs.org/) (App Router) | Renderização híbrida, Server Actions e alta velocidade |
| **Linguagem & UI** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Tipagem estrita de ponta a ponta e interfaces modulares |
| **Estilização & Theming** | [Tailwind CSS](https://tailwindcss.com/) | 4 temas dinâmicos (*Padrão*, *Dark Night*, *Tokyo Night*, *Idéia*) |
| **Ícones & Gráficos** | [Lucide React](https://lucide.dev/) & [Recharts](https://recharts.org/) | Dashboards executivos com KPIs visuais em tempo real |
| **Banco de Dados & Auth** | [PostgreSQL](https://www.postgresql.org/) / [Supabase](https://supabase.com/) | Multi-tenancy com RLS (Row-Level Security) e triggers transacionais |
| **Validação de Dados** | [Zod](https://zod.dev/) | Schemas de validação estrita para dados de entrada e fiscais |

---

## 📦 Módulos do Sistema

### 1. 📊 Dashboard Executivo & Setorial (`/`)
- **Sub-abas por Setor:** Visão segmentada entre **Compras**, **Comercial** e **Produção**.
- **KPIs 2x2 Dinâmicos:**
  - *Compras:* Prazo Médio Real vs Negociado, Saving Realizado, Dependência de Fornecedor e TCO.
  - *Comercial:* Faturamento Realizado vs Meta, Ticket Médio, Margem Bruta e Taxa de Conversão.
  - *Produção:* OEE Global, Lead Time Médio, Índice de Retrabalho/2ª Qualidade e Aderência ao PCP.
- **Leitura Executiva em Síntese:** Diagnóstico textual interpretativo gerado dinamicamente no rodapé.

### 2. 🛒 Compras & Cotações Multi-Fornecedor (`/compras`)
- **Gestão de Pedidos de Compra:** Controle por estágios (*Rascunho, Cotação, Aprovado, Parcial, Recebido*).
- **Cotações Inteligentes (`/compras/cotacoes`):** Matriz de menor preço, histórico de cotações, alçadas de aprovação e disparador integrado de solicitações via WhatsApp.
- **Central Fiscal NFe (`/compras/fiscal`):** Validador de CNPJ Alfanumérico da Receita Federal (RFB), conferência de chaves de 44 dígitos e vínculo com estoques.
- **Recebimento de Mercadorias (`/compras/recebimento`):** Conferência de largura (m), gramatura real (g/m²) e pesagem (kg) com cálculo automático de rendimento e geração de lotes.

### 3. 🏭 PCP, Chão de Fábrica & Personalização (`/producao`)
- **Kanban de Produção:** Fluxo de 5 fases (*Planejada, Corte & Risco, Costura/Facção, Acabamento, Concluída*).
- **Apontamentos em Tempo Real:** Registro de operadores, tempos de máquina, desvios e controle de peças de 2ª qualidade.
- **Ordens de Serviço de Personalização (`/producao/personalizacao`):** Fluxo para peças prontas (peça base + bordado, silk, tags, etiquetas) com decomposição automática de custos compostos e margem comercial.

### 4. 📦 Estoque, Almoxarifado & Lotes (`/estoque`)
- **Multi-Depósitos:** Almoxarifado de Matéria-Prima, WIP Chão de Fábrica, Facções Externas e Produto Acabado.
- **Rastreabilidade Ponta a Ponta (`/estoque/lotes`):** Árvore genealógica completa: *NF de Entrada $\rightarrow$ Lote $\rightarrow$ OPs $\rightarrow$ Peças Finalizadas*.
- **Livro Razão (Ledger) (`/estoque/movimentacoes`):** Registro imutável de todas as transações com bloqueio rigoroso de saldo negativo.
- **Aproveitamento de Retalhos (`/estoque/retalhos`):** Cadastro e reaproveitamento sustentável de sobras de corte.

### 5. 👗 Engenharia de Produto & Ficha Técnica (`/produtos`)
- **Catálogo de Produtos & Grades:** Matriz de variantes por Cor e Tamanho (P, M, G, GG).
- **Ficha Técnica Versionada (`/produtos/ficha-tecnica`):** Consumo líquido de tecidos, quebra/perda percentual de corte, aviamentos, tempo de costura e apuração de custo padrão.

### 6. 👥 Controle de Usuários, Papéis & Tarefas (`/cadastros`)
- **Gestão de Pendências & Tarefas (`/cadastros/pendencias`):** Delegação de tarefas entre setores, prazos limites e histórico de auditoria de encerramento.
- **Gestão de Usuários & Permissões (`/cadastros/usuarios`):** Matriz granular de permissões por papel têxtil (*Diretor, PCP, Comprador, Estoquista, Cortador, Costureiro*).

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- **Node.js:** Versão 18.18+ ou 20+ instalada
- **NPM / PNPM / Yarn**

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU-USUARIO/fluxa-textil.git
cd fluxa-textil

# 2. Instalar as dependências
npm install

# 3. Configurar as variáveis de ambiente
cp .env.example .env.local
# Preencha o .env.local com suas credenciais do Supabase (URL e Anon Key)

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🗄️ Banco de Dados & Migrações SQL

As migrações do banco de dados estão versionadas na pasta `supabase/migrations/`:

```
supabase/
  ├── migrations/
  │   ├── 01_cadastros_base.sql
  │   ├── 02_produtos_fichas.sql
  │   ├── 03_compras.sql
  │   ├── 04_estoque_ledger.sql
  │   ├── 05_producao_pcp.sql
  │   ├── 06_triggers_business_rules.sql
  │   ├── 07_rls_policies.sql
  │   ├── 08_chao_de_fabrica.sql
  │   ├── ...
  │   └── 16_compras_fiscal_whatsapp_personalizacao.sql
  └── seed.sql
```

Para aplicar no seu projeto Supabase:
1. Acesse o **SQL Editor** no painel do Supabase.
2. Execute os scripts em ordem sequencial (`01` a `16`).
3. (Opcional) Execute `seed.sql` para carregar dados de demonstração.

---

## 🌐 Publicação em Produção (Deploy)

A arquitetura do Fluxa Têxtil foi projetada para hospedagem com **zero atrito**:

### 1. Frontend & API (Next.js 15) na **Vercel**
1. Conecte sua conta do GitHub à [Vercel](https://vercel.com/).
2. Importe o repositório `fluxa-textil`.
3. Configure as variáveis de ambiente em **Project Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Clique em **Deploy**. A cada push na branch `main`, a Vercel executará o build de produção automaticamente.

### 2. Banco de Dados no **Supabase Cloud**
- Utilize o plano gratuito ou Pro do [Supabase](https://supabase.com/) com PostgreSQL gerenciado e backups automáticos.

---

## 🌿 Estrutura de Branches

- `main`: Código estável, testado e pronto para deploy automático em produção.
- `dev`: Branch de integração para desenvolvimento contínuo de novas funcionalidades.

---

## 📄 Licença

Projeto desenvolvido para uso corporativo e gestão industrial têxtil. Todos os direitos reservados.

