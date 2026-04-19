import express, { type Request, type Response } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/courses - List all courses for user
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = 'test-user'; // MVP: From auth middleware

    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        course_modules(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      courses,
      count: courses?.length || 0,
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to list courses');
    res.status(500).json({ error: 'Failed to list courses' });
  }
});

// GET /api/courses/:id - Get detailed course info
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = 'test-user';

    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (courseError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Get modules with lessons
    const { data: modules } = await supabaseAdmin
      .from('course_modules')
      .select(`
        *,
        lessons(*)
      `)
      .eq('course_id', id)
      .order('order', { ascending: true });

    res.json({
      course,
      modules,
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch course');
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// PUT /api/courses/:id - Update course
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = 'test-user';
    const { title, description, status } = req.body;

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .update({
        title,
        description,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json(course);
  } catch (error) {
    logger.error({ err: error }, 'Failed to update course');
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE /api/courses/:id - Delete course
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = 'test-user';

    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Course deleted' });
  } catch (error) {
    logger.error({ err: error }, 'Failed to delete course');
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
