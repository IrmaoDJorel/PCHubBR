# 🗺️ Roadmap de Refatoração - Interface PCHubBR

## 📅 Última atualização: Janeiro 2025

---

## 🎯 Objetivo Geral
Refatorar a interface principal do PCHubBR para melhorar a experiência do usuário, clareza das ofertas e navegação por categorias de produtos (CPUs, GPUs, Placas-Mãe).

---

## ✅ FASE 1: Refatoração do Layout Base
**Estimativa:** 1-2 dias  
**Prioridade:** 🔴 ALTA

### Tarefas:
- [ ] **1.1** Reorganizar header principal
  - Mover botão "Minha conta" para o lado do toggle "Light/Dark"
  - Criar dropdown de usuário (Perfil, Alertas, Favoritos, Sair)
  - Otimizar espaçamento e responsividade mobile

- [ ] **1.2** Criar navbar de categorias secundária
  - Botões: [Todas as Peças] [CPUs] [GPUs] [Placas-Mãe]
  - Indicador visual da página ativa
  - Scroll horizontal no mobile

- [ ] **1.3** Implementar sistema de breadcrumbs
  - Formato: Home > Categoria > Produto
  - Melhorar SEO e navegação
  - Compatível com todas as páginas

- [ ] **1.4** Adicionar skeletons de loading
  - Cards de produtos
  - Gráficos de histórico
  - Transições entre páginas

### Entregáveis:
- Header responsivo e organizado
- Navegação por categorias clara e acessível
- Feedback visual de carregamento consistente

---

## ✅ FASE 2: Sistema de Ofertas Otimizado
**Estimativa:** 2-3 dias  
**Prioridade:** 🔴 ALTA

### Tarefas:
- [ ] **2.1** Adicionar campos de cache ao banco de dados
  - `bestPrice`: Menor preço disponível
  - `worstPrice`: Maior preço disponível
  - `offerScore`: Percentual de desconto calculado
  - `lastPriceCheck`: Timestamp da última atualização

- [ ] **2.2** Criar migration Prisma
```bash
  npx prisma migrate dev --name add_offer_cache_fields