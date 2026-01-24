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

## ✅ FASE 4: Melhorias de UX (1-2 dias)

### Objetivos
Polir experiência do usuário com recursos visuais e de usabilidade.

### Tarefas
- [ ] **4.1** Sistema de imagens de produtos
  - Adicionar campos `imageUrl` e `imageThumbnail` ao schema
  - Implementar placeholders (logos de marcas)
  - Otimização com Next.js Image
  - Lazy loading

- [ ] **4.2** Indicadores de tendência de preço
  - Ícones visuais nos cards:
    - 📈 Preço subindo (vermelho)
    - 📉 Preço caindo (verde)
    - ➡️ Preço estável (cinza)
  - Tooltip com informação: "Preço caiu 15% na última semana"

- [ ] **4.3** Otimização mobile
  - Testar e ajustar responsividade de todos os componentes
  - Navbar de categorias com scroll horizontal
  - Filtros em drawer lateral (hamburger menu)
  - Cards responsivos (1 coluna mobile, 2-4 desktop)
  - Melhorar touch targets (botões maiores)

- [ ] **4.4** Estados vazios (Empty States)
  - Mensagens amigáveis quando não há resultados
  - Sugestões de ação (ajustar filtros, voltar)
  - Ilustrações ou ícones

### Arquivos Envolvidos
- `prisma/schema.prisma`
- Todos os componentes de produto
- `globals.css` (ajustes mobile)

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

## 🎯 Prioridades Técnicas

### Performance
- [ ] Implementar ISR (Incremental Static Regeneration) nas páginas de produtos
- [ ] Cache Redis para ofertas e preços
- [ ] Otimização de queries do Prisma (includes, selects)
- [ ] CDN para imagens

### SEO
- [ ] Meta tags dinâmicas por produto
- [ ] Sitemap.xml automático
- [ ] Structured data (JSON-LD) para produtos
- [ ] Canonical URLs

### Acessibilidade
- [ ] Navegação completa por teclado
- [ ] Labels ARIA adequadas
- [ ] Contraste de cores (WCAG AA)
- [ ] Suporte a leitores de tela

### Testes
- [ ] Testes unitários (componentes críticos)
- [ ] Testes de integração (fluxos de usuário)
- [ ] Testes E2E (Playwright/Cypress)

---

## 📊 Métricas de Sucesso

- **Performance:** Tempo de carregamento < 2s
- **Conversão:** Taxa de clique em ofertas > 30%
- **Engajamento:** Usuários criam alertas (> 20% dos visitantes)
- **Retenção:** Retorno de usuários > 40% em 30 dias

---

**Última atualização:** Janeiro 2026