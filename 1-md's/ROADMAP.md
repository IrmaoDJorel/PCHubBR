# 🗺️ Roadmap de Desenvolvimento - PCHubBR

## 📌 Visão Geral
Este roadmap detalha as melhorias planejadas para a interface e experiência do usuário do PCHubBR, focando em navegação intuitiva, sistema de ofertas otimizado e páginas dedicadas por categoria de produto.

---

## ✅ FASE 1: Refatoração do Layout (1-2 dias)

### Objetivos
Reorganizar a estrutura visual da aplicação para melhorar usabilidade e navegação.

### Tarefas
- [ ] **1.1** Reorganizar header principal
  - Mover botão "Minha conta" para o lado do toggle "Light/Dark"
  - Criar dropdown de usuário (Perfil, Alertas, Favoritos, Sair)
  - Otimizar espaçamento e responsividade

- [ ] **1.2** Criar navbar de categorias
  - Implementar barra secundária abaixo do header
  - Adicionar links: [Todas as Peças] [CPUs] [GPUs] [Placas-Mãe]
  - Destacar categoria ativa visualmente
  - Garantir responsividade (scroll horizontal no mobile)

- [ ] **1.3** Implementar breadcrumbs (migalhas de pão)
  - Componente reutilizável `<Breadcrumbs />`
  - Exibir em todas as páginas de produtos
  - Formato: Home > CPUs > AMD Ryzen 7 5800X
  - Melhorar SEO e acessibilidade

- [ ] **1.4** Adicionar skeletons de loading
  - Criar componentes `<ProductCardSkeleton />`
  - Implementar loading state consistente
  - Aplicar em listagens e páginas de detalhes

### Arquivos Envolvidos
- `app/layout.tsx` ou `components/Header.tsx`
- `components/ui/breadcrumbs.tsx` (novo)
- `components/ui/skeleton.tsx` (verificar se existe)
- `app/page.tsx` (home)

---

## ✅ FASE 2: Sistema de Ofertas (2-3 dias)

### Objetivos
Implementar cálculo inteligente de ofertas baseado em percentual de desconto e criar página inicial focada nas melhores oportunidades.

### Tarefas
- [ ] **2.1** Atualizar schema do banco de dados
  - Adicionar campos ao modelo `Product` e `Cpu`:
    - `bestPrice` (Decimal?)
    - `worstPrice` (Decimal?)
    - `offerScore` (Decimal?) - Percentual de desconto
    - `lastPriceCheck` (DateTime?)
  - Criar migration do Prisma

- [ ] **2.2** Criar job de cálculo de ofertas
  - Implementar API route `/api/jobs/calculate-offers`
  - Calcular `offerScore = ((maxPrice - minPrice) / maxPrice) * 100`
  - Atualizar cache de preços de todos os produtos
  - Configurar cron job (execução periódica)

- [ ] **2.3** Atualizar página inicial
  - Modificar query para buscar produtos ordenados por `offerScore`
  - Exibir apenas Top 12-20 produtos com melhores ofertas
  - Adicionar filtro "Melhor Oferta" na ordenação

- [ ] **2.4** Melhorias visuais nos cards de produtos
  - Badge de oferta: "🔥 Oferta: -XX%"
  - Indicador visual de economia (ex: "Economize R$ 200")
  - Destaque para melhor preço entre lojas

### Arquivos Envolvidos
- `prisma/schema.prisma`
- `app/api/jobs/calculate-offers/route.ts` (novo)
- `app/page.tsx`
- `components/ProductCard.tsx` ou similar

---

## ✅ FASE 3: Páginas de Categorias (2-3 dias)

### Objetivos
Criar páginas dedicadas para CPUs, GPUs e Placas-Mãe com filtros contextuais específicos.

### Tarefas
- [ ] **3.1** Criar componente genérico de filtros
  - `<FilterSidebar />` reutilizável
  - Suporte a múltiplos tipos de filtros:
    - Checkbox (marcas, sockets)
    - Range slider (preço, cores)
    - Select dropdown
  - Responsivo (drawer lateral no mobile)

- [ ] **3.2** Implementar página de CPUs (`/cpu`)
  - Filtros específicos:
    - Socket (AM4, AM5, LGA1700, LGA1200, etc.)
    - Marca (Intel, AMD)
    - Número de cores (4, 6, 8, 12, 16+)
    - GPU integrada (Sim/Não)
    - Faixa de preço
  - Persistência de filtros na URL (query params)

- [ ] **3.3** Implementar página de GPUs (`/gpu`)
  - Filtros específicos:
    - Marca (NVIDIA, AMD, Intel)
    - Chipset (RTX 4060, RX 7600, etc.)
    - VRAM (4GB, 6GB, 8GB, 12GB, 16GB+)
    - Faixa de preço

- [ ] **3.4** Implementar página de Placas-Mãe (`/motherboard`)
  - Filtros específicos:
    - Socket (AM4, AM5, LGA1700, etc.)
    - Chipset (B550, X670, Z790, etc.)
    - Formato (ATX, Micro-ATX, Mini-ITX)
    - Suporte a RAM (DDR4, DDR5)
    - Faixa de preço

- [ ] **3.5** Sistema de filtros inteligente
  - Contador de resultados por filtro
  - Estado de loading ao aplicar filtros
  - Botão "Limpar filtros"
  - Indicador visual de filtros ativos

### Arquivos Envolvidos
- `components/FilterSidebar.tsx` (novo)
- `app/cpu/page.tsx`
- `app/gpu/page.tsx`
- `app/motherboard/page.tsx`
- `app/api/cpus/route.ts` (atualizar)
- `app/api/products/route.ts` (atualizar)

---

## ✅ FASE 4: Expansão Total do Catálogo (3-5 dias)

### Objetivos
Expandir a base de dados para cobrir todas as categorias essenciais de hardware, transformando o site em um comparador completo.

### Tarefas
- [ ] **4.1** Atualizar schema para novas categorias
  - Implementar modelos no Prisma para:
    - `RAM` (Capacidade, Velocidade, Tipo DDR, Latência)
    - `Storage` (Tipo SSD/HDD, Interface, Capacidade, Leitura/Escrita)
    - `PSU` (Potência, Certificação 80 Plus, Modularidade)
    - `Case` (Formato, Janela Lateral, Cor)
    - `Cooler` (Tipo Air/Water, TDP, Sockets suportados)
  - Executar migrations e atualizar o client do Prisma

- [ ] **4.2** Implementar scrapers para novas categorias
  - Adaptar a lógica de busca de preços para os novos tipos de hardware
  - Mapear atributos específicos de cada loja para o schema interno
  - Garantir a normalização de nomes (ex: "8GB" vs "8 GB")

- [ ] **4.3** Atualizar navegação e filtros globais
  - Adicionar as novas categorias na `<Navbar />` (com scroll horizontal mobile)
  - Criar páginas dinâmicas para cada nova categoria
  - Implementar filtros específicos para RAM (DDR4/DDR5) e SSD (NVMe/SATA)

- [ ] **4.4** Otimização de busca e indexação
  - Melhorar o algoritmo de busca para suportar termos genéricos (ex: "SSD 1TB")
  - Implementar paginação eficiente para categorias com muitos itens

### Arquivos Envolvidos
- `prisma/schema.prisma`
- `components/Navbar.tsx`
- `app/[category]/page.tsx` (rota dinâmica)
- `lib/scrapers/` (novos módulos)

---

## ✅ FASE 5: Sistema de Comparação Lado a Lado (3-4 dias)

### Objetivos
Permitir que o usuário compare as especificações técnicas e preços de até 4 produtos simultaneamente.

### Tarefas
- [ ] **5.1** Criar contexto de comparação (`CompareContext`)
  - Gerenciar estado global de itens selecionados
  - Limite de 4 itens por categoria
  - Persistência temporária em LocalStorage

- [ ] **5.2** Desenvolver interface de seleção
  - Adicionar checkbox/botão "Comparar" nos cards de produto
  - Criar barra flutuante inferior exibindo itens selecionados e botão "Comparar Agora"

- [ ] **5.3** Implementar página de comparação (`/compare`)
  - Tabela comparativa dinâmica destacando diferenças
  - Destaque visual para o melhor preço entre os itens comparados
  - Botões de compra direta para cada item da tabela

### Arquivos Envolvidos
- `context/CompareContext.tsx` (novo)
- `components/CompareBar.tsx` (novo)
- `app/compare/page.tsx` (novo)
- `components/ProductCard.tsx`

---

## ✅ FASE 6: Build de PC Digital & Compatibilidade (5-7 dias)

### Objetivos
Implementar a funcionalidade principal de montagem de computadores com verificação automática de compatibilidade.

### Tarefas
- [ ] **6.1** Motor de compatibilidade (Compatibility Engine)
  - Criar lógica de validação:
    - Socket (CPU vs Placa-Mãe)
    - Tipo de RAM (DDR4 vs DDR5 na Placa-Mãe)
    - Dimensões (Tamanho da GPU vs Espaço no Gabinete)
    - TDP (Consumo total vs Potência da Fonte)

- [ ] **6.2** Interface do Montador de Build
  - Lista de slots (CPU, Cooler, Mobo, RAM, etc.)
  - Fluxo de seleção: ao escolher CPU, filtrar automaticamente Placas-Mãe compatíveis
  - Resumo de preço total do build (melhor preço de cada peça)

- [ ] **6.3** Compartilhamento e Exportação
  - Gerar URL única para cada build (ex: `/build/abc-123`)
  - Opção de exportar lista em Markdown (para fóruns/Reddit) ou PDF

### Arquivos Envolvidos
- `lib/compatibility-engine.ts` (novo)
- `app/build/page.tsx` (novo)
- `app/build/[id]/page.tsx` (novo)
- `components/build/SlotItem.tsx` (novo)

---

## ✅ FASE 7: Assistente de IA e Consultoria (4-5 dias)

### Objetivos
Integrar inteligência artificial para auxiliar usuários na escolha de peças e resolução de dúvidas técnicas.

### Tarefas
- [ ] **7.1** Integração com LLM (OpenAI/Anthropic)
  - Configurar rota de API para streaming de respostas
  - Criar "System Prompt" especializado em hardware e compatibilidade PC Hub BR

- [ ] **7.2** Interface do Chatbot
  - Janela de chat flutuante e página dedicada
  - Sugestão de "Prompts Rápidos" (ex: "Monte um PC de R$ 5000 para edição")

- [ ] **7.3** Recomendações baseadas em dados
  - Permitir que a IA acesse o catálogo de preços em tempo real para sugerir o melhor custo-benefício atual

### Arquivos Envolvidos
- `app/api/chat/route.ts` (novo)
- `components/AiAssistant.tsx` (novo)
- `lib/ai/prompts.ts` (novo)

---

## 📌 Melhorias Futuras (Backlog)

### Sistema de Comparação de Produtos
- [ ] Checkbox de seleção em cada card
- [ ] Barra flutuante: "Comparar (X selecionados)"
- [ ] Página de comparação lado a lado
- [ ] Suporte a comparação entre categorias diferentes

### Alertas de Preço - Melhorias
- [ ] Badge no header: "🔔 2 alertas ativos"
- [ ] Notificações in-app em tempo real
- [ ] Sistema de email automático aprimorado
- [ ] Configurações de frequência de notificação

### Histórico de Visualizações
- [ ] LocalStorage para visitantes anônimos
- [ ] Persistência no banco para usuários logados
- [ ] Seção "Vistos recentemente" na home e perfil
- [ ] Limite de 20 produtos

### Build de PC Digital (Funcionalidade Principal)
- [ ] Sistema de compatibilidade entre peças
- [ ] Verificação de socket CPU/Placa-Mãe
- [ ] Cálculo de consumo energético (TDP)
- [ ] Sugestão de fonte adequada
- [ ] Verificação de clearance de cooler
- [ ] Compartilhamento de builds

### Assistente de IA
- [ ] Chatbot para dúvidas sobre hardware
- [ ] Recomendações personalizadas de produtos
- [ ] Sugestões de upgrades
- [ ] Análise de compatibilidade via chat

### Web Scraping Automatizado
- [ ] Sistema de scraping de lojas parceiras
- [ ] Atualização automática de preços
- [ ] Detecção de novos produtos
- [ ] Histórico de disponibilidade

---

**Última atualização:** Janeiro 2026