import Queue from 'bull';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import {
  processScriptStage,
  processVoiceStage,
  processAvatarStage,
  processGraphicsStage,
  processCompositionStage,
  processDeliveryStage,
} from './processors/index.js';

export type JobStage =
  | 'script'
  | 'voice'
  | 'avatar'
  | 'graphics'
  | 'composition'
  | 'delivery';

export interface ProductionJobData {
  lessonId: string;
  courseId: string;
  stage: JobStage;
  metadata: Record<string, unknown>;
}

// Create queues for each stage
export const scriptQueue = new Queue<ProductionJobData>(
  'production:script',
  config.redis.url,
  {
    redis: config.redis.url
      ? undefined
      : {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
        },
    prefix: 'nexocourses',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    },
  }
);

export const voiceQueue = new Queue<ProductionJobData>(
  'production:voice',
  config.redis.url,
  {
    redis: config.redis.url
      ? undefined
      : {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
        },
    prefix: 'nexocourses',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    },
  }
);

export const avatarQueue = new Queue<ProductionJobData>(
  'production:avatar',
  config.redis.url,
  {
    redis: config.redis.url
      ? undefined
      : {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
        },
    prefix: 'nexocourses',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    },
  }
);

export const graphicsQueue = new Queue<ProductionJobData>(
  'production:graphics',
  config.redis.url,
  {
    redis: config.redis.url
      ? undefined
      : {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
        },
    prefix: 'nexocourses',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    },
  }
);

export const compositionQueue = new Queue<ProductionJobData>(
  'production:composition',
  config.redis.url,
  {
    redis: config.redis.url
      ? undefined
      : {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
        },
    prefix: 'nexocourses',
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    },
  }
);

export const deliveryQueue = new Queue<ProductionJobData>(
  'production:delivery',
  config.redis.url,
  {
    redis: config.redis.url
      ? undefined
      : {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
        },
    prefix: 'nexocourses',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    },
  }
);

// Register job processors
scriptQueue.process(async (job) => {
  logger.info({ jobId: job.id }, 'Processing script stage');
  return processScriptStage(job.data);
});

voiceQueue.process(async (job) => {
  logger.info({ jobId: job.id }, 'Processing voice stage');
  return processVoiceStage(job.data);
});

avatarQueue.process(async (job) => {
  logger.info({ jobId: job.id }, 'Processing avatar stage');
  return processAvatarStage(job.data);
});

graphicsQueue.process(async (job) => {
  logger.info({ jobId: job.id }, 'Processing graphics stage');
  return processGraphicsStage(job.data);
});

compositionQueue.process(async (job) => {
  logger.info({ jobId: job.id }, 'Processing composition stage');
  return processCompositionStage(job.data);
});

deliveryQueue.process(async (job) => {
  logger.info({ jobId: job.id }, 'Processing delivery stage');
  return processDeliveryStage(job.data);
});

// Register event handlers
const queues = [
  scriptQueue,
  voiceQueue,
  avatarQueue,
  graphicsQueue,
  compositionQueue,
  deliveryQueue,
];

for (const queue of queues) {
  queue.on('failed', (job, err) => {
    logger.error(
      { jobId: job.id, queue: queue.name, err },
      'Job failed'
    );
  });

  queue.on('completed', (job) => {
    logger.info({ jobId: job.id, queue: queue.name }, 'Job completed');
  });
}

export async function initializeQueue(): Promise<void> {
  try {
    // Test Redis connection
    await scriptQueue.isReady();
    logger.info('Queue connection successful');
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize queue');
    throw error;
  }
}

export async function closeQueues(): Promise<void> {
  await Promise.all(
    queues.map((q) => q.close())
  );
}
