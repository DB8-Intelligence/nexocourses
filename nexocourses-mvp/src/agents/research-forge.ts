import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

interface ResearchInput {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  sourceUrl?: string;
  targetAudience?: string;
}

interface KnowledgeBase {
  topic: string;
  sources: Array<{
    type: 'web' | 'youtube' | 'scholar' | 'user';
    title: string;
    url: string;
    content: string;
  }>;
  insights: string[];
  keyPoints: string[];
  synthesis: string;
  lastUpdated: string;
}

class ResearchForge {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }

  async research(input: ResearchInput): Promise<KnowledgeBase> {
    logger.info({ input }, 'Starting research for topic');

    try {
      // Step 1: Gather sources (mock for MVP — seria real search em prod)
      const sources = await this.gatherSources(input);

      // Step 2: Synthesize with Claude
      const synthesis = await this.synthesizeWithClaude(
        input.topic,
        sources,
        input.level
      );

      // Step 3: Extract key points
      const keyPoints = await this.extractKeyPoints(
        input.topic,
        sources,
        synthesis
      );

      const knowledgeBase: KnowledgeBase = {
        topic: input.topic,
        sources,
        insights: keyPoints,
        keyPoints: keyPoints.slice(0, 5),
        synthesis,
        lastUpdated: new Date().toISOString(),
      };

      logger.info(
        { topic: input.topic, sourcesCount: sources.length },
        'Research completed'
      );

      return knowledgeBase;
    } catch (error) {
      logger.error({ err: error, input }, 'Research failed');
      throw error;
    }
  }

  private async gatherSources(
    input: ResearchInput
  ): Promise<KnowledgeBase['sources']> {
    // MVP: Mock sources. Em produção, integrar com:
    // - Google Scholar API
    // - YouTube Data API + transcripts
    // - Web scraping (Jina.ai)

    const sources: KnowledgeBase['sources'] = [];

    // User-provided source
    if (input.sourceUrl) {
      sources.push({
        type: 'user',
        title: 'Provided by user',
        url: input.sourceUrl,
        content: `Content from ${input.sourceUrl}`,
      });
    }

    // Add mock sources for demonstration
    sources.push({
      type: 'web',
      title: `${input.topic} - Wikipedia`,
      url: 'https://en.wikipedia.org',
      content: `Overview and context about ${input.topic}`,
    });

    sources.push({
      type: 'youtube',
      title: `Top video about ${input.topic}`,
      url: 'https://youtube.com',
      content: `Transcript of popular video on ${input.topic}`,
    });

    return sources;
  }

  private async synthesizeWithClaude(
    topic: string,
    sources: KnowledgeBase['sources'],
    level: string
  ): Promise<string> {
    const sourcesText = sources
      .map((s) => `[${s.type.toUpperCase()}] ${s.title}: ${s.content}`)
      .join('\n\n');

    const prompt = `You are an expert course curriculum designer analyzing sources about: ${topic}

Target audience level: ${level}

Here are the sources to synthesize:
${sourcesText}

Please create a comprehensive synthesis that:
1. Identifies the most important concepts and relationships
2. Highlights unique insights and real-world applications
3. Suggests a logical learning progression
4. Notes any gaps or misconceptions to address
5. Points out engaging examples or case studies

Keep the synthesis focused, organized, and actionable for curriculum design.`;

    const message = await this.client.messages.create({
      model: config.anthropic.model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (message.content[0].type === 'text') {
      return message.content[0].text;
    }

    throw new Error('Unexpected response format from Claude');
  }

  private async extractKeyPoints(
    topic: string,
    sources: KnowledgeBase['sources'],
    synthesis: string
  ): Promise<string[]> {
    const prompt = `Based on this synthesis about ${topic}:

${synthesis}

Extract 10-15 key learning points that should be covered in a course. 
Format as a JSON array of strings, each representing one key point.
Focus on practical, actionable insights.`;

    const message = await this.client.messages.create({
      model: config.anthropic.model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (message.content[0].type === 'text') {
      try {
        const jsonMatch = message.content[0].text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        logger.warn(
          { err: error },
          'Failed to parse key points JSON'
        );
      }
    }

    return [];
  }
}

export const researchForge = new ResearchForge();
