import express, { type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { researchForge } from '../agents/research-forge.js';
import { curriculumArchitect } from '../agents/curriculum-architect.js';
import { scriptMaster } from '../agents/script-master.js';
import {
  scriptQueue,
  voiceQueue,
  avatarQueue,
  graphicsQueue,
  compositionQueue,
  deliveryQueue,
} from '../queue/index.js';

const router = express.Router();

interface BriefingPayload {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationHours: number;
  sourceUrl?: string;
  targetAudience?: string;
  style?: string;
  language?: string;
}

// POST /api/briefings - Create new course briefing
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      topic,
      level,
      durationHours,
      sourceUrl,
      targetAudience,
      style = 'friendly',
      language = 'pt-BR',
    } = req.body as BriefingPayload;

    // Validate input
    if (!topic || !level || !durationHours) {
      res.status(400).json({
        error: 'Missing required fields: topic, level, durationHours',
      });
      return;
    }

    const userId = 'test-user'; // MVP: Would come from auth middleware

    logger.info(
      { topic, level, durationHours, userId },
      'New briefing received'
    );

    // Create course record
    const courseId = uuidv4();
    await supabaseAdmin.from('courses').insert({
      id: courseId,
      user_id: userId,
      title: topic,
      description: `Course about ${topic}`,
      topic,
      level,
      duration_hours: durationHours,
      status: 'generating',
    });

    // Save briefing
    await supabaseAdmin.from('briefings').insert({
      user_id: userId,
      course_id: courseId,
      topic,
      level,
      desired_duration: durationHours * 60,
      source_url: sourceUrl,
      target_audience: targetAudience,
      style,
      language,
      data: req.body,
    });

    // Start async pipeline
    startCoursePipeline({
      courseId,
      userId,
      input: {
        topic,
        level,
        durationHours,
        sourceUrl,
        targetAudience,
      },
    }).catch((err) => {
      logger.error({ err, courseId }, 'Pipeline failed');
    });

    res.status(202).json({
      courseId,
      status: 'processing',
      message: 'Course generation started',
      estimatedTime: `${Math.ceil(durationHours * 5)} minutes`,
    });
  } catch (error) {
    logger.error({ err: error }, 'Briefing creation failed');
    res.status(500).json({ error: 'Failed to create briefing' });
  }
});

// GET /api/briefings/:courseId - Get course generation status
router.get('/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Get course
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Get modules and lessons
    const { data: modules } = await supabaseAdmin
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId);

    const { data: lessons } = await supabaseAdmin
      .from('lessons')
      .select('*, production_jobs(*)')
      .in('module_id', modules?.map((m) => m.id) || []);

    // Calculate progress
    const totalLessons = lessons?.length || 0;
    const readyLessons =
      lessons?.filter((l) => l.status === 'ready').length || 0;
    const progress =
      totalLessons > 0 ? Math.round((readyLessons / totalLessons) * 100) : 0;

    res.json({
      courseId,
      title: course.title,
      status: course.status,
      progress,
      modulesCount: modules?.length || 0,
      lessonsCount: totalLessons,
      readyLessons,
      lessons: lessons?.map((l) => ({
        id: l.id,
        title: l.title,
        status: l.status,
        jobs: l.production_jobs,
      })),
    });
  } catch (error) {
    logger.error({ err: error }, 'Status fetch failed');
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Internal function to orchestrate pipeline
async function startCoursePipeline(params: {
  courseId: string;
  userId: string;
  input: {
    topic: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    durationHours: number;
    sourceUrl?: string;
    targetAudience?: string;
  };
}): Promise<void> {
  const { courseId, userId, input } = params;

  try {
    // Stage 1: Research
    logger.info({ courseId }, 'Starting research stage');
    const knowledgeBase = await researchForge.research({
      topic: input.topic,
      level: input.level,
      sourceUrl: input.sourceUrl,
      targetAudience: input.targetAudience,
    });

    // Stage 2: Curriculum Design
    logger.info({ courseId }, 'Starting curriculum design');
    const courseStructure = await curriculumArchitect.designCurriculum({
      topic: input.topic,
      level: input.level,
      durationHours: input.durationHours,
      knowledgeBase: knowledgeBase.synthesis,
    });

    // Update course with structure
    await supabaseAdmin.from('course_outlines').insert({
      course_id: courseId,
      title: courseStructure.title,
      description: courseStructure.description,
      outline_data: courseStructure,
    });

    // Create modules in DB
    for (const module of courseStructure.modules) {
      const moduleId = module.id;

      await supabaseAdmin.from('course_modules').insert({
        id: moduleId,
        course_id: courseId,
        title: module.title,
        description: module.description,
        order: module.order,
        duration_minutes: module.duration,
      });

      // Create lessons
      for (const lesson of module.lessons) {
        const lessonId = lesson.id;

        await supabaseAdmin.from('lessons').insert({
          id: lessonId,
          module_id: moduleId,
          title: lesson.title,
          description: lesson.description,
          duration_minutes: lesson.duration,
          learning_objectives: lesson.learningObjectives,
          key_takeaways: lesson.keyTakeaways,
          order: lesson.order,
          status: 'draft',
        });

        // Stage 3: Generate scripts for each lesson
        logger.info(
          { courseId, lessonId },
          'Generating script'
        );

        const scriptOutput = await scriptMaster.generateScript({
          lessonTitle: lesson.title,
          duration: lesson.duration,
          learningObjectives: lesson.learningObjectives,
          keyTakeaways: lesson.keyTakeaways,
          knowledgeBase: knowledgeBase.synthesis,
          level: input.level,
          tone: 'friendly',
        });

        // Save script
        await supabaseAdmin.from('lesson_scripts').insert({
          lesson_id: lessonId,
          script_markdown: scriptOutput.markdown,
          humanized_script: scriptOutput.markdown, // Already humanized
          voice_directives: {
            cameraInstructions: scriptOutput.cameraInstructions,
            graphicPoints: scriptOutput.graphicPoints,
            pausePoints: scriptOutput.pausePoints,
          },
        });

        // Create production jobs for each stage
        const stages: Array<'script' | 'voice' | 'avatar' | 'graphics' | 'composition' | 'delivery'> = [
          'script',
          'voice',
          'avatar',
          'graphics',
          'composition',
          'delivery',
        ];

        for (const stage of stages) {
          await supabaseAdmin.from('production_jobs').insert({
            lesson_id: lessonId,
            stage,
            status: stage === 'script' ? 'completed' : 'pending',
            progress: stage === 'script' ? 100 : 0,
            metadata: {
              scriptOutput: stage === 'script' ? scriptOutput : undefined,
            },
          });
        }

        // Queue jobs for remaining stages
        if (true) { // feature flag
          await voiceQueue.add(
            { lessonId, courseId, stage: 'voice', metadata: {} },
            { delay: 5000 } // Delay slightly
          );
          await avatarQueue.add({
            lessonId,
            courseId,
            stage: 'avatar',
            metadata: {},
          });
          await graphicsQueue.add({
            lessonId,
            courseId,
            stage: 'graphics',
            metadata: {},
          });
          await compositionQueue.add({
            lessonId,
            courseId,
            stage: 'composition',
            metadata: {},
          });
          await deliveryQueue.add({
            lessonId,
            courseId,
            stage: 'delivery',
            metadata: {},
          });
        }
      }
    }

    // Update course status
    await supabaseAdmin
      .from('courses')
      .update({ status: 'ready' })
      .eq('id', courseId);

    logger.info({ courseId }, 'Course pipeline completed');
  } catch (error) {
    logger.error(
      { err: error, courseId },
      'Course pipeline failed'
    );

    // Update course status to error
    await supabaseAdmin
      .from('courses')
      .update({ status: 'draft' })
      .eq('id', courseId);
  }
}

export default router;
