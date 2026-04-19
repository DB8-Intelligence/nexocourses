import { supabaseAdmin } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

async function seedDatabase(): Promise<void> {
  try {
    logger.info('Starting database seed...');

    // Create test user
    const userId = uuidv4();
    const testUser = {
      id: userId,
      email: 'test@nexocourses.com',
      name: 'Test User',
      plan: 'pro' as const,
      credits_remaining: 500,
    };

    // Insert user
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert([testUser]);

    if (userError) {
      logger.warn({ err: userError }, 'User already exists or error');
    } else {
      logger.info('Test user created');
    }

    // Create test course
    const courseId = uuidv4();
    const { error: courseError } = await supabaseAdmin
      .from('courses')
      .insert([
        {
          id: courseId,
          user_id: userId,
          title: 'Introduction to React',
          description: 'Learn React from scratch',
          topic: 'React',
          level: 'beginner',
          duration_hours: 5,
          status: 'draft',
        },
      ]);

    if (courseError) {
      logger.warn({ err: courseError }, 'Course already exists');
    } else {
      logger.info('Test course created');

      // Create test module
      const moduleId = uuidv4();
      const { error: moduleError } = await supabaseAdmin
        .from('course_modules')
        .insert([
          {
            id: moduleId,
            course_id: courseId,
            title: 'Getting Started',
            description: 'Fundamentals of React',
            order: 1,
            duration_minutes: 45,
          },
        ]);

      if (!moduleError) {
        logger.info('Test module created');

        // Create test lesson
        const lessonId = uuidv4();
        const { error: lessonError } = await supabaseAdmin
          .from('lessons')
          .insert([
            {
              id: lessonId,
              module_id: moduleId,
              title: 'What is React?',
              description: 'Introduction to React library',
              duration_minutes: 15,
              learning_objectives: [
                'Understand what React is',
                'Learn about components',
              ],
              key_takeaways: [
                'React is a JS library for UI',
                'Components are reusable',
              ],
              order: 1,
              status: 'draft',
            },
          ]);

        if (!lessonError) {
          logger.info('Test lesson created');
        }
      }
    }

    logger.info('Database seed completed');
  } catch (error) {
    logger.error({ err: error }, 'Seed failed');
    throw error;
  }
}

seedDatabase()
  .then(() => {
    logger.info('Seed successful');
    process.exit(0);
  })
  .catch((err) => {
    logger.error({ err }, 'Seed error');
    process.exit(1);
  });
