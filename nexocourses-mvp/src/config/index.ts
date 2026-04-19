import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY',
  'REDIS_URL',
];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Claude/Anthropic
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    apiKey2: process.env.ANTHROPIC_API_KEY_2,
    model: 'claude-sonnet-4-20250514',
  },

  // Gemini
  gemini: {
    apiKey: process.env.GEMINI_API_KEY!,
    model: 'gemini-2.0-flash',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL!,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  // FFmpeg
  ffmpeg: {
    path: process.env.FFMPEG_PATH || 'ffmpeg',
  },

  // ElevenLabs
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    apiBase: process.env.ELEVENLABS_API_BASE || 'https://api.elevenlabs.io',
  },

  // HeyGen
  heygen: {
    apiKey: process.env.HEYGEN_API_KEY,
    apiBase: process.env.HEYGEN_API_BASE || 'https://api.heygen.com',
  },

  // Fal.ai
  falai: {
    apiKey: process.env.FALAI_API_KEY,
    apiBase: process.env.FALAI_API_BASE || 'https://api.fal.ai',
  },

  // Deepgram
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY,
  },

  // Google APIs
  google: {
    scholarApiKey: process.env.GOOGLE_SCHOLAR_API_KEY,
    youtubeApiKey: process.env.YOUTUBE_API_KEY,
    searchApiKey: process.env.GOOGLE_SEARCH_API_KEY,
  },

  // Hotmart
  hotmart: {
    clientId: process.env.HOTMART_CLIENT_ID,
    clientSecret: process.env.HOTMART_CLIENT_SECRET,
    webhookSecret: process.env.HOTMART_WEBHOOK_SECRET,
  },

  // Cloudflare R2
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    bucketName: process.env.CLOUDFLARE_BUCKET_NAME || 'nexocourses-videos',
  },

  // Security
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  },

  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'dev-webhook-secret',
  },

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Feature flags
  features: {
    enableVideoProcessing:
      process.env.ENABLE_VIDEO_PROCESSING !== 'false',
    enableVoiceCloning:
      process.env.ENABLE_VOICE_CLONING === 'true',
    enableResearchApi:
      process.env.ENABLE_RESEARCH_API !== 'false',
  },
} as const;

export type Config = typeof config;
