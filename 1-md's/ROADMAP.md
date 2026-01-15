## 🧱 Fase 0 (Dia 0) — “Fundação” do PCHubBR (do zero absoluto)

A **Fase 0** existe para você **não se perder** e **não refazer tudo** depois. Aqui você **não está “construindo features”** ainda; você está criando a base: projeto, padrões, decisões mínimas e organização.

> Objetivo da Fase 0: no final, você tem um repositório organizado, o site rodando localmente, e decisões técnicas mínimas documentadas para começar a Fase 1 sem bagunça.

---

## ✅ 0.1) Definir o “MVP em 1 frase” (para guiar todas as decisões)
Escreva no seu `ROADMAP.md`:

- **MVP do PCHubBR:** “Um site para pesquisar CPUs e ver **preço atual + histórico de preço por loja**, com links de afiliado.”

Isso serve como “bússola”: se algo não ajuda essa frase, **fica para depois**.

---

## ✅ 0.2) Estrutura do projeto (como organizar as pastas)
Você vai usar **Next.js + Node**. Na prática, você tem duas opções:

### Opção A — **Um único projeto Next.js** (recomendado para começar do zero)
- Você cria **um único app** e usa:
  - **poucas páginas** (UI)
  - **API Routes** do Next (para endpoints simples)
  - scripts separados para tarefas internas (crawler depois)

**Por que eu recomendo agora?**
- Menos decisões
- Menos configuração
- Você começa a ver o site “existir” rápido

### Opção B — Monorepo (mais “adulto”, mas pode esperar)
Monorepo é “vários projetos dentro do mesmo repositório” (ex.: site + crawler + libs).  
É ótimo, mas você não precisa disso **na Fase 0** se ainda está iniciando.

> Decisão para hoje (Fase 0): **Opção A (1 projeto Next.js)**. Monorepo pode virar uma **Fase 2.5** quando o crawler crescer.

---

## ✅ 0.3) Criar o repositório e padronizar “o básico”
### Checklist
1. **Criar repositório Git**
   - Nome sugerido do repo: **`pchubbr`** (simples e sem variações)

2. **Criar projeto Next.js**
   - Resultado: você consegue rodar `npm run dev` e abrir o site.

3. **Padronizar formatação e qualidade**
   - **ESLint** (verifica padrões/erros no código)
   - **Prettier** (formata automaticamente)

4. **Criar arquivos de organização**
   - `ROADMAP.md` (fases, objetivo, decisões)
   - `GLOSSARIO.md` (toda palavra nova entra aqui)
   - `DECISOES.md` (decisões curtas: “banco = Postgres”, “preço em centavos”, etc.)

> Esses 3 arquivos viram seu “cérebro externo”. Isso faz muita diferença quando o projeto cresce.

---

## ✅ 0.4) Decisões técnicas mínimas (sem overengineering)
Aqui você decide coisas que afetam tudo depois.

### 0.4.1) Banco de dados (para histórico)
Como você quer **histórico**, a decisão mais segura é:

- **Postgres** (banco de dados robusto e comum em produção)

**Por quê?**
- Você vai salvar muitos pontos de histórico (snapshots)
- Vai consultar por período (7/30/90 dias)
- Postgres lida bem com isso e evita retrabalho

> Decisão Fase 0: **Postgres**.

### 0.4.2) ORM (ferramenta para falar com o banco)
**ORM** é uma ferramenta que permite manipular o banco com código, sem escrever SQL toda hora.

- Recomendação: **Prisma** (muito usado com Next.js)

> Decisão Fase 0: **Prisma**.

### 0.4.3) Padrão de preço (importantíssimo)
Defina e documente:

- **Preço no banco em centavos (inteiro)**  
  Ex.: `R$ 1.299,90` → **129990**

Isso evita bugs e facilita cálculo/histórico.

> Decisão Fase 0: **preçoEmCentavos (int)**.

### 0.4.4) Modelo mental de dados (só conceito, sem implementar tudo ainda)
Você vai trabalhar com 4 conceitos (mais tarde viram tabelas):

1. **CPU (produto canônico)**: sua ficha “oficial” (ex.: Ryzen 5 5600)
2. **Store (loja)**: Amazon/KaBuM!/etc
3. **Offer (oferta)**: a CPU em uma loja (com URL daquela loja)
4. **PriceSnapshot (histórico)**: um registro do preço em um momento

> Decisão Fase 0: o histórico será por **snapshots**, não “atualizar um preço único”.

---

## ✅ 0.5) Identidade mínima da marca (sem travar design)
Como o nome está fechado (**PCHubBR**), faça só o mínimo para o projeto “ter cara”:

1. **Nome oficial (sempre igual)**
   - “**PCHubBR**” (não variar para PC Hub BR, etc.)

2. **Slogan temporário**
   - Sugestão: **“Histórico de preços de hardware.”**  
   (curto e casa com seu MVP)

3. **Cores (tokens simples)**
   - 1 cor principal (ex.: azul/roxo)
   - 1 cor de destaque (ex.: verde para “queda de preço”)

> Isso é suficiente para header, favicon e layout inicial.

---

## ✅ 0.6) Deploy “zerinho” (colocar no ar cedo)
Colocar no ar cedo ajuda muito (até psicologicamente).

1. Subir o site na **Vercel**
2. Garantir que o deploy funciona a cada push (CI “automática” da Vercel)

**Importante:** nesta fase, seu site pode ser **só um placeholder** com Home + “Em construção”.

---
