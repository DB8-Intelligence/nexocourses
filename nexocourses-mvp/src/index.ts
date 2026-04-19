import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp, { type Options } from 'pino-http';
import { config } from './config/index.js';
import { initializeDatabase } from './db/index.js';
import { initializeQueue } from './queue/index.js';
import { logger } from './utils/logger.js';
import briefingRoutes from './routes/briefing.js';
import courseRoutes from './routes/courses.js';
import jobRoutes from './routes/jobs.js';
import webhookRoutes from './routes/webhooks.js';

const app: Express = express();

// Middleware de segurança
app.use(helmet());

// Logging
// pino 8.x vs pino-http 10.x têm tipos divergentes (msgPrefix). Cast até upgrade do pino.
app.use(pinoHttp({ logger } as unknown as Options));

// CORS
app.use(
  cors({
    origin: config.corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/briefings', briefingRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    _next: express.NextFunction
  ) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({
      error: 'Internal server error',
      message:
        config.nodeEnv === 'development' ? err.message : undefined,
    });
  }
);

// Initialize and start
async function start(): Promise<void> {
  try {
    logger.info('Initializing NexoCourses backend...');

    // Initialize database
    await initializeDatabase();
    logger.info('Database connected');

    // Initialize queue
    await initializeQueue();
    logger.info('Queue initialized');

    // Start server
    const port = config.port;
    app.listen(port, () => {
      logger.info(`🚀 NexoCourses API running on port ${port}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

start().catch(err => {
  logger.error({ err }, 'Fatal error');
  process.exit(1);
});

export default app;
