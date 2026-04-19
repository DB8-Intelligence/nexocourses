import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.key
);

export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

export async function initializeDatabase(): Promise<void> {
  try {
    // Test connection
    const { data, error } = await supabase.from('users').select('count');

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    logger.info('Database connection successful');
  } catch (error) {
    logger.error({ err: error }, 'Database initialization failed');
    throw error;
  }
}

// Types para o banco de dados
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  description: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  status: 'draft' | 'generating' | 'ready' | 'published';
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  duration_minutes: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  learning_objectives: string[];
  key_takeaways: string[];
  order: number;
  status: 'draft' | 'generating' | 'ready';
  created_at: string;
}

export interface LessonScript {
  id: string;
  lesson_id: string;
  script_markdown: string;
  humanized_script: string;
  voice_directives: Record<string, unknown>;
  created_at: string;
}

export interface ProductionJob {
  id: string;
  lesson_id: string;
  stage: 'script' | 'voice' | 'avatar' | 'graphics' | 'composition' | 'delivery';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  error_message?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CourseOutline {
  id: string;
  course_id: string;
  title: string;
  description: string;
  modules: Array<{
    title: string;
    duration: string;
    lessons: Array<{
      title: string;
      duration: string;
      objectives: string[];
    }>;
  }>;
  created_at: string;
}
