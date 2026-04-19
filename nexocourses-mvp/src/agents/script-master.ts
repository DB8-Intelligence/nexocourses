import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

interface ScriptInput {
  lessonTitle: string;
  duration: number; // minutes
  learningObjectives: string[];
  keyTakeaways: string[];
  knowledgeBase: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tone?: 'formal' | 'friendly' | 'mentor' | 'energetic';
}

export interface ScriptOutput {
  markdown: string;
  estimatedDuration: number; // seconds
  cameraInstructions: string[];
  graphicPoints: string[];
  pausePoints: number; // count
}

const SCRIPT_SYSTEM_PROMPT = `You are an expert screenplay writer for educational videos that sound 100% HUMAN, not like AI.

YOUR RULES FOR SOUNDING HUMAN:
1. Use natural contractions: "tá", "pra", "tava", "pega aqui", "sabe?"
2. Add realistic hesitations: "tipo", "sabe aqui", "deixa eu pensar", "hum"
3. Include personal touches: "Eu descobri que...", "Teve um dia que...", "Aprendi isso do jeito difícil"
4. Use conversational structures: "Pensa comigo...", "Sente aqui...", "Bora ver um exemplo prático"
5. Never say: "Vamos aprender", "De acordo com a literatura", "Em conclusão"
6. Always say: "Saca só", "Aqui tem um negócio interessante", "E aí, bora lá", "Pra fechar..."

STRUCTURE (per minute of duration):
- Abertura (30s): Hook + Promessa
- Contexto (20% de tempo): Por que isso importa
- Conceito (50% de tempo): Core content com exemplos reais
- Aplicação (20% de tempo): Como usar agora
- Encerramento (30s): Recap + Próximo passo

CAMERA TAGS:
- [CAMERA: Close-up, sorriso natural] - Intimidade
- [CAMERA: Wide shot, gestos] - Energia
- [CAMERA: Zoom in lento] - Ênfase
- [PAUSE: 2s] - Deixar "bater"

GRAPHIC TAGS:
- [GRAPHIC: Diagrama X — fade in] - Quando inserir
- [TEXT: "3 palavras max"] - Legibilidade
- [B-ROLL: descrição] - Quando adicionar footage

Format response in Markdown with clear sections.`;

class ScriptMaster {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }

  async generateScript(input: ScriptInput): Promise<ScriptOutput> {
    logger.info(
      { lesson: input.lessonTitle, duration: input.duration },
      'Generating lesson script'
    );

    try {
      const markdown = await this.createScript(input);
      const estimatedDuration = this.estimateDuration(markdown);
      const cameraInstructions = this.extractCameraInstructions(markdown);
      const graphicPoints = this.extractGraphicPoints(markdown);
      const pausePoints = (markdown.match(/\[PAUSE:/g) || []).length;

      const output: ScriptOutput = {
        markdown,
        estimatedDuration,
        cameraInstructions,
        graphicPoints,
        pausePoints,
      };

      logger.info(
        {
          lesson: input.lessonTitle,
          duration: estimatedDuration,
        },
        'Script generated successfully'
      );

      return output;
    } catch (error) {
      logger.error(
        { err: error, lesson: input.lessonTitle },
        'Script generation failed'
      );
      throw error;
    }
  }

  private async createScript(input: ScriptInput): Promise<string> {
    const toneGuide = {
      formal:
        'Like a university professor but with human warmth',
      friendly: 'Like a close friend explaining something cool',
      mentor:
        'Like someone experienced sharing wisdom',
      energetic: 'Like an enthusiastic teacher full of energy',
    };

    const prompt = `Create a video script for this lesson:

LESSON INFO:
Title: ${input.lessonTitle}
Duration: ${input.duration} minutes
Level: ${input.level}
Tone: ${toneGuide[input.tone || 'friendly']}

LEARNING OBJECTIVES:
${input.learningObjectives.map((o) => `- ${o}`).join('\n')}

KEY TAKEAWAYS:
${input.keyTakeaways.map((t) => `- ${t}`).join('\n')}

KNOWLEDGE BASE:
${input.knowledgeBase}

INSTRUCTIONS:
1. Write ${input.duration} minutes of natural, human speech (roughly ${input.duration * 130} words)
2. Include [CAMERA], [GRAPHIC], [TEXT], and [PAUSE] tags where appropriate
3. Sound like a real person explaining, not a robot reading
4. Use contractions, casual language, personal references
5. Vary sentence length and structure
6. Add moments of emphasis with pauses
7. Include at least 2 real-world examples or stories
8. Format as clear sections with natural flow

Start writing the script now:`;

    const message = await this.client.messages.create({
      model: config.anthropic.model,
      max_tokens: 3000,
      system: SCRIPT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (message.content[0].type !== 'text') {
      throw new Error('Unexpected response format');
    }

    return message.content[0].text;
  }

  private estimateDuration(markdown: string): number {
    // Rough estimate: ~130 words per minute in speech
    const wordCount = markdown.split(/\s+/).length;
    return Math.round((wordCount / 130) * 60); // seconds
  }

  private extractCameraInstructions(markdown: string): string[] {
    const regex = /\[CAMERA:([^\]]+)\]/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(markdown)) !== null) {
      matches.push(`[CAMERA:${match[1]}]`);
    }

    return matches;
  }

  private extractGraphicPoints(markdown: string): string[] {
    const regex = /\[GRAPHIC:([^\]]+)\]|\[TEXT:([^\]]+)\]|\[B-ROLL:([^\]]+)\]/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(markdown)) !== null) {
      const point = match[1] || match[2] || match[3];
      if (point) {
        matches.push(point);
      }
    }

    return matches;
  }
}

export const scriptMaster = new ScriptMaster();
