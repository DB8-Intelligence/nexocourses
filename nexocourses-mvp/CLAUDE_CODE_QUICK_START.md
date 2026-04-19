# NexoCourses — Quick Start para Claude Code

## ⚡ Resumo (5 min)

Este é um SaaS de geração automática de cursos com IA. 
- **Input:** Briefing (tema, nível, duração, etc)
- **Output:** Curso completo com vídeos em 2-4 horas
- **Stack:** Node.js + Express + Supabase + Claude API + Bull Queue

---

## 🎯 Que Fazer Primeiro

### 1. Setup Local (10 min)

```bash
cd /home/claude/nexocourses-mvp

# Copiar env template
cp .env.example .env.local

# Preencher credenciais:
# SUPABASE_URL, SUPABASE_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY
nano .env.local

# Install + start
npm install
redis-server &  # Terminal 2
npm run dev     # Terminal 1

# Verificar saúde
curl http://localhost:3000/health
```

### 2. Testar API Básica (5 min)

```bash
# Criar curso
curl -X POST http://localhost:3000/api/briefings \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "React Hooks",
    "level": "intermediate",
    "durationHours": 2,
    "style": "friendly"
  }'

# Resposta deve ser courseId (202 Accepted)
# Copiar courseId para próximo teste

# Verificar status
curl http://localhost:3000/api/briefings/{courseId}

# Deve mostrar progresso de geração
```

### 3. Database Setup (5 min)

```bash
# Opção A: Supabase (recomendado)
# 1. Criar projeto em https://supabase.com
# 2. Copiar URL e KEY para .env.local
# 3. Executar migrations:
#    - SQL Editor do Supabase
#    - Copiar conteúdo: src/db/migrations/001-create-core-tables.sql
#    - Executar

# Opção B: Migrations via Node (após Supabase conectado)
npm run migrate
```

---

## 📁 Estrutura de Arquivos

```
nexocourses-mvp/
├── src/
│   ├── index.ts              # Entry point (Express server)
│   ├── config/               # Configurações
│   ├── db/                   # Supabase client + types
│   ├── agents/               # Agentes IA (3 principais)
│   │   ├── research-forge.ts
│   │   ├── curriculum-architect.ts
│   │   └── script-master.ts
│   ├── queue/                # Bull queue + processors
│   ├── routes/               # API endpoints
│   │   ├── briefing.ts       # POST /api/briefings
│   │   ├── courses.ts        # GET /api/courses
│   │   ├── jobs.ts           # GET /api/jobs
│   │   └── webhooks.ts       # POST /webhooks
│   └── utils/                # Logger, helpers
├── package.json
├── tsconfig.json
├── Dockerfile
├── railway.toml
├── .env.example
├── README.md
└── DEPLOYMENT_GUIDE.md
```

---

## 🤖 Principais Agentes IA (MVP)

### 1. **ResearchForge** (`src/agents/research-forge.ts`)
```typescript
// Input: topic + nivel + sourceUrl
// Output: Knowledge base sintetizada
// Faz: Web search + analysis com Claude
const knowledgeBase = await researchForge.research({
  topic: "React Hooks",
  level: "intermediate",
});
```

**O que faz:**
- Busca em múltiplas fontes (mock para MVP, real em Fase 2)
- Sintetiza com Claude Sonnet
- Extrai key points

---

### 2. **CurriculumArchitect** (`src/agents/curriculum-architect.ts`)
```typescript
// Input: knowledge base + duration
// Output: Estrutura de módulos/aulas
const structure = await curriculumArchitect.designCurriculum({
  topic: "React Hooks",
  level: "intermediate",
  durationHours: 2,
  knowledgeBase: synthesis,
});
```

**O que faz:**
- Cria estrutura pedagógica
- Define módulos e aulas
- Calcula timing

---

### 3. **ScriptMaster** (`src/agents/script-master.ts`)
```typescript
// Input: aula + contexto
// Output: Roteiro humanizado com tags
const script = await scriptMaster.generateScript({
  lessonTitle: "Custom Hooks",
  duration: 15,
  learningObjectives: [...],
  knowledgeBase: synthesis,
});

// Output example:
// [CAMERA: Close-up, sorriu natural]
// "Ó, e aí? Hoje a gente vai entender custom hooks..."
// [GRAPHIC: Diagrama — fade in]
// [PAUSE: 2s]
```

**O que faz:**
- Cria roteiros que PARECEM HUMANOS
- Remove padrões de IA
- Adiciona [CAMERA], [GRAPHIC], [PAUSE] tags
- Sistema de humanização em 3 camadas

---

## 🔌 Integração com APIs (Fase 2)

Agora (MVP) = **Mock/Stub**. Depois (Fase 2) = **Real**:

```typescript
// Fase 1: Stub (arquivo src/queue/processors/index.ts)
export async function processVoiceStage(data) {
  // TODO: Integrar com ElevenLabs API
  // - Get script from DB
  // - Call ElevenLabs
  // - Save MP3 to R2
}

// Fase 2: Real
import * as ElevenLabs from '@elevenlabs/nodejs';

export async function processVoiceStage(data) {
  const script = await getScriptFromDB(data.lessonId);
  const mp3 = await ElevenLabs.textToSpeech(script);
  await uploadToR2(mp3);
}
```

**APIs a integrar (ordem):**
1. ElevenLabs (voz mais realista)
2. HeyGen (avatar com voz sincronizada)
3. Fal.ai Flux Pro (imagens e gráficos)
4. FFmpeg (composição de vídeo)
5. Deepgram (transcrição e legendas)

---

## 🚀 Próximos Passos no Claude Code

### Semana 1: Validação MVP

```bash
# Task 1: Testar agentes localmente
npm run dev
# POST /api/briefings
# Verificar se researchForge, curriculumArchitect, scriptMaster rodando

# Task 2: Setup Supabase
# Migrations, tabelas, indexes

# Task 3: Deploy Railway
# DEPLOYMENT_GUIDE.md passo-a-passo
```

### Semana 2: Integração ElevenLabs

```typescript
// src/queue/processors/voice.ts
// Implementar processVoiceStage real
// Testar com file de áudio de teste
```

### Semana 3: Integração HeyGen

```typescript
// src/queue/processors/avatar.ts
// Implementar processAvatarStage real
// Testar avatar rendering
```

### Semana 4: FFmpeg + Delivery

```typescript
// src/queue/processors/composition.ts
// Implementar processCompositionStage real
// Testar video final renderizado
```

---

## 🎯 KPIs MVP (Alvo Mínimo)

- ✅ API respondendo em produção
- ✅ Agents gerando estrutura de cursos
- ✅ Scripts humanizados sem parecer IA
- ✅ Supabase armazenando dados corretamente
- ✅ Hotmart webhook processando pagamentos
- ✅ 100+ users testando

---

## 🐛 Debugging Common Issues

### "ResearchForge retorna vazio"

```typescript
// Atualmente: MOCK sources no código
// Solução: Em src/agents/research-forge.ts
// Procurar: gatherSources()
// Adicionar URLs reais ou usar Google Scholar API
```

### "CurriculumArchitect erro de parsing"

```typescript
// Claude pode retornar JSON inválido
// Solução: src/agents/curriculum-architect.ts
// Melhorar prompt ou adicionar retry logic

try {
  const parsed = JSON.parse(jsonMatch[0]);
} catch {
  // Retry com prompt ajustado
}
```

### "ScriptMaster parece IA"

```typescript
// 3 camadas de humanização em src/agents/script-master.ts
// 1. System prompt (SCRIPT_SYSTEM_PROMPT)
// 2. Agent humanizer (depois)
// 3. Storyteller agent (depois)
// Testar cada layer
```

---

## 📊 Monitoramento em Produção

```bash
# Railway logs
railway logs -f

# Testar health
curl https://seu-projeto.up.railway.app/health

# Testar API
curl https://seu-projeto.up.railway.app/api/courses

# Verificar variáveis
railway variables list

# Ver CPU/Memory
railway status
```

---

## 💡 Dicas Importantes

1. **Manter agentes simples** — Fase 1 = scripts + estrutura. Vídeos reais = Fase 2.

2. **Testar com Claude API antes de deploy** — Gemini como fallback.

3. **Use Redis para fila** — Sem Redis, tudo é síncrono.

4. **Supabase RLS é importante** — Usuários só veem seus dados.

5. **Hotmart webhook crítico** — Receita no dia 1.

---

## 🎓 Arquivos para Estudar Primeiro

1. **src/index.ts** — Como Express está estruturado
2. **src/agents/research-forge.ts** — Padrão de agent IA
3. **src/routes/briefing.ts** — Fluxo completo de API
4. **src/queue/index.ts** — Como Bull queue funciona
5. **README.md** — Documentação completa

---

## ✅ Checklist de Implementação

```
Agora (fazer em ORDER):
☐ Setup local (npm install, redis, .env)
☐ Testar API health endpoint
☐ Testar POST /api/briefings (agent flow)
☐ Setup Supabase + migrations
☐ Deploy em Railway (DEPLOYMENT_GUIDE.md)
☐ Testar em produção
☐ Setup Hotmart webhook

Próximo (Phase 2):
☐ Implementar ElevenLabs integration
☐ Implementar HeyGen integration
☐ Implementar Fal.ai integration
☐ Implementar FFmpeg composition
☐ Beta testing com 50 creators
☐ Melhorias baseadas em feedback
```

---

## 🎬 Começar Agora

```bash
# 1. Abrir Claude Code
# 2. Selecionar /home/claude/nexocourses-mvp como working dir
# 3. Terminal: npm install
# 4. Terminal: redis-server
# 5. Terminal: npm run dev
# 6. Test: curl http://localhost:3000/health
# 7. Estudar: src/agents/research-forge.ts
# 8. Modificar: Adicionar sua lógica
# 9. Deploy: Seguir DEPLOYMENT_GUIDE.md
```

---

**Status:** Pronto para começar 🚀
**Tempo estimado:** 4-6 semanas (MVP completo)
**Próximo milestone:** Health check ✅ + First agent test ⏳
