# NexoCourses — Backend API

Gerador automático de cursos online com IA. Sistema completo para transformar um briefing simples em um curso profissional em 2-4 horas.

## 📋 Índice

1. [Quick Start](#quick-start)
2. [Arquitetura](#arquitetura)
3. [Setup Local](#setup-local)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [API Documentation](#api-documentation)
6. [Deployment](#deployment)
7. [Roadmap MVP](#roadmap-mvp)

---

## 🚀 Quick Start

```bash
# Clone repo
git clone https://github.com/db8-intelligence/nexocourses.git
cd nexocourses

# Install deps
npm install

# Copy env template
cp .env.example .env.local

# Edit .env.local with your keys

# Start dev server
npm run dev

# In another terminal, start Redis (for local development)
redis-server

# Run migrations
npm run migrate
```

Server estará disponível em `http://localhost:3000`

---

## 🏗️ Arquitetura

### Componentes Principais

```
┌─────────────────────────────────────────────────┐
│          Frontend (React + Vite)                │
│       (Vercel — separado deste repo)            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      NexoCourses Backend (Este repo)            │
│  ┌───────────────────────────────────────────┐ │
│  │ Express Routes                            │ │
│  │ - POST /api/briefings (create course)    │ │
│  │ - GET /api/courses (list)                 │ │
│  │ - GET /api/jobs/lesson/:id (status)      │ │
│  │ - POST /webhooks/hotmart (payments)      │ │
│  └───────────────────────────────────────────┘ │
│                    │                            │
│  ┌────────────────┼────────────────────────┐  │
│  │ Agents (IA)    │                        │  │
│  │ - ResearchForge                         │  │
│  │ - CurriculumArchitect                   │  │
│  │ - ScriptMaster                          │  │
│  │ - VoiceHumanizer (Gemini)               │  │
│  │ - VoiceDirector                         │  │
│  └────────────────┼────────────────────────┘  │
│                   │                            │
│  ┌────────────────┼────────────────────────┐  │
│  │ Queue (Bull + Redis)                    │  │
│  │ - script queue                          │  │
│  │ - voice queue (ElevenLabs)              │  │
│  │ - avatar queue (HeyGen)                 │  │
│  │ - graphics queue (Fal.ai)               │  │
│  │ - composition queue (FFmpeg)            │  │
│  │ - delivery queue                        │  │
│  └────────────────┼────────────────────────┘  │
│                   │                            │
│  ┌────────────────┼────────────────────────┐  │
│  │ External APIs  │                        │  │
│  │ - Supabase (DB, Auth, Storage)         │  │
│  │ - Claude API (Anthropic)                │  │
│  │ - Gemini API (Google)                   │  │
│  │ - ElevenLabs (Voice Synthesis)          │  │
│  │ - HeyGen (Avatar Rendering)             │  │
│  │ - Fal.ai (Image Generation)             │  │
│  │ - Deepgram (Transcription)              │  │
│  │ - Cloudflare R2 (Object Storage)        │  │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Pipeline de Produção (7 Estágios)

```
Input Briefing
    ↓
[1] Research (ResearchForge)
    ↓
[2] Curriculum Design (CurriculumArchitect)
    ↓
[3] Script Generation (ScriptMaster) [PARALELO]
    ├─ Humanização (VoiceHumanizer)
    └─ Storytelling (Storyteller)
    ↓
[4] Processamento Paralelo [ASYNC]
    ├─ Voice Synthesis (ElevenLabs)
    ├─ Avatar Rendering (HeyGen)
    ├─ Graphics Generation (Fal.ai)
    └─ B-roll Selection (Pexels/Pixabay)
    ↓
[5] Video Composition (FFmpeg)
    ├─ Layer Composition
    ├─ Color Grading
    └─ Effects & Transitions
    ↓
[6] Post-Production
    ├─ Subtitle Generation (Deepgram)
    ├─ SEO Optimization
    └─ Thumbnail Creation
    ↓
[7] Delivery & Publishing
    ├─ MP4 Upload to R2
    ├─ Database Metadata
    ├─ Hotmart Integration
    └─ User Notification
    ↓
Final Course Ready
```

---

## 🛠️ Setup Local

### Pré-requisitos

- Node.js 20+
- Redis (para Bull queue)
- Conta Supabase
- Chaves de API (Anthropic, Gemini, etc)

### Instalação Passo a Passo

```bash
# 1. Clone
git clone https://github.com/db8-intelligence/nexocourses.git
cd nexocourses-mvp

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local

# 4. Edit .env.local com suas credenciais
# Veja seção "Variáveis de Ambiente" abaixo

# 5. Start Redis (macOS com Homebrew)
redis-server
# ou via Docker:
docker run -d -p 6379:6379 redis:7-alpine

# 6. Run database migrations
npm run migrate

# 7. Start dev server
npm run dev

# Server rodando em http://localhost:3000
```

### Verificar Setup

```bash
# Health check
curl http://localhost:3000/health

# Resposta esperada:
# { "status": "ok", "timestamp": "2026-04-19T...", "version": "1.0.0" }
```

---

## 🔐 Variáveis de Ambiente

### Obrigatórias (MVP)

```
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Claude (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Gemini (Google)
GEMINI_API_KEY=AIza...

# Redis
REDIS_URL=redis://localhost:6379
# ou se não usar URL:
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Opcionais (para Fase 2)

```
# ElevenLabs (Voice Synthesis)
ELEVENLABS_API_KEY=sk_...

# HeyGen (Avatar)
HEYGEN_API_KEY=...

# Fal.ai (Images)
FALAI_API_KEY=...

# Deepgram (Transcription)
DEEPGRAM_API_KEY=...

# Hotmart (Payments)
HOTMART_CLIENT_ID=...
HOTMART_CLIENT_SECRET=...
HOTMART_WEBHOOK_SECRET=...

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
```

### Como Obter Cada Chave

#### Anthropic API Key
1. Acesse https://console.anthropic.com
2. Create new API key
3. Copie e adicione em `ANTHROPIC_API_KEY`

#### Gemini API Key
1. Acesse https://ai.google.dev
2. Get API key
3. Copie e adicione em `GEMINI_API_KEY`

#### Supabase
1. Acesse https://supabase.com
2. Create project
3. Copie `URL` e `anon key` em `.env`
4. Get `service_role_key` em Project Settings → API

#### Redis (Desenvolvimento)
```bash
# macOS
brew install redis
redis-server

# Docker
docker run -d -p 6379:6379 redis:7-alpine

# Verificar
redis-cli ping # Resposta: PONG
```

---

## 📡 API Documentation

### 1. Criar Novo Curso (Briefing)

**Request:**
```http
POST /api/briefings
Content-Type: application/json

{
  "topic": "React Avançado",
  "level": "intermediate",
  "durationHours": 5,
  "sourceUrl": "https://example.com/react-guide",
  "targetAudience": "Desenvolvedores JavaScript",
  "style": "friendly",
  "language": "pt-BR"
}
```

**Response (202 Accepted):**
```json
{
  "courseId": "uuid-here",
  "status": "processing",
  "message": "Course generation started",
  "estimatedTime": "25 minutes"
}
```

**Fluxo:**
1. Briefing recebido
2. Inicia Research Agent (15-30 min)
3. Inicia Curriculum Architect
4. Inicia Script Master para cada aula
5. Enfileira jobs para processamento paralelo

---

### 2. Verificar Status do Curso

**Request:**
```http
GET /api/briefings/courseId
```

**Response (200 OK):**
```json
{
  "courseId": "uuid-here",
  "title": "React Avançado",
  "status": "generating",
  "progress": 45,
  "modulesCount": 3,
  "lessonsCount": 9,
  "readyLessons": 4,
  "lessons": [
    {
      "id": "lesson-id",
      "title": "Hooks Avançados",
      "status": "ready",
      "jobs": [
        {
          "id": "job-id",
          "stage": "composition",
          "status": "processing",
          "progress": 75
        }
      ]
    }
  ]
}
```

---

### 3. Listar Cursos do Usuário

**Request:**
```http
GET /api/courses
```

**Response (200 OK):**
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "React Avançado",
      "topic": "React",
      "level": "intermediate",
      "status": "ready",
      "duration_hours": 5,
      "created_at": "2026-04-19T10:00:00Z",
      "course_modules": [{ "count": 3 }]
    }
  ],
  "count": 1
}
```

---

### 4. Obter Detalhes do Curso

**Request:**
```http
GET /api/courses/courseId
```

**Response (200 OK):**
```json
{
  "course": {
    "id": "uuid",
    "title": "React Avançado",
    "description": "Course about React",
    "status": "ready",
    "duration_hours": 5
  },
  "modules": [
    {
      "id": "mod-id",
      "title": "Fundamentos",
      "order": 1,
      "duration_minutes": 45,
      "lessons": [
        {
          "id": "les-id",
          "title": "O que é React?",
          "duration_minutes": 12,
          "status": "ready"
        }
      ]
    }
  ]
}
```

---

### 5. Verificar Jobs de Produção

**Request:**
```http
GET /api/jobs/lesson/lessonId
```

**Response (200 OK):**
```json
{
  "lessonId": "uuid",
  "jobs": [
    {
      "id": "job-id",
      "stage": "script",
      "status": "completed",
      "progress": 100
    },
    {
      "id": "job-id",
      "stage": "voice",
      "status": "processing",
      "progress": 60
    }
  ],
  "summary": {
    "total": 6,
    "completed": 1,
    "progress": 17
  }
}
```

---

### 6. Webhook Hotmart (Pagamentos)

**Configurar em Hotmart:**
1. Acesse painel Hotmart
2. Vá em Integrações → Webhooks
3. Adicione URL: `https://nexocourses-backend.up.railway.app/api/webhooks/hotmart`
4. Selecione eventos: `PURCHASE_APPROVED`, `SUBSCRIPTION_CANCELLATION`
5. Copie `webhook_secret` e adicione em `.env`

**Eventos Tratados:**
- `PURCHASE_APPROVED` — Upgrade de plano
- `SUBSCRIPTION_CANCELLATION` — Downgrade para free
- `PURCHASE_REFUNDED` — Reembolso

---

## 🚀 Deployment

### Railway (Recomendado)

#### Step 1: Conectar GitHub

```bash
# Push seu código para GitHub
git push origin main
```

#### Step 2: Conectar Railway

1. Acesse https://railway.app
2. New Project
3. Deploy from GitHub
4. Selecione repositório `nexocourses-mvp`
5. Railway auto-detecta `Dockerfile` e `railway.toml`

#### Step 3: Configurar Variáveis

No painel Railway:
1. Go to Variables
2. Adicione todas as chaves de `.env.example`
3. Deploy automático ativa

#### Step 4: Configurar Banco de Dados

```bash
# Railway já tem Postgres — use externa (Supabase)
# Ou adicione PostgreSQL service no Railway:
1. New Service
2. PostgreSQL
3. Railway cria DATABASE_URL automaticamente
```

#### Step 5: Redis Setup

```bash
# No Railway:
1. New Service → Redis
2. Copie REDIS_URL
3. Adicione em Variables
```

#### Step 6: Deploy

```bash
# Automatic on push
git push origin main
# Railway redeploys automaticamente
```

**URLs após deploy:**
```
API: https://nexocourses-api-production.up.railway.app
Health: https://nexocourses-api-production.up.railway.app/health
```

---

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend (separado)
cd ../nexocourses-frontend
vercel
```

---

## 📊 Roadmap MVP

### Fase 1: MVP (Weeks 1-2)
- [x] Infraestrutura Express + Supabase
- [x] Agents básicos (Research, Curriculum, Script)
- [ ] Testes de integração com Claude API
- [ ] Deploy inicial em Railway
- [ ] Frontend form simples (Vercel)

### Fase 1.5: Integração APIs (Week 3-4)
- [ ] ElevenLabs API integration
- [ ] HeyGen API integration
- [ ] Fal.ai image generation
- [ ] FFmpeg composition pipeline
- [ ] Deepgram transcription

### Fase 2: Early Access (Weeks 5-6)
- [ ] Beta testing com 20-50 creators
- [ ] Feedback loop refinement
- [ ] Hotmart webhook configuration
- [ ] Analytics dashboard
- [ ] User notification system

### Fase 3: Scale (Ongoing)
- [ ] Voice cloning support
- [ ] Udemy/Teachable integrations
- [ ] Advanced analytics
- [ ] Creator marketplace
- [ ] Affiliate program

---

## 🐛 Troubleshooting

### "Cannot connect to Redis"

```bash
# Verificar se Redis está rodando
redis-cli ping

# Se não:
redis-server  # macOS/Linux
# ou
docker run -d -p 6379:6379 redis:7-alpine
```

### "Supabase connection failed"

```bash
# Verificar credenciais
echo $SUPABASE_URL
echo $SUPABASE_KEY

# Testar conexão
curl -H "apikey: $SUPABASE_KEY" https://your-project.supabase.co/rest/v1/
```

### "Claude API error"

```bash
# Verificar chave
echo $ANTHROPIC_API_KEY

# Deve começar com: sk-ant-
# Se não, get new key em console.anthropic.com
```

### "Port 3000 already in use"

```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm run dev
```

---

## 📚 Documentação Adicional

- [Análise Estratégica](../NEXOCOURSES_ANALISE_ESTRATEGICA.md)
- [Database Schema](./src/db/migrations/)
- [Agent Prompts](./src/agents/)
- [Queue Documentation](./src/queue/)

---

## 🤝 Contribuindo

```bash
# Feature branch
git checkout -b feature/sua-feature

# Commit seguindo convenção
git commit -m "feat: descrição"

# Push e open PR
git push origin feature/sua-feature
```

---

## 📄 License

MIT — Vejo arquivo LICENSE para detalhes

---

## 💬 Suporte

- Issues: GitHub Issues
- Email: support@db8intelligence.com.br
- Comunidade: Discord (link em breve)

---

**Last Updated:** April 19, 2026
**Versão:** 1.0.0-MVP
**Status:** Development 🟡
