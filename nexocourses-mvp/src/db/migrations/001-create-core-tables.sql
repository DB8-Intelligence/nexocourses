-- Migration 001: Create core tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  credits_remaining INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'published')),
  thumbnail_url TEXT,
  preview_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_duration CHECK (duration_hours > 0)
);

-- Course modules
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_duration CHECK (duration_minutes > 0)
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  learning_objectives TEXT[] DEFAULT '{}',
  key_takeaways TEXT[] DEFAULT '{}',
  "order" INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_duration CHECK (duration_minutes > 0)
);

-- Lesson scripts
CREATE TABLE IF NOT EXISTS lesson_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  script_markdown TEXT NOT NULL,
  humanized_script TEXT,
  voice_directives JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Production jobs (Bull queue tracking)
CREATE TABLE IF NOT EXISTS production_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('script', 'voice', 'avatar', 'graphics', 'composition', 'delivery')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course outlines
CREATE TABLE IF NOT EXISTS course_outlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  outline_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Video files metadata
CREATE TABLE IF NOT EXISTS video_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  format TEXT DEFAULT 'mp4',
  resolution TEXT DEFAULT '1080p',
  url TEXT,
  status TEXT DEFAULT 'ready' CHECK (status IN ('ready', 'processing', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subtitle files
CREATE TABLE IF NOT EXISTS subtitle_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'pt-BR',
  file_path TEXT NOT NULL,
  srt_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Briefing history
CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  level TEXT NOT NULL,
  desired_duration INTEGER,
  source_url TEXT,
  source_type TEXT,
  target_audience TEXT,
  style TEXT,
  language TEXT DEFAULT 'pt-BR',
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX idx_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_status ON lessons(status);
CREATE INDEX idx_scripts_lesson_id ON lesson_scripts(lesson_id);
CREATE INDEX idx_jobs_lesson_id ON production_jobs(lesson_id);
CREATE INDEX idx_jobs_status ON production_jobs(status);
CREATE INDEX idx_jobs_stage ON production_jobs(stage);
CREATE INDEX idx_videos_lesson_id ON video_files(lesson_id);
CREATE INDEX idx_subtitles_lesson_id ON subtitle_files(lesson_id);
CREATE INDEX idx_briefings_user_id ON briefings(user_id);
CREATE INDEX idx_briefings_course_id ON briefings(course_id);

-- Full-text search index
CREATE INDEX idx_courses_search ON courses USING GIN(to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));

-- Enable RLS (Row-Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtitle_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only read their own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can see their own courses"
  ON courses FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can see their course modules"
  ON course_modules FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can see their lessons"
  ON lessons FOR SELECT
  USING (
    module_id IN (
      SELECT id FROM course_modules
      WHERE course_id IN (
        SELECT id FROM courses WHERE user_id::text = auth.uid()::text
      )
    )
  );

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON lesson_scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON production_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outlines_updated_at BEFORE UPDATE ON course_outlines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
