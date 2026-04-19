# NexoCourses — Sistema Automático de Geração de Cursos Online
## Análise Estratégica Completa | DB8 Intelligence

**Versão:** 1.0 | **Data:** Abril 2026 | **Status:** Proposta Estratégica

---

## ÍNDICE
1. [Visão Geral do Produto](#visão-geral)
2. [Proposta de Valor](#proposta-de-valor)
3. [Modelo de Funcionamento](#modelo-de-funcionamento)
4. [Arquitetura Técnica](#arquitetura-técnica)
5. [Pipeline de Produção (7 Estágios)](#pipeline-de-produção)
6. [Agentes IA Especializados](#agentes-ia-especializados)
7. [Integrações e Tecnologias](#integrações-e-tecnologias)
8. [Estratégia de "Human-Like Output"](#estratégia-humanização)
9. [Modelos de Negócio](#modelos-de-negócio)
10. [Roadmap de Implementação](#roadmap)
11. [Estimativas de Tempo e Custo](#estimativas)

---

## 1. VISÃO GERAL DO PRODUTO {#visão-geral}

### Nome: **NexoCourses** (ou **CourseForge** / **AutoAcademy**)
**Tagline:** *"Do Zero ao Curso Profissional em Minutos — Sem Parecer IA"*

### O que é?
SaaS de **geração automática de cursos online completos** que transforma uma simples descrição do usuário em um curso profissional, pronto para vender, com:

- ✅ Conteúdo estruturado em capítulos + subcapítulos
- ✅ Roteiros de vídeo com timing exato
- ✅ Avatares humanizados (HeyGen ou Elevelabs)
- ✅ Narração em voz natural (múltiplos idiomas/sotaques)
- ✅ Vídeos renderizados com gráficos, animações e b-roll
- ✅ Imagens ilustrativas via IA
- ✅ Transcrições, legendas e material suplementar
- ✅ Integração com plataformas de venda (Hotmart, Udemy, Teachable)

### Diferenciais Críticos
1. **Fontes Dinâmicas** — Sistema busca em Google Scholar, YouTube, Notion públicos, websites
2. **NotebookLM-like Analysis** — Sintetiza múltiplas fontes em narrativa coerente
3. **Human-First Output** — Parece 100% feito por humano (não por IA)
4. **Vídeos Profissionais** — Não é slideshow; é cinema de educação
5. **Escalável** — 1 input → N cursos em paralelo

---

## 2. PROPOSTA DE VALOR {#proposta-de-valor}

### Para Criadores de Conteúdo / Influenciadores
```
ANTES: 40-80 horas por curso (roteiro + gravação + edição + upload)
DEPOIS: 30 minutos de briefing → curso pronto em 2-4 horas
ROI: 95% menos tempo manual; qualidade profissional garantida
```

### Para Educadores / Consultores
```
✓ Gerar múltiplos cursos rapidamente
✓ Testar nichos sem risco
✓ Renda passiva escalável
✓ Sem habilidades técnicas de produção
```

### Para Empresas B2B
```
✓ Treinamento corporativo automático
✓ Onboarding de clientes em escala
✓ Documentação técnica como vídeoaulas
```

### Precificação Estimada
```
Free:        Até 1 curso/mês, avatar padrão
Starter:     R$97/mês  → 3 cursos, avatares ilimitados
Pro:         R$297/mês → 10 cursos, fontes premium
Enterprise:  Customizado → Marca branca, API
```

---

## 3. MODELO DE FUNCIONAMENTO {#modelo-de-funcionamento}

### User Journey (Happy Path)
```
1. BRIEFING (5 min)
   → Usuário preenche formulário:
     • Tema / Nicho
     • Nível (iniciante/intermediário/avançado)
     • Duração desejada (2h / 5h / 10h / 20h)
     • Fonte de referência (link para YouTube, Notion, PDF, arquivo)
     • Estilo de apresentação (professora formal / cara descontraído / avó amorosa)
     • Idioma + sotaque

2. RESEARCH (15-30 min) [ASYNC]
   → Sistema busca em:
     • Google Scholar (papers)
     • YouTube (top 10 vídeos do tema)
     • Medium / Dev.to (artigos)
     • Wikipedia (contexto)
     • Arquivo do usuário (se forneceu)
   → NotebookLM-like synthesis: extrai insights, estrutura argumento

3. OUTLINE (10-15 min) [AUTO]
   → Gera estrutura:
     • Título do curso
     • Descrição de venda
     • 5-8 módulos / capítulos
     • 3-4 aulas por módulo
     • Objetivos de aprendizado por aula

4. SCRIPT (15-30 min) [AUTO]
   → Para CADA aula:
     • Roteiro de voz (1-3 páginas)
     • Timing e pausas
     • Indicações de câmera (zoom in/out, cortes, transições)
     • Textos de tela
     • Pontos de gráfico/imagem

5. AVATAR + NARRAÇÃO (20-40 min) [ASYNC]
   → Paralelo:
     • HeyGen API: render avatar em vídeo (roteiro + voz sintetizada)
     • Elevelabs: múltiplas vozes, diferentes sotaques
     • Ou: arquivo de voz profissional do usuário (upload)

6. DESIGN + GRÁFICOS (10-20 min) [AUTO]
   → Para cada frame:
     • Gráficos dinâmicos (Plotly / D3.js)
     • Imagens contextuais (Flux Pro via Fal.ai)
     • Animações de transição (Lottie)
     • Lower thirds, ícones, paleta de cores

7. EDIÇÃO + COMPOSIÇÃO (15-30 min) [AUTO]
   → FFmpeg pipeline:
     • Compor layers: avatar + gráfico + texto + música
     • B-roll automático (Pexels / Pixabay)
     • Sincronizar timing com narração
     • Exportar em múltiplos formatos (1080p, 720p, móvel)

8. DELIVERY (5 min) [AUTO]
   → Exportar:
     • MP4 final para cada aula
     • SRT (legendas)
     • Documento de resumo/handout
     • Cartão de apresentação do curso
     • Descrição de venda otimizada (SEO)

[TOTAL: 2-4 horas wall-clock; <15 min de trabalho manual do usuário]
```

---

## 4. ARQUITETURA TÉCNICA {#arquitetura-técnica}

### Stack (Alinhado ao DB8 Ecosystem)

```yaml
Frontend:
  - React 18 + Vite + TypeScript + Tailwind
  - shadcn/ui + Recharts (visualizar progresso de produção)
  - Drag-drop para reordenar módulos
  - Preview de vídeo em real-time

Backend:
  - Node.js + Express + TypeScript (Railway)
  - Bull + Redis para fila de processamento
  - Webhook handlers (Hotmart, Supabase, n8n)

Database:
  - Supabase (PostgreSQL + Storage + Auth + RLS)
  - Tabelas principais:
    • users
    • courses
    • course_modules
    • course_lessons
    • lesson_scripts
    • lesson_videos (metadata)
    • production_jobs (fila status)

IA & APIs:
  - Claude Sonnet 4 (blueprint, refinement)
  - Gemini 2.0 Flash (synthesis rápida, fallback)
  - HeyGen API (avatar rendering)
  - Elevelabs API (narração)
  - Fal.ai Flux Pro (imagens conceituais)
  - Pexels/Pixabay (b-roll stock)
  - Google Scholar API (research)
  - YouTube Data API (source finding)

Video Processing:
  - FFmpeg (Railway container)
  - MediaInfo (metadata extraction)
  - ffmpeg-fluent (Node.js wrapper)

Storage:
  - Supabase Storage (scripts, uploads, drafts)
  - Cloudflare R2 (video files — cheaper than AWS)
  - CDN: CloudFlare ou AWS CloudFront

Deployment:
  - Vercel (frontend)
  - Railway (backend + processing)
  - Supabase (realtime updates do progress)
```

### Diagram de Fluxo
```
User Input
    ↓
[Briefing Form] → Supabase
    ↓
[Research Agent] → Google Scholar + YouTube + Web
    ↓
[Synthesis Agent] → NotebookLM-like analysis
    ↓
[Outline Agent] → Estructura de módulos
    ↓
[Script Writer Agent] → Roteiros humanizados
    ↓
[Parallel Processes]
    ├─ [Avatar Renderer] → HeyGen API
    ├─ [Voice Synth] → Elevelabs API
    ├─ [Image Generator] → Flux Pro
    └─ [Design Agent] → Gráficos + layout
    ↓
[Video Composer] → FFmpeg (layers)
    ↓
[Quality Check Agent] → Review + humanize
    ↓
[Delivery] → MP4 + SRT + docs + CDN push
    ↓
User Dashboard + Download/Publish
```

---

## 5. PIPELINE DE PRODUÇÃO (7 ESTÁGIOS) {#pipeline-de-produção}

### Estágio 1: INGESTION & RESEARCH (Agent: ResearchForge)
**Input:** Briefing do usuário + URLs/arquivos
**Output:** Knowledge base sintetizada
**Tempo:** 15-30 min

```typescript
interface ResearchInput {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // horas
  sourceUrl?: string;
  sourceType?: 'youtube' | 'notion' | 'pdf' | 'article';
  targetAudience?: string;
}

// Process:
1. Web scrape + parse documentos
2. YouTube transcripts (ytdl-core)
3. Google Scholar search (academic-research-api)
4. Sintetizar com Claude: extrair insights únicos, estruturar argumentação
5. Gerar "Knowledge Graph" em JSON
6. Armazenar em Supabase + cache Redis
```

**Agentes Envolvidos:**
- 🤖 **Research Synthesizer** — Claude Sonnet (busca + análise)
- 🤖 **Source Validator** — Gemini (verificar credibilidade)

---

### Estágio 2: OUTLINE GENERATION (Agent: CurriculumArchitect)
**Input:** Knowledge base do Estágio 1
**Output:** Estrutura de módulos + aulas + objetivos
**Tempo:** 10-15 min

```json
{
  "courseId": "uuid",
  "title": "...",
  "description": "...",
  "modules": [
    {
      "id": "mod-1",
      "title": "Fundamentos",
      "duration": "45 min",
      "lessons": [
        {
          "id": "les-1-1",
          "title": "O que é?",
          "duration": "12 min",
          "learningObjectives": ["..."],
          "keyTakeaways": ["..."]
        }
      ]
    }
  ]
}
```

**Regras de Estruturação:**
- Máx 20h: 5 módulos × 4-5 aulas
- Máx 10h: 4 módulos × 3-4 aulas
- Máx 5h: 3 módulos × 2-3 aulas
- Mín 2h: 2 módulos × 2 aulas
- Cada aula: 8-15 min

**Agentes Envolvidos:**
- 🤖 **Curriculum Designer** — Claude Sonnet (estrutura pedagógica)
- 🤖 **Learning Path Optimizer** — Gemini (sequência progressiva)

---

### Estágio 3: SCRIPT GENERATION (Agent: ScriptMaster)
**Input:** Outline + Knowledge base
**Output:** Roteiro humanizado por aula (1-3 páginas)
**Tempo:** 20-40 min (paralelo para todas as aulas)

```markdown
# Aula 1.1: O que é React?
**Duração:** 12 min

## Abertura (0-30s)
[CAMERA: Close-up, Sorriso natural]
FALA: "Oi pessoal! Tá tudo bem? Hoje a gente vai entender 
        exatamente o que é React e por que tantas empresas 
        usam. Prometo que fica bem mais claro do que parece."

[GRAPHIC: Título + Logo React — fade in suave]

## Bloco 1: Contexto (30s-4min)
[CAMERA: Wide shot, gestos naturais]
FALA: "Pensa comigo... quantos sites você visita que têm 
        interface linda, rápida, que responde super bem? 
        Gmail, Netflix, Facebook... pois é. Quase tudo usa React."

[GRAPHIC: Timeline — jQuery (2006) → AngularJS (2010) → React (2013)]

[PAUSE: 3 segundos — respire, deixa informação processar]

## [Continua...]
```

**HUMANIZAÇÃO CRÍTICA:**
- ❌ Não usar: "Vamos aprender o conceito de X"
- ✅ Usar: Linguagem coloquial, pausas naturais, emojis de pensamento
- 🎭 Persona: Amigo experiente que explica, não professor robotizado
- 💬 Diálogos internos: "você pode estar pensando..."
- 📊 Histórias: "Um dia eu tive esse problema..."

**Agentes Envolvidos:**
- 🤖 **Script Architect** — Claude Sonnet (estrutura cena a cena)
- 🤖 **Voice Humanizer** — Gemini (remover padrões de IA, tom natural)
- 🤖 **Storyteller** — Claude (adicionar narrativa + gancho emocional)

---

### Estágio 4: VOICE & AVATAR (Parallel Processes)
**Input:** Scripts do Estágio 3
**Output:** Vídeo com avatar + narração sincronizada
**Tempo:** 20-40 min (async, em paralelo)

#### 4A: Voice Synthesis (Elevelabs / ElevenLabs)
```typescript
interface VoiceOptions {
  voice_id: string; // 'Rachel', 'Paulo' (PT-BR), etc
  stability: 0.7; // natural variation
  similarity_boost: 0.85;
  language: string;
  accent?: string; // 'carioca', 'paulista', 'neutro'
}

// Elevelabs API:
POST /text-to-speech
  script: string,
  voice_options: VoiceOptions
  → Returns: MP3 + timing data (phoneme alignment)
```

**Opções de Voz:**
- 🎙️ Elevelabs: ~90 vozes em PT-BR (mulher/homem, tons diversos)
- 🎙️ Alternativa: User upload própria voz (local)
- 🎙️ Premium: Voz clonada do usuário (training de 5 min)

#### 4B: Avatar Rendering (HeyGen API)
```typescript
interface AvatarOptions {
  avatarId: string; // 'amy', 'josh', custom_id
  voiceId: string; // sync com Elevelabs
  scriptUrl: string; // S3/Supabase path
  backgroundColor: string;
  cameraAngle: 'center' | 'left' | 'right';
  facialExpressions: boolean; // true = natural reactions
}

// HeyGen API:
POST /avatars/talk
  → Returns: video URL (1080p, 24fps)
  → Armazena em Cloudflare R2
```

**Avatar Styles:**
- 👩 Professora formal (óculos, postura)
- 👨 Cara descontraído (gestos, sorrisos)
- 👴 Mentor sábio (calmo, acolhedor)
- 👩‍💼 Executiva (profissional, direto)
- Custom: Upload de foto do usuário (deepfake soft)

**Agentes Envolvidos:**
- 🤖 **Voice Director** — Instruction set para Elevelabs (pacing, emotion)
- 🤖 **Avatar Configurator** — Seleção + sync de pose/expression com script

---

### Estágio 5: GRAPHICS & DESIGN (Agent: VisualForge)
**Input:** Script + Outline
**Output:** Imagens, gráficos, animações
**Tempo:** 15-30 min (paralelo)

#### 5A: Concept Images (Flux Pro via Fal.ai)
```typescript
interface ImagePrompt {
  concept: string; // "React component hierarchy"
  style: 'modern' | 'minimalist' | 'dark_tech' | 'colorful';
  dimensions: '16:9' | '9:16' | '1:1';
  quality: 'standard' | 'premium';
}

// Fal.ai Flux Pro:
POST /flux/generate
  prompt: "Diagrama limpo de React component tree, 
           estilo minimalist, cores azul e branco"
  → PNG 4K high-quality
```

**Fontes de Visual:**
- 🖼️ Flux Pro (IA generativa — conceitos únicos)
- 🖼️ Pexels/Pixabay (b-roll gratuito)
- 📊 Plotly/D3.js (gráficos interativos renderizados)
- 🎨 Lottie animations (transições suaves)

#### 5B: Dynamic Graphics (D3.js / Plotly)
```javascript
// Exemplo: Gráfico de crescimento em tempo real
const data = [
  { year: 2020, usage: 15 },
  { year: 2021, usage: 35 },
  { year: 2022, usage: 62 },
  { year: 2023, usage: 88 },
];

// Renderizar como SVG animado
// Frame por frame → PNG sequence → FFmpeg
```

#### 5C: Text Overlays (Subtitle Design)
```
Regras de Design:
- Sans-serif (Poppins, Inter, Montserrat)
- Max 4 palavras por linha
- Contraste 7:1 (WCAG AAA)
- Sombra leve para legibilidade
- Cor: Primária do curso ou branco
- Posição: Terço inferior (não obstrui face avatar)
```

**Agentes Envolvidos:**
- 🤖 **Visual Director** — Claude (estratégia visual por aula)
- 🤖 **Graphic Generator** — Flux Pro prompts + Plotly specs
- 🤖 **Layout Optimizer** — Geometria/composição visual

---

### Estágio 6: VIDEO COMPOSITION (Agent: CinemaForge)
**Input:** Avatar (MP4) + Graphics (PNG/SVG) + Voice (MP3) + B-roll (MP4)
**Output:** Vídeo final renderizado (MP4 1080p)
**Tempo:** 15-30 min (FFmpeg, em Railway container)

#### 6A: FFmpeg Pipeline
```bash
# Complexo filterchain (example)
ffmpeg \
  -i avatar.mp4 \
  -i graphics.png \
  -i voice.mp3 \
  -i bgm.mp3 \
  -filter_complex "
    [0] scale=1920:1080 [av];
    [1] scale=500:400 [gr];
    [av][gr] overlay=x=1200:y=600:enable='between(t,0,5)' [v1];
    [3] aformat=sample_rates=44100 [mus];
    [2] aformat=sample_rates=44100 [narr];
    [narr][mus] amix=inputs=2:duration=first [a];
    [v1] fps=24 [vfinal];
  " \
  -map "[vfinal]" -map "[a]" \
  -c:v libx264 -crf 18 -preset slow \
  -c:a aac -b:a 192k \
  output.mp4
```

**Operações:**
1. **Sincronização:** Align avatar start com voice (sample-accurate)
2. **Composição de layers:** Avatar (principal) + gráficos (overlay)
3. **Transições:** Fade/dissolve entre scenes (250ms)
4. **Audio mixing:** Voice (primário) + BGM (fundo suave)
5. **Efeitos:** Zoom leve, color correction, vignette
6. **Encoding:** H.264, CRF 18 (high quality), 24fps ou 30fps

#### 6B: Parallel Export
```
Formatos de saída:
- MP4 1080p 24fps (upload)
- MP4 720p 30fps (mobile/preview)
- WebM VP9 (fallback em alguns players)
- HLS m3u8 (streaming adaptativo)
```

**Agentes Envolvidos:**
- 🤖 **Timing Synchronizer** — Alinhamento áudio/vídeo pixel-perfect
- 🤖 **Color Grader** — Cor, contraste, brilho (Netflix-like)
- 🤖 **FX Engineer** — Transições, efeitos suaves

---

### Estágio 7: DELIVERY & OPTIMIZATION (Agent: DeliveryMaster)
**Input:** Vídeos + Scripts + Metadados
**Output:** Curso pronto para venda
**Tempo:** 5-10 min

#### 7A: Post-Production
```
✓ Geração de SRT (legendas automáticas via Deepgram/Whisper)
✓ Thumbnail do YouTube (IA + design)
✓ Descrição otimizada SEO
✓ Tags + categorias (Udemy, Hotmart)
✓ Material suplementar (PDF, planilhas)
✓ Email de boas-vindas automático (template)
```

#### 7B: Publishing Options
```
[ ] Hotmart (click para publicar)
[ ] Udemy (upload automático)
[ ] Teachable (API integration)
[ ] Podia (webhook)
[ ] Download local (ZIP)
```

#### 7C: Analytics Ready
```
Dashboard mostra:
- Duração total do curso
- Número de aulas
- Tamanho total (GB)
- Tempo de processamento real
- Custo estimado (baseado em usage)
- Link de preview (24h válido)
```

**Agentes Envolvidos:**
- 🤖 **SEO Optimizer** — Descrição + keywords (Ahrefs-like)
- 🤖 **Thumbnail Designer** — Fal.ai + composition logic
- 🤖 **Publish Orchestrator** — Hotmart/Udemy/Teachable APIs

---

## 6. AGENTES IA ESPECIALIZADOS {#agentes-ia-especializados}

### Mapa de Agentes (13 no total)

| # | Agente | Função | LLM | Entrada | Saída | Tempo |
|---|--------|--------|-----|---------|-------|-------|
| 1 | **ResearchForge** | Web search + síntese | Sonnet 4 | URLs + tema | JSON knowledge base | 15-30m |
| 2 | **SourceValidator** | Credibilidade de fonte | Gemini 2.0 | Fonte + contexto | Score + justificativa | 2-5m |
| 3 | **CurriculumArchitect** | Estrutura de módulos | Sonnet 4 | Knowledge base | Outline JSON | 10-15m |
| 4 | **LearningOptimizer** | Sequência pedagógica | Gemini 2.0 | Outline | Reorder + feedbacks | 5-10m |
| 5 | **ScriptArchitect** | Roteiro cena-a-cena | Sonnet 4 | Aula + contexto | Markdown script | 5-10m/aula |
| 6 | **VoiceHumanizer** | Remover padrões IA | Gemini 2.0 | Script | Humanized text | 3-5m/aula |
| 7 | **Storyteller** | Narrativa + emoção | Sonnet 4 | Script + dados | Emotionally-rich script | 5-8m/aula |
| 8 | **VoiceDirector** | Instruções para ElevenLabs | Gemini 2.0 | Script | Voice tags (pause, emphasis) | 2-3m/aula |
| 9 | **AvatarConfigurator** | Pose + expressão | Gemini 2.0 | Script + persona | HeyGen directives | 2-3m/aula |
| 10 | **VisualDirector** | Estratégia visual | Sonnet 4 | Script + tema | Visual concepts doc | 10-15m |
| 11 | **GraphicGenerator** | Prompts Flux + Plotly | Gemini 2.0 | Conceitos visuais | Specs + prompts | 5-10m |
| 12 | **LayoutOptimizer** | Composição visual | Gemini 2.0 | Mockups | Geometry/spacing | 5-8m |
| 13 | **TimingSynchronizer** | Sync áudio/vídeo | Custom (não-IA) | MP4 + MP3 + timeline | FFmpeg commands | 5-10m/aula |
| 14 | **ColorGrader** | Cor + contraste | Gemini 2.0 | Raw video | ffmpeg color params | 3-5m |
| 15 | **SEOOptimizer** | Descrição + keywords | Gemini 2.0 | Outline + title | Optimized description | 3-5m |
| 16 | **ThumbnailDesigner** | Thumbnail YouTube | Gemini 2.0 | Course theme | Flux prompt + specs | 5-10m |
| 17 | **PublishOrchestrator** | Multi-platform publish | Gemini 2.0 | Course + settings | Publish logs | 2-3m |

### Exemplo: ScriptArchitect em Detalhes

```typescript
// Sistema de Prompting Hierárquico

const SCRIPT_ARCHITECT_SYSTEM = `
Você é um especialista em roteiro educativo que escreve como um HUMANO REAL,
não como IA. Sua tarefa é criar roteiros para aulas de 8-15 minutos que:

1. LINGUAGEM
   - Use linguagem coloquial (como um amigo explicando)
   - Contragões naturais: "tá", "pra", "tá vendo", "saca?"
   - Pausas escritas: [PAUSA 2s] para respirar/processar
   - Diálogos internos: "Você pode estar pensando..."
   - Humor leve e apropriado ao tema

2. ESTRUTURA
   - Abertura (30s): Hook + promessa do que vai aprender
   - Contexto (2-3 min): Por que isso importa / problema
   - Conceito principal (4-6 min): Core content, com exemplos
   - Aplicação prática (2-3 min): Como usar no mundo real
   - Encerramento (30s): Recap + próximo passo + call-to-action

3. INDICAÇÕES DE CÂMERA
   - [CAMERA: Close-up, sorriu natural] — confiança
   - [CAMERA: Wide shot, gestos] — energia, movimento
   - [CAMERA: Zoom in lento] — ênfase, importância
   - [PAUSE: Olha para câmera silenciosamente 2s] — deixa "bater"

4. GRÁFICOS & TEXTO
   - [GRAPHIC: Diagrama X com transição fade-in] — timing
   - [TEXT: "Conceito Principal" em 3 palavras máx] — legibilidade
   - [B-ROLL: Pessoas usando o produto IRL] — context

5. HUMANIZAÇÃO
   - ❌ "Vamos aprender o conceito de X"
   - ✅ "Sabe aquele momento em que..."
   - ❌ "De acordo com a literatura..."
   - ✅ "Tem um estudo da Harvard que mostrou..."
   - ❌ "O procedimento é o seguinte"
   - ✅ "Aqui está o truque que eu descobri..."

Entrega em Markdown com estrutura clara.
`;

// Prompt específico por aula
const generateScriptForLesson = async (lesson: {
  title: string;
  duration: number; // minutos
  objectives: string[];
  keyTakeaways: string[];
  context: string; // knowledge base síntese
}) => {
  const prompt = \`
    Crie um roteiro para esta aula:
    
    Título: \${lesson.title}
    Duração: \${lesson.duration} min
    Objetivos:
    \${lesson.objectives.map(o => \`- \${o}\`).join('\n')}
    
    Contexto (síntese de pesquisa):
    \${lesson.context}
    
    Regras obrigatórias:
    1. Linguagem 100% coloquial e humanizada
    2. Inclua [CAMERA], [GRAPHIC], [PAUSE] tags
    3. Estrutura clássica de aula (abertura-contexto-conceito-aplicação-encerre)
    4. Mínimo 2 histórias pessoais ou exemplos do mundo real
    5. Tom: amigo experiente, NÃO professor formal
    
    Entregue em Markdown puro, sem explicações extras.
  \`;
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SCRIPT_ARCHITECT_SYSTEM,
    messages: [{ role: "user", content: prompt }]
  });
  
  return response.content[0].type === 'text' ? response.content[0].text : '';
};
```

### Exemplo: VoiceHumanizer em Ação

```typescript
const VOICE_HUMANIZER_SYSTEM = `
Você é um editor de voz que transforma roteiros automáticos em roteiros humanizados.
Sua tarefa é:

1. Detectar padrões típicos de IA:
   ❌ "Vamos explorar o conceito de..."
   ❌ "De acordo com especialistas..."
   ❌ "Neste segmento, discutiremos..."
   ❌ "É importante notar que..."
   ❌ "Em conclusão..."

2. Converter para linguagem natural:
   ✅ "Bora mergulhar em..."
   ✅ "Tem um cara que falou sobre isso..."
   ✅ "Aqui tem um detalhe maneiro..."
   ✅ "Ó o negócio aí..."
   ✅ "Então é isso..."

3. Adicionar sinais de humanidade:
   + Contragões ("tá", "pra", "tava")
   + Interjeições ("cara", "mano", "ó")
   + Hesitações naturais ("tipo", "sabe?", "sei lá")
   + Referências pessoais ("eu descobri", "me aconteceu")
   + Risadas ("haha", "[risos]")

4. JAMAIS remover conteúdo técnico
   - Apenas mudar o TOM, não a informação

Entrega: Script humanizado em Markdown
`;

const humanizeScript = async (script: string) => {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022", // Gemini alternativa
    max_tokens: 2000,
    system: VOICE_HUMANIZER_SYSTEM,
    messages: [
      { 
        role: "user", 
        content: \`Humanize este script:\n\n\${script}\` 
      }
    ]
  });
  
  return response.content[0].type === 'text' ? response.content[0].text : '';
};
```

---

## 7. INTEGRAÇÕES E TECNOLOGIAS {#integrações-e-tecnologias}

### Integrações Críticas

#### 1. Search & Research
- **Google Scholar API** — papers acadêmicos
- **YouTube Data API** — encontrar vídeos + transcripts
- **Serp.com** ou **SerpAPI** — Google search results
- **Jina.ai** — Web scraping em markdown limpo

#### 2. Voice & Avatar
- **ElevenLabs API**
  - ~90 vozes PT-BR
  - Voice cloning (5-15 min treino)
  - Multilingual (EN, ES, FR, DE)
  - Pricing: $0.30/1000 caracteres

- **HeyGen API**
  - Avatar avatars humanizados
  - Custom avatar upload (face)
  - Lip-sync automático
  - Pricing: $100/1000 vídeos

#### 3. Image Generation
- **Fal.ai Flux Pro**
  - Latência: 3-8s por imagem
  - Qualidade: 4K
  - Pricing: $0.05-0.15/imagem
  - Alternativa: Midjourney API

#### 4. Video Processing
- **FFmpeg (local/Railway)**
  - Composição de layers
  - Encoding otimizado
  - Sincronização áudio
  - Zero custo (open source)

#### 5. Transcription & Subtitles
- **Deepgram API** ou **Assembly.ai**
  - Transcrição automática (whisper)
  - Geração SRT automática
  - Pricing: $0.0043/min

#### 6. Publishing Platforms
- **Hotmart** (JWT webhook)
- **Udemy API** (curso listing)
- **Teachable** (SCORM package)
- **Podia** (webhook)

---

## 8. ESTRATÉGIA DE "HUMAN-LIKE OUTPUT" {#estratégia-humanização}

### O Desafio
Conteúdo gerado por IA frequentemente:
- ❌ Usa palavras repetidas
- ❌ Tem estrutura previsível
- ❌ Falta autenticidade emocional
- ❌ Parece "robô lendo"

### Solução: Pipeline de Humanização em 3 Camadas

#### Camada 1: Design de Prompting
```
Sistema Message Structure:
1. System prompt: Persona humanizada (amigo, mentor, etc)
2. Few-shot examples: 3-5 exemplos de output humanizado
3. Explicit constraints: "Use contragões", "Adicione pausas", etc
4. Output format: Markdown com tags de direção
```

#### Camada 2: Post-Processing Automático
```typescript
const humanizeOutput = async (rawScript: string) => {
  // Passe 1: VoiceHumanizer agent
  let humanized = await enhanceHumanity(rawScript);
  
  // Passe 2: Storyteller agent (adicionar narrativas)
  humanized = await addNarrative(humanized);
  
  // Passe 3: Keyword extractor (remover repetições)
  humanized = await reduceRepetition(humanized);
  
  return humanized;
};
```

#### Camada 3: Human Review (Gamified)
```
Interface de aprovação/refinement:
- Usuário assiste preview da aula (2-3 min)
- Marca trechos que parecem "IA-like"
- Sistema rota para re-humanização
- 1-click refinement antes de publicar
- Feedback treina modelo local (personalização)
```

### Exemplo: Antes vs Depois

```markdown
❌ ANTES (IA pura):
"De acordo com estudiosos, a neurociência demonstra que o cérebro 
humano processa informações visuais 60 mil vezes mais rápido que 
informação textual. Portanto, é fundamental incorporar elementos 
visuais em estratégias educacionais modernas."

✅ DEPOIS (humanizado):
"Tem um estudo bem interessante da MIT que mostrou uma coisa: 
nosso cérebro processa imagens 60 mil vezes mais rápido que texto. 
[PAUSA 2s] Tipo, é MUITO mais rápido. Por isso que Netflix funciona, 
sabe? Instagram explodiu. As pessoas querem VER, não ler. 
[Aponta para câmera] E a gente vai usar isso aqui no curso."
```

---

## 9. MODELOS DE NEGÓCIO {#modelos-de-negócio}

### Opção A: B2C (Creator-Focused)
**Target:** Influenciadores, YouTubers, educadores individuais

```
Planos:
┌─────────────────────────────────────────────────────┐
│ FREE                                                  │
│ - 1 curso/mês                                        │
│ - Avatares padrão                                    │
│ - Watermark NexoCourses                              │
│ R$0/mês                                              │
├─────────────────────────────────────────────────────┤
│ STARTER                                              │
│ - 3 cursos/mês                                       │
│ - Avatares ilimitados                                │
│ - Sem watermark                                      │
│ - Suporte email                                      │
│ - Export MP4 + SRT                                   │
│ R$97/mês (anual) | R$129/mês                         │
├─────────────────────────────────────────────────────┤
│ PRO                                                  │
│ - 10 cursos/mês                                      │
│ - Voice cloning (2)                                  │
│ - API access (limite)                                │
│ - Premium avatars                                    │
│ - Suporte prioritário                                │
│ - SCORM export (Moodle/LMS)                          │
│ R$297/mês (anual) | R$397/mês                        │
├─────────────────────────────────────────────────────┤
│ ENTERPRISE                                           │
│ - Cursos ilimitados                                  │
│ - Marca branca (custom logo)                         │
│ - Integração Hotmart/Udemy automática                │
│ - API access (unlimited)                             │
│ - Voice cloning ilimitado                            │
│ - Suporte 24/7                                       │
│ - Analytics customizado                              │
│ R$997/mês (anual) | Contato                          │
└─────────────────────────────────────────────────────┘

Receita Mensal Estimada (100 users Starter):
R$97 × 100 × 0.8 (churn 20%) = R$7,760/mês
+ Tier up para Pro: 20% → R$297 × 20 × 0.9 = R$5,346
Total: ~R$13K/mês @ escala inicial
```

### Opção B: B2B (Enterprise)
**Target:** Universidades, corporações, plataformas de e-learning

```
SaaS de API:
- Integração marca branca
- Webhooks para LMS (Moodle, Blackboard, Canvas)
- Suporte dedicado
- Custom avatars
- Pricing: R$2K-10K/mês baseado em volume

Exemplo: Universidade gerando 50 cursos/semestre
→ Paga R$5K/mês
→ Economiza ~R$200K em produção manual
→ ROI: ~40x
```

### Opção C: Marketplace / Revenue Share
**Modelo:** Usuários vendem cursos via NexoCourses marketplace

```
Split:
- Criador:  70% da receita bruta
- Plataforma: 30%

Exemplo: Curso vendido por R$97
- Criador recebe: R$68
- NexoCourses: R$29

Escala: 500 cursos × R$97 × 30 vendas = R$1.4M/mês (30%)
```

---

## 10. ROADMAP DE IMPLEMENTAÇÃO {#roadmap}

### Fase 1: MVP (8-12 semanas)
```
Semana 1-2:
  □ Setup infraestrutura (Railway, Supabase, Storage)
  □ Auth básico (Supabase)
  □ Briefing form (React frontend)

Semana 3-4:
  □ Research agent (Google Scholar API + web scraping)
  □ Outline generation (Claude Sonnet)
  □ Database schema (courses, modules, lessons, jobs)

Semana 5-6:
  □ Script generation (ScriptArchitect agent)
  □ Voice humanizer (VoiceHumanizer agent)
  □ ElevenLabs integration

Semana 7-8:
  □ HeyGen integration (avatar rendering)
  □ Fal.ai Flux (image generation)
  □ Basic FFmpeg composition

Semana 9-10:
  □ Video composition pipeline (complete)
  □ Deepgram integration (transcripts)
  □ Dashboard com progresso de jobs

Semana 11-12:
  □ Export options (MP4, SRT, PDF)
  □ Hotmart integration (webhook)
  □ Public launch + onboarding

MVP Output: Curso simples (1 módulo × 3 aulas) em ~2-3 horas
```

### Fase 2: Early Access (4-6 semanas)
```
□ Beta testing com 50 creators
□ Feedback loop → refinamento de agentes
□ Suporte manual (não automático)
□ Case studies + depoimentos
□ Landing page de conversão
□ Pricing A/B testing

Target: 100+ usuários ativos
```

### Fase 3: Scale (Ongoing)
```
□ Voice cloning (HeyGen + ElevenLabs)
□ Udemy + Teachable integrations
□ Advanced analytics
□ Comunidade de creators
□ Referral program
□ Affiliate marketplace
□ API public
□ Marca branca (white-label)

Target: R$100K+ MRR
```

---

## 11. ESTIMATIVAS DE TEMPO E CUSTO {#estimativas}

### Tempo de Desenvolvimento

| Componente | Horas | Quem |
|---|---|---|
| Arquitetura + setup | 16h | DevOps/Lead |
| Frontend (React) | 80h | Frontend dev |
| Backend (Node.js) | 120h | Backend dev |
| Agentes IA (13x) | 160h | IA specialist |
| Integrações (6x) | 80h | Integration dev |
| FFmpeg pipeline | 60h | Video eng |
| Testing + QA | 60h | QA + Lead |
| DevOps + Deploy | 40h | DevOps |
| **TOTAL** | **616h** | **2-3 devs × 3 meses** |

### Custo de Infraestrutura (Mensal)

| Serviço | Uso Estimado | Custo/mês |
|---|---|---|
| Railway (Node + Postgres) | Medium | R$200 |
| Supabase (Storage + Auth) | 10GB | R$250 |
| Vercel (frontend) | High traffic | R$100 |
| Cloudflare R2 (videos) | 1TB | R$150 |
| ElevenLabs (voice) | 1M chars/mês | R$300 |
| HeyGen (avatars) | 500 vídeos | R$50 |
| Fal.ai (imagens) | 1000 images | R$100 |
| Deepgram (transcrição) | 100h áudio | R$50 |
| Google Scholar/YouTube APIs | Included | R$0 |
| n8n (automações) | Self-hosted | R$0 |
| **TOTAL** | | ~**R$1,200/mês** |

### Custo por Curso Gerado (ao usuário)

```
Breakdown:
- ElevenLabs (10 aulas × 300 chars avg): R$3
- HeyGen (10 videos × $0.10): R$1
- Fal.ai (15 imagens × $0.10): R$1.50
- Deepgram (60 min audio): R$0.26
- Cloudflare (150MB video upload): R$0.02
- Compute (processing): ~$0.50
- Margin (40%): R$3
────────────────────────────────
CUSTO TOTAL: ~R$9 por curso
PREÇO AO USUÁRIO: R$29-300 (subscription model)
GROSS MARGIN: 95%+
```

### Exemplo de Unit Economics

```
Cenário: 500 usuários ativos (Starter tier)

Receita (B2C):
  500 users × R$97/mês × 0.8 (churn) = R$38,800
  + 100 Pro users × R$297 × 0.85 = R$25,245
  Total Receita Bruta = R$64,045/mês

Custos:
  Infraestrutura:          R$1,200
  Agentes IA (10% Claude): R$2,000
  Payment processor (5%):   R$3,202
  Support (2 FTE):         R$6,000
  Marketing:               R$5,000
  Other (misc):            R$2,000
  Total Custos:            R$19,402

Net Margin: R$44,643/mês (69.7%)
Break-even: ~150 users @ Starter tier
```

---

## CONCLUSÃO E PRÓXIMOS PASSOS

### Viabilidade: ✅ MUITO ALTA
- Mercado: R$5B+ em e-learning no Brasil
- Tecnologia: Totalmente viável com stack existente
- Diferencial: "Parece humano" é chave (competitors falham nisso)
- Timing: Educação + IA está em boom

### Recomendação
1. **Começar com Fase 1 MVP** (8-12 semanas, 2 devs)
2. **Focar em humanização** (3 agentes principais: ScriptArchitect, VoiceHumanizer, Storyteller)
3. **Validar com 20-50 beta testers** antes de scaling
4. **Integrar com Hotmart** ASAP (receita no dia 1)
5. **Usar infra Railway + Supabase** (alinhado ao DB8 ecosystem)

### Arquivos Necessários (próxima fase)
- [ ] Database schema (Supabase SQL)
- [ ] API spec (OpenAPI 3.0)
- [ ] Frontend component library (shadcn/ui)
- [ ] Agent prompts (sistema de library)
- [ ] FFmpeg config (Rails container)
- [ ] Deployment checklist (Vercel + Railway)

---

**Próximo passo:** Quer que eu detalle a implementação técnica da Fase 1 ou crie os primeiros agentes IA?
