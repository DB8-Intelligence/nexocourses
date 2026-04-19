import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

interface CourseStructureInput {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationHours: number;
  knowledgeBase: string; // synthesis from ResearchForge
}

export interface LessonSpec {
  id: string;
  title: string;
  duration: number; // minutes
  learningObjectives: string[];
  keyTakeaways: string[];
  description: string;
  order: number;
}

export interface ModuleSpec {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  lessons: LessonSpec[];
  order: number;
}

export interface CourseStructure {
  courseId: string;
  title: string;
  description: string;
  modules: ModuleSpec[];
  totalDuration: number; // minutes
  pedagogyApproach: string;
}

// Regras de estruturação baseadas em duração
const STRUCTURE_RULES = {
  '2h': {
    modules: 2,
    lessonsPerModule: 2,
    lessonDuration: 30,
  },
  '5h': {
    modules: 3,
    lessonsPerModule: 3,
    lessonDuration: 25,
  },
  '10h': {
    modules: 4,
    lessonsPerModule: 4,
    lessonDuration: 25,
  },
  '20h': {
    modules: 5,
    lessonsPerModule: 5,
    lessonDuration: 25,
  },
};

class CurriculumArchitect {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }

  async designCurriculum(
    input: CourseStructureInput
  ): Promise<CourseStructure> {
    logger.info({ input }, 'Designing curriculum');

    try {
      // Get structure rules based on duration
      const rules = this.getStructureRules(input.durationHours);

      // Generate structure with Claude
      const structure = await this.generateStructure(input, rules);

      logger.info(
        {
          topic: input.topic,
          modules: structure.modules.length,
          totalDuration: structure.totalDuration,
        },
        'Curriculum designed'
      );

      return structure;
    } catch (error) {
      logger.error({ err: error, input }, 'Curriculum design failed');
      throw error;
    }
  }

  private getStructureRules(
    durationHours: number
  ): (typeof STRUCTURE_RULES)[keyof typeof STRUCTURE_RULES] {
    if (durationHours <= 2) return STRUCTURE_RULES['2h'];
    if (durationHours <= 5) return STRUCTURE_RULES['5h'];
    if (durationHours <= 10) return STRUCTURE_RULES['10h'];
    return STRUCTURE_RULES['20h'];
  }

  private async generateStructure(
    input: CourseStructureInput,
    rules: (typeof STRUCTURE_RULES)[keyof typeof STRUCTURE_RULES]
  ): Promise<CourseStructure> {
    const prompt = `You are an expert course curriculum designer. Design a course structure for:

Topic: ${input.topic}
Level: ${input.level}
Total Duration: ${input.durationHours} hours
Target Modules: ${rules.modules}
Lessons per Module: ${rules.lessonsPerModule}

Knowledge Base/Context:
${input.knowledgeBase}

Requirements:
1. Create ${rules.modules} modules with progressive difficulty
2. Each module should have ${rules.lessonsPerModule} lessons
3. Each lesson should be approximately ${rules.lessonDuration} minutes
4. Use progressive pedagogy for ${input.level} level
5. Include clear learning objectives and takeaways for each lesson
6. Ensure smooth transitions between modules and lessons

Please respond in JSON format:
{
  "courseTitle": "string",
  "courseDescription": "string",
  "pedagogyApproach": "string",
  "modules": [
    {
      "title": "string",
      "description": "string",
      "lessons": [
        {
          "title": "string",
          "duration": number,
          "learningObjectives": ["string"],
          "keyTakeaways": ["string"],
          "description": "string"
        }
      ]
    }
  ]
}`;

    const message = await this.client.messages.create({
      model: config.anthropic.model,
      max_tokens: 4000,
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

    let structureData: {
      courseTitle: string;
      courseDescription: string;
      pedagogyApproach: string;
      modules: Array<{
        title: string;
        description: string;
        lessons: Array<{
          title: string;
          duration: number;
          learningObjectives: string[];
          keyTakeaways: string[];
          description: string;
        }>;
      }>;
    };

    try {
      const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      structureData = JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error({ err: error }, 'Failed to parse curriculum JSON');
      throw error;
    }

    // Build structured course
    const courseId = uuidv4();
    const modules: ModuleSpec[] = structureData.modules.map(
      (mod, modIndex) => ({
        id: uuidv4(),
        title: mod.title,
        description: mod.description,
        duration: mod.lessons.reduce((sum, l) => sum + l.duration, 0),
        lessons: mod.lessons.map((les, lesIndex) => ({
          id: uuidv4(),
          title: les.title,
          duration: les.duration,
          learningObjectives: les.learningObjectives,
          keyTakeaways: les.keyTakeaways,
          description: les.description,
          order: lesIndex + 1,
        })),
        order: modIndex + 1,
      })
    );

    const totalDuration = modules.reduce(
      (sum, m) => sum + m.duration,
      0
    );

    return {
      courseId,
      title: structureData.courseTitle,
      description: structureData.courseDescription,
      modules,
      totalDuration,
      pedagogyApproach: structureData.pedagogyApproach,
    };
  }
}

export const curriculumArchitect = new CurriculumArchitect();
