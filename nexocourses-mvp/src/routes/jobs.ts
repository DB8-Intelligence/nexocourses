import express, { type Request, type Response } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/jobs/lesson/:lessonId - Get all jobs for a lesson
router.get(
  '/lesson/:lessonId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;

      const { data: jobs, error } = await supabaseAdmin
        .from('production_jobs')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate overall progress
      const totalJobs = jobs?.length || 0;
      const completedJobs =
        jobs?.filter((j) => j.status === 'completed').length || 0;
      const overallProgress =
        totalJobs > 0
          ? Math.round((completedJobs / totalJobs) * 100)
          : 0;

      res.json({
        lessonId,
        jobs,
        summary: {
          total: totalJobs,
          completed: completedJobs,
          progress: overallProgress,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch jobs');
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  }
);

// GET /api/jobs/:jobId - Get job details
router.get('/:jobId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const { data: job, error } = await supabaseAdmin
      .from('production_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch job');
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// GET /api/jobs/course/:courseId - Get all jobs for a course
router.get(
  '/course/:courseId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId } = req.params;

      // Get all lessons for course
      const { data: modules } = await supabaseAdmin
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId);

      const moduleIds = modules?.map((m) => m.id) || [];

      const { data: lessons } = await supabaseAdmin
        .from('lessons')
        .select('id')
        .in('module_id', moduleIds);

      const lessonIds = lessons?.map((l) => l.id) || [];

      // Get all jobs for lessons
      const { data: jobs, error } = await supabaseAdmin
        .from('production_jobs')
        .select('*')
        .in('lesson_id', lessonIds)
        .order('stage');

      if (error) throw error;

      // Group by stage
      const byStage = {
        script:
          jobs?.filter((j) => j.stage === 'script') || [],
        voice:
          jobs?.filter((j) => j.stage === 'voice') || [],
        avatar:
          jobs?.filter((j) => j.stage === 'avatar') || [],
        graphics:
          jobs?.filter((j) => j.stage === 'graphics') || [],
        composition:
          jobs?.filter((j) => j.stage === 'composition') || [],
        delivery:
          jobs?.filter((j) => j.stage === 'delivery') || [],
      };

      // Calculate progress per stage
      const progressPerStage = Object.entries(byStage).map(
        ([stage, jobs]) => {
          const completed = jobs.filter(
            (j) => j.status === 'completed'
          ).length;
          return {
            stage,
            total: jobs.length,
            completed,
            progress:
              jobs.length > 0
                ? Math.round(
                    (completed / jobs.length) * 100
                  )
                : 0,
          };
        }
      );

      res.json({
        courseId,
        byStage,
        progressPerStage,
        totalJobs: jobs?.length || 0,
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch course jobs');
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  }
);

export default router;
