# NexoCourses — Master Context File
> Versão: 2026-04-19 | Status: ⏸️ PAUSADO — scaffold em git, retomar depois do projeto atual do Douglas

---

## LEIA PRIMEIRO

SaaS para geração automática de cursos online com IA — briefing do usuário → pipeline de 7 estágios → vídeo-aula pronta. Diferencial é humanização de roteiros (sem "cara de IA"). Template inicial foi entregue como `nexocourses-mvp.tar.gz` (já extraído). Backend-only no momento — não há frontend. Stack: Node.js 20 + Express + TypeScript + Supabase + Bull/Redis + Claude API. Domínio: não registrado. Repo: não criado.

**ATENÇÃO — estado real do template entregue:**
- Documentação promete "13+ agentes IA" mas só **3 agentes** existem (research-forge, curriculum-architect, script-master)
- Pipeline de "7 estágios" tem **apenas 2 estágios funcionais** (research/curriculum via rotas + script). Os 5 restantes (voice, avatar, graphics, composition, delivery) são **stubs TODO** em [src/queue/processors/index.ts](nexocourses-mvp/src/queue/processors/index.ts)
- Tratar como **scaffold inicial**, não MVP pronto

---

## SKILLS DISPONÍVEIS

⏳ Ainda não criadas. A criar conforme projeto avançar:

| Skill | Arquivo | Quando criar |
|---|---|---|
| Backend API | `docs/skills/nexocourses-backend/SKILL.md` | Ao expandir rotas e serviços |
| Database | `docs/skills/nexocourses-database/SKILL.md` | Ao iterar sobre schema/RLS |
| AI Agents | `docs/skills/nexocourses-ai-agents/SKILL.md` | Ao completar os 10+ agentes faltantes |
| Integrações | `docs/skills/nexocourses-integrations/SKILL.md` | Ao integrar ElevenLabs/HeyGen/Fal.ai |
| Deploy | `docs/skills/nexocourses-deploy/SKILL.md` | Antes do primeiro deploy Railway |
| Frontend | `docs/skills/nexocourses-frontend/SKILL.md` | Quando iniciar UI (React+Vite) |

---

## STACK E CONFIGURAÇÃO

```bash
# Backend (único código existente)
cd nexocourses-mvp
npm install
npm run dev        # localhost:3000

# Redis → COMPARTILHADO com Evolution API no mesmo projeto Railway
# evolution-api.db8intelligence.com.br (infra DB8 existente)
# NexoCourses é um novo service no mesmo projeto — reaproveita o Redis plugin
# ⚠️ OBRIGATÓRIO: configurar prefix Bull customizado para evitar colisão de keys
# Para dev local apontando ao Redis do Railway:
#   railway run npm run dev     (puxa env vars do projeto Railway)

# Variáveis necessárias (.env.local — já copiado do .env.example)
# CRÍTICAS (sem elas nada roda):
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=                 # referenciar do Redis plugin do projeto Railway
BULL_PREFIX=nexocourses    # ⚠️ isolar keys do Evolution API (ver regra #9)

# FASE 2 (integrações de vídeo):
ELEVENLABS_API_KEY=
HEYGEN_API_KEY=
FALAI_API_KEY=
DEEPGRAM_API_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=

# FASE 3 (monetização):
HOTMART_CLIENT_ID=
HOTMART_CLIENT_SECRET=
HOTMART_WEBHOOK_SECRET=

# Branch strategy
git checkout main          # desenvolvimento
git checkout production    # nunca commit direto
```

**Deploy planejado:** Railway (backend) + Vercel team DB8-Intelligence (frontend, quando existir).

---

## MÓDULOS IMPLEMENTADOS ✅

**Estrutura base:**
- Express server com helmet, CORS, pino-http logging ([src/index.ts](nexocourses-mvp/src/index.ts))
- Health check em `/health`
- Supabase client (anon + service role) ([src/db/index.ts](nexocourses-mvp/src/db/index.ts))
- Bull queue + Redis connection ([src/queue/index.ts](nexocourses-mvp/src/queue/index.ts))
- Migration SQL core tables ([src/db/migrations/001-create-core-tables.sql](nexocourses-mvp/src/db/migrations/001-create-core-tables.sql))
- Dockerfile multi-stage + railway.toml

**Rotas:**
- `POST /api/briefings` + `GET /api/briefings/:id` ([src/routes/briefing.ts](nexocourses-mvp/src/routes/briefing.ts))
- `/api/courses` ([src/routes/courses.ts](nexocourses-mvp/src/routes/courses.ts))
- `/api/jobs` ([src/routes/jobs.ts](nexocourses-mvp/src/routes/jobs.ts))
- `/api/webhooks` ([src/routes/webhooks.ts](nexocourses-mvp/src/routes/webhooks.ts))

**Agentes IA (3 de 13+ planejados):**
- ResearchForge ([src/agents/research-forge.ts](nexocourses-mvp/src/agents/research-forge.ts))
- CurriculumArchitect ([src/agents/curriculum-architect.ts](nexocourses-mvp/src/agents/curriculum-architect.ts))
- ScriptMaster ([src/agents/script-master.ts](nexocourses-mvp/src/agents/script-master.ts))

---

## PIPELINE DE 7 ESTÁGIOS — ESTADO

| # | Estágio | Status | Arquivo |
|---|---|---|---|
| 1 | Research | ✅ Funcional | [research-forge.ts](nexocourses-mvp/src/agents/research-forge.ts) |
| 2 | Curriculum Design | ✅ Funcional | [curriculum-architect.ts](nexocourses-mvp/src/agents/curriculum-architect.ts) |
| 3 | Script Generation | ✅ Funcional | [script-master.ts](nexocourses-mvp/src/agents/script-master.ts) |
| 4 | Voice Synthesis | 🔴 Stub TODO | [processors/index.ts:31](nexocourses-mvp/src/queue/processors/index.ts#L31) |
| 5 | Avatar Rendering | 🔴 Stub TODO | [processors/index.ts:68](nexocourses-mvp/src/queue/processors/index.ts#L68) |
| 6 | Graphics (Fal.ai) | 🔴 Stub TODO | [processors/index.ts:106](nexocourses-mvp/src/queue/processors/index.ts#L106) |
| 7a | Video Composition | 🔴 Stub TODO | [processors/index.ts:143](nexocourses-mvp/src/queue/processors/index.ts#L143) |
| 7b | Delivery | 🔴 Stub TODO | [processors/index.ts:181](nexocourses-mvp/src/queue/processors/index.ts#L181) |

---

## PLANOS E PREÇOS

📋 A definir. Projeções do template (`NEXOCOURSES_ANALISE_ESTRATEGICA.md`):
- Custo/curso: ~R$9 | Venda: R$29–300
- Meta 100 users = R$13K/mês
- Meta 1.000 users = R$100K/mês
- Margem alvo: 95%+

Monetização planejada via Hotmart (BR) + Stripe (EN) — padrão DB8.

---

## REGRAS INVIOLÁVEIS

1. NUNCA commitar direto na branch `production`
2. NUNCA usar `any` no TypeScript sem comentário justificando
3. NUNCA fazer DELETE real no banco — usar `deleted_at` (soft delete)
4. SEMPRE validar créditos/plano do usuário antes de disparar pipeline (custo real em Claude/ElevenLabs/HeyGen)
5. SEMPRE rodar `npm run typecheck` antes de PR
6. NUNCA expor `SUPABASE_SERVICE_ROLE_KEY` no frontend — apenas backend
7. Resposta padrão da API: `{ success, data?, error?, code? }` (convenção DB8)
8. NUNCA processar pipeline síncrono em rota HTTP — usar Bull queue (processamento leva minutos)
9. SEMPRE usar prefix `nexocourses:` nas Bull queues — Redis é compartilhado com Evolution API no mesmo projeto Railway. Sem prefix, keys como `production:script` podem colidir ou vazar entre produtos. Adicionar `prefix: 'nexocourses'` nas opções de `new Queue(...)` em [src/queue/index.ts](nexocourses-mvp/src/queue/index.ts)

---

## ESTADO ATUAL — PENDÊNCIAS CRÍTICAS

```
🔴 BLOQUEIO #1: Credenciais Supabase
  Ação: Criar projeto em supabase.com, preencher SUPABASE_URL/KEY/SERVICE_ROLE_KEY
  em .env.local. Rodar migration 001-create-core-tables.sql no SQL Editor.

🔴 BLOQUEIO #2: Chave Anthropic
  Ação: Obter ANTHROPIC_API_KEY em console.anthropic.com, adicionar em .env.local.
  Sem ela nenhum agente roda.

🔴 BLOQUEIO #3: Adicionar NexoCourses ao projeto Railway existente
  Ação: No projeto Railway do Evolution API (evolution-api.db8intelligence.com.br),
  criar novo service via "New → GitHub Repo" apontando para DB8-Intelligence/nexocourses.
  Referenciar o Redis plugin já existente: na aba Variables, usar
  ${{Redis.REDIS_URL}} como valor de REDIS_URL. Configurar custom domain
  (ex.: nexocourses-api.db8intelligence.com.br).
  Para dev local: `railway login && railway link` (escolher service nexocourses)
  → `railway run npm run dev`.

✅ RESOLVIDO: Prefix Bull aplicado nas 6 filas em src/queue/index.ts (2026-04-19).

✅ RESOLVIDO: Erros TypeScript pré-existentes do template (2026-04-19).
  Fixes aplicados:
    - config/index.ts: non-null assertion (`!`) em SUPABASE_URL/KEY/SERVICE_ROLE_KEY,
      ANTHROPIC_API_KEY, GEMINI_API_KEY, REDIS_URL (já validadas em runtime)
    - queue/index.ts: removido `|| undefined` nas 6 filas; `testConnection()`
      trocado por `isReady()`
    - 3 agents (research-forge, curriculum-architect, script-master): corrigido
      path de import de `../../config` para `../config`
    - index.ts: double-cast `as unknown as Options` no pinoHttp (pino 8 vs
      pino-http 10 divergem em msgPrefix). TODO futuro: upgrade pino → 9.

⏳ Git: inicializar repo e criar em DB8-Intelligence/nexocourses
  Ação: `git init` na raiz, primeiro commit com template limpo, push para
  github.com/DB8-Intelligence/nexocourses

⏳ Auditar agentes existentes — validar se research/curriculum/script funcionam
  end-to-end antes de investir em integrações de vídeo.

⏳ 10+ agentes faltantes (VoiceHumanizer, Storyteller etc)
  Ação: Decidir se são necessários no MVP ou se podem virar Fase 2/3.
```

---

## PRÓXIMA SESSÃO — FAÇA ISSO AGORA

**Prioridade 1: Fix crítico no código antes de deployar**
```
1. Editar src/queue/index.ts — adicionar `prefix: 'nexocourses'` nas 6 filas
2. Commit: "fix(queue): isolate Bull keys via prefix for shared Redis"
3. Rodar npm run typecheck para validar
```

**Prioridade 2: Integrar NexoCourses ao projeto Railway existente**
```
1. Criar repo GitHub DB8-Intelligence/nexocourses e push inicial
2. No projeto Railway (Evolution API): New Service → GitHub Repo → nexocourses
3. Na aba Variables do novo service:
   - REDIS_URL = ${{Redis.REDIS_URL}}  (reutilizar plugin existente)
   - Adicionar SUPABASE_URL/KEY/SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
4. Configurar custom domain (ex.: nexocourses-api.db8intelligence.com.br)
5. Para dev local: `railway link` → selecionar service nexocourses
   → `railway run npm run dev`
6. Validar: curl http://localhost:3000/health
```

**Prioridade 3: Supabase + migration**
```
1. Criar projeto Supabase (supabase.com/dashboard → New Project)
2. SQL Editor → colar src/db/migrations/001-create-core-tables.sql → executar
3. Copiar URL/anon/service_role keys para Railway Variables
```

**Prioridade 2: Testar pipeline real (agentes 1-3)**
```
1. curl POST /api/briefings com payload React Hooks
2. Acompanhar logs — validar que Claude API responde
3. Verificar no Supabase se linhas foram inseridas nas tabelas
4. Se funcionar → decidir próximo passo (ElevenLabs ou frontend)
```

**Prioridade 3: Decisão estratégica**
```
Escolher um dos caminhos antes de continuar:
  A) Completar pipeline de vídeo (ElevenLabs → HeyGen → FFmpeg)
     = 80-100h trabalho, produto completo mas demorado
  B) Lançar Fase 1 só com scripts/roteiros (sem vídeo)
     = validar mercado mais rápido, pivotar se necessário
  C) Construir frontend mínimo primeiro para testar UX
     = crítico para beta testing com creators
```

---

## DECISÕES ABERTAS

- [ ] Domínio: `nexocourses.com` vs `nexocourses.com.br` vs outro?
- [ ] Repo: criar em DB8-Intelligence quando?
- [ ] Frontend: React+Vite (padrão DB8) já no scaffold ou depois?
- [ ] Object Storage: Cloudflare R2 (no .env.example) ou Supabase Storage (padrão DB8)?
- [ ] Posicionamento: competidor direto (Synthesia, Heygen) ou nicho (cursos para creators BR)?

---

## HISTÓRICO DE SESSÕES

### Sessão 2026-04-19
- ✅ Template `nexocourses-mvp.tar.gz` extraído
- ✅ `.env.local` copiado do `.env.example` (ainda vazio)
- ✅ `npm install` rodado (node_modules presente)
- ✅ Auditoria inicial: descoberto que só 3 de 13+ agentes existem; 5 estágios são stubs
- ✅ MASTER.md criado em `docs/MASTER.md`
- ⏳ Nenhum código executado ainda — credenciais pendentes
- 📌 Decisão: tratar template como scaffold, não MVP pronto — alinhar expectativas antes de prometer "Fase 1 em 1 semana"
- 📌 Decisão: Redis via plugin Railway (não local), deploy via Dockerfile no Railway. Dev local usa `railway run` para herdar env vars do projeto Railway.
- 📌 Decisão: NexoCourses será novo service dentro do projeto Railway existente do Evolution API (evolution-api.db8intelligence.com.br), reutilizando o Redis plugin. Risco identificado: Bull keys colidem sem prefix — adicionado como regra inviolável #9.
- ✅ Fix aplicado: `prefix: 'nexocourses'` nas 6 Bull queues em [src/queue/index.ts](nexocourses-mvp/src/queue/index.ts) (scriptQueue, voiceQueue, avatarQueue, graphicsQueue, compositionQueue, deliveryQueue).
- ⚠️ Descoberto via typecheck: template tem 8 erros TS pré-existentes (não causados pelo fix). Viraram Bloqueio #4 — resolver antes do primeiro deploy.
- ✅ 8 erros TS do template resolvidos (ver Bloqueio #4). `npm run typecheck` passa limpo.
- ✅ Git inicializado, `.gitignore` raiz criado excluindo `*.tar.gz`, `.claude/settings.local.json`, `node_modules/`, `.env.local`.
- ⏸️ PAUSA: Douglas está focado em outro projeto; NexoCourses entra em parking aguardando. Próxima retomada = criar repo GitHub `DB8-Intelligence/nexocourses` + push do commit inicial + seguir bloqueios #1/#2/#3.
