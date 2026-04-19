# NexoCourses — Deployment Guide (Railway)

## 📚 Índice
1. [Setup Inicial](#setup-inicial)
2. [Railway Configuration](#railway-configuration)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Database Setup](#database-setup)
5. [Pós-Deploy Checklist](#pós-deploy-checklist)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Inicial

### Step 1: Preparar GitHub

```bash
# 1. Push código para GitHub
git add .
git commit -m "Initial NexoCourses backend"
git push origin main

# 2. Certifique-se que o repo é público ou Railway tem acesso
# Se privado: Adicionar Railway como colaborador
```

### Step 2: Criar Conta Railway

1. Acesse https://railway.app
2. Sign up (pode usar GitHub)
3. Verifique email

### Step 3: Conectar GitHub ao Railway

1. Dashboard Railway → New Project
2. Deploy from GitHub
3. Autorize Railway app no GitHub
4. Selecione repositório `nexocourses-mvp`
5. Railway detecta Dockerfile automaticamente
6. Clique "Deploy"

---

## ⚙️ Railway Configuration

### Etapa 1: Configurar Serviços

No painel Railway:

```
1. Projeto abrir
2. "Canvas" view (visual)
3. Deve haver:
   - web (container Docker)
   - Opcional: PostgreSQL, Redis (se adicionar)
```

**Para adicionar Redis no Railway:**
```
1. + New Service
2. Selecionar "Redis"
3. Railway cria instância automaticamente
4. Copiar REDIS_URL gerado
```

**Para adicionar PostgreSQL (opcional, já usando Supabase):**
```
1. + New Service
2. Selecionar "PostgreSQL"
3. Copiar DATABASE_URL (não usar, vamos usar Supabase)
```

### Etapa 2: Configurar Variáveis de Ambiente

No painel Railway:

```
1. Clicar em "web" service
2. Aba "Variables"
3. Adicionar variáveis (veja abaixo)
```

---

## 🔐 Variáveis de Ambiente

### **CRÍTICAS** (MVP deve funcionar)

```env
# Server
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGc... (anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service role)

# Claude
ANTHROPIC_API_KEY=sk-ant-...

# Gemini
GEMINI_API_KEY=AIza...

# Redis (se adicionar ao Railway)
# Railway fornece automaticamente via $REDIS_URL
# Ou configure:
REDIS_URL=redis://default:password@hostname:port

# CORS
CORS_ORIGIN=http://localhost:5173,https://seu-frontend.vercel.app
```

### **IMPORTANTES** (Fase 2)

```env
# ElevenLabs
ELEVENLABS_API_KEY=sk_...

# HeyGen
HEYGEN_API_KEY=...

# Fal.ai
FALAI_API_KEY=...

# Deepgram
DEEPGRAM_API_KEY=...

# Hotmart
HOTMART_CLIENT_ID=...
HOTMART_CLIENT_SECRET=...
HOTMART_WEBHOOK_SECRET=...

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
```

### Como Adicionar no Railway

**Opção A: Via Dashboard**
```
1. Projeto Railway
2. Variables tab
3. New Variable
4. Preencher KEY=VALUE
5. Salvar (auto-deploy)
```

**Opção B: Via Railway CLI**
```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Adicionar variável
railway variables set SUPABASE_URL=https://...
railway variables set ANTHROPIC_API_KEY=sk-ant-...

# Deploy
railway up
```

**Opção C: Arquivo .railwayrc**
```json
{
  "projectId": "seu-project-id",
  "environmentId": "seu-env-id"
}
```

---

## 🗄️ Database Setup

### Opção 1: Supabase (Recomendado para MVP)

```bash
# 1. Criar projeto em Supabase
# https://supabase.com/dashboard

# 2. Copiar credenciais
# Settings → API → Project URL: SUPABASE_URL
# Settings → API → anon key: SUPABASE_KEY
# Settings → API → service_role key: SUPABASE_SERVICE_ROLE_KEY

# 3. Adicionar em Railway Variables

# 4. Executar migrations
# Opção A: Via SQL Editor do Supabase
# - Abrir dashboard Supabase
# - SQL Editor
# - Copiar conteúdo de src/db/migrations/001-create-core-tables.sql
# - Executar

# Opção B: Via Node.js (após deploy)
# railway run npm run migrate
```

### Opção 2: PostgreSQL no Railway

```bash
# 1. Adicionar PostgreSQL service no Railway
# 2. Railway fornece DATABASE_URL automaticamente
# 3. Usar em Node:
# VITE_SUPABASE_URL (se usando Supabase)
# Ou database connection string
```

---

## ✅ Pós-Deploy Checklist

### Fase 1: Verificação Básica

```bash
# 1. Check health endpoint
curl https://your-project.up.railway.app/health
# Esperado: { "status": "ok", ... }

# 2. Check logs
# Railway Dashboard → Logs tab
# Procurar por erros ou warnings

# 3. Testar GET /api/courses (sem autenticação)
curl https://your-project.up.railway.app/api/courses
# Pode retornar erro 500 ou lista vazia (normal sem auth)
```

### Fase 2: Configuração Hotmart (se vender)

```
1. Painel Hotmart
2. Integrações → Webhooks
3. Adicionar novo webhook:
   URL: https://seu-projeto.up.railway.app/api/webhooks/hotmart
   Eventos: PURCHASE_APPROVED, SUBSCRIPTION_CANCELLATION
4. Copiar webhook secret
5. Adicionar em Railway: HOTMART_WEBHOOK_SECRET
```

### Fase 3: Monitoramento

```
1. Railway Logs → ative notificações de erro
2. Configure alertas para:
   - CPU > 80%
   - Memory > 80%
   - Build failures
3. Setup status page (Railway Analytics)
```

---

## 🐛 Troubleshooting

### "Build failed"

**Causas comuns:**
```
1. Typescript errors
   → npm run typecheck local
   → Corrigir antes de push

2. Missing dependencies
   → npm install missing-package
   → git push

3. Dockerfile issues
   → Verificar Dockerfile está no root
   → docker build . local
```

**Solução:**
```bash
# Verificar build local
npm run build

# Se erro, corrigir e push
git push origin main
# Railway rebuilda automaticamente
```

---

### "Runtime error - API returns 500"

**Causas:**
```
1. Variáveis de ambiente faltando
   → Verificar Railway Variables
   → Se adicionou, trigger redeploy

2. Redis não conectando
   → Verificar REDIS_URL correto
   → redis-cli -u $REDIS_URL ping

3. Supabase credenciais erradas
   → Verificar SUPABASE_URL e KEY
   → Test via curl

4. Node.js incompatível
   → package.json: "engines": { "node": ">=20.0.0" }
   → Railway usa Node auto-detectado
```

**Debug:**
```bash
# View logs em tempo real
railway logs -f

# Conectar ao container
railway shell

# Testar conexão Supabase dentro do container
node -e "console.log(process.env.SUPABASE_URL)"
```

---

### "Timeout - produção de curso leva muito tempo"

**Solução:**
```
1. Aumentar timeout em Railway
   → project settings → regions/resources
   → Aumentar CPU/Memory allocation

2. Usar feature flags para desabilitar processamento pesado
   → ENABLE_VIDEO_PROCESSING=false (MVP)
   → Ativar na Fase 2

3. Usar filas assíncronas (Bull/Redis)
   → Já implementado no código
   → Verificar se Redis está conectando
```

---

### "Redis connection refused"

```bash
# 1. Verificar se Redis foi adicionado ao Railway
# Dashboard → Services → deveria ter "redis"

# 2. Testar conexão
# Railway shell
redis-cli -u $REDIS_URL ping

# 3. Se não existe service Redis
# Adicionar:
# + New Service → Redis → Deploy

# 4. Copiar REDIS_URL gerado
# Add to Railway Variables
```

---

### "CORS error ao chamar API do frontend"

```
Erro: "No 'Access-Control-Allow-Origin' header"

Solução:
1. Verificar CORS_ORIGIN em Railway Variables
   CORS_ORIGIN=http://localhost:5173,https://seu-frontend.vercel.app

2. Se frontend mudou domínio, atualizar:
   CORS_ORIGIN=new-frontend-domain.vercel.app

3. Redeploy:
   git push origin main
   ou
   railway up
```

---

## 🔍 Monitoring & Logging

### Acessar Logs

```
Railway Dashboard:
1. Projeto
2. Logs tab
3. Filtrar por timestamp/level

Ou via CLI:
railway logs -f          # Follow mode
railway logs --tail 50   # Últimas 50 linhas
```

### Alertas Recomendados

Configurar em Railway:
```
1. Build failures
2. Deployment errors
3. CPU usage > 80%
4. Memory > 85%
5. Crashes/restarts
```

---

## 🎯 Performance Tips

### Otimizar Build

```bash
# Remover packages não usados
npm prune --production

# Use --only=production no deployment
npm ci --only=production
```

### Otimizar Runtime

```env
# Dockerfile já usa multi-stage
# FROM node:20-alpine (leve)
# Remover devDependencies em production

# .env.production
NODE_ENV=production
LOG_LEVEL=warn  # Menos logging = menos overhead
```

### Scaling

Se tráfego aumentar:
```
1. Railway → Project Settings
2. Aumentar "Instances" para 2+
3. Load balancing automático

Ou usar Railway Pro ($5/mês por serviço extra)
```

---

## 📋 Deployment Checklist

```
Pré-deploy:
☐ Código compilado sem errors (npm run build)
☐ Migrations SQL prontas (001-create-core-tables.sql)
☐ Variáveis de ambiente documentadas (.env.example)
☐ Dockerfile testado localmente (docker build)
☐ git commit + push para main

Deploy:
☐ Railway auto-detects e builds
☐ Health check passa (/health endpoint)
☐ Variáveis carregadas corretamente
☐ Logs sem erros críticos

Pós-deploy:
☐ Health endpoint respondendo
☐ API /api/courses acessível
☐ Logs monitorando
☐ Hotmart webhook configurado (se vendendo)
☐ CDN/Cache configurado (Cloudflare)

Monitor:
☐ Alertas ativos
☐ Uptime monitored (StatusPage.io, Pingdom)
☐ Error tracking (Sentry, LogRocket)
☐ Performance monitoring (New Relic, Datadog)
```

---

## 🚀 Redeployment

Para fazer redeploy:

**Opção 1: Auto via GitHub**
```bash
git push origin main
# Railway detecta mudança, rebuilda e redeploy automaticamente
```

**Opção 2: Via Railway Dashboard**
```
1. Projeto
2. Deployments tab
3. Clicar em deploy anterior
4. "Redeploy" button
```

**Opção 3: Via CLI**
```bash
railway up
```

---

## 📞 Suporte

Se tiver problemas:

1. **Verificar logs** → Railway Logs tab
2. **Verificar variáveis** → Variables tab
3. **Testar local** → `npm run dev`
4. **Verificar código** → Procurar erros óbvios
5. **Community** → Railway Discord
6. **Suporte DB8** → support@db8intelligence.com.br

---

**Documento criado:** Abril 19, 2026
**Última atualização:** Abril 19, 2026
**Status:** Production-ready ✅
