import express, { type Request, type Response } from 'express';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { supabaseAdmin } from '../db/index.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Middleware para validar webhook signature
function validateHotmartSignature(
  req: Request,
  res: Response,
  next: express.NextFunction
): void {
  const signature = req.headers['x-hotmart-signature'] as string;
  if (!signature) {
    res.status(401).json({ error: 'Missing signature' });
    return;
  }

  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', config.hotmart.webhookSecret || '')
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  next();
}

// POST /api/webhooks/hotmart - Hotmart payment webhook
router.post(
  '/hotmart',
  validateHotmartSignature,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        event,
        data,
      } = req.body as {
        event: string;
        data: Record<string, unknown>;
      };

      logger.info({ event, data }, 'Hotmart webhook received');

      // Handle different Hotmart events
      switch (event) {
        case 'PURCHASE_APPROVED': {
          // Extract user email and plan from data
          const email = (data.buyer_email || data.email) as string;
          const productId = (data.product_id) as string;

          // Map product_id to plan
          const planMap: Record<string, 'starter' | 'pro' | 'enterprise'> = {
            // Would be configured with actual Hotmart product IDs
            '123': 'starter',
            '456': 'pro',
            '789': 'enterprise',
          };

          const plan = planMap[productId] || 'starter';
          const credits =
            plan === 'starter'
              ? 100
              : plan === 'pro'
                ? 300
                : 999999;

          // Update or create user
          const { data: user, error: userError } =
            await supabaseAdmin
              .from('users')
              .upsert(
                {
                  email,
                  name:
                    (data.buyer_name as string) ||
                    email,
                  plan,
                  credits_remaining: credits,
                },
                { onConflict: 'email' }
              )
              .select()
              .single();

          if (userError) {
            logger.error(
              { err: userError, email },
              'Failed to update user'
            );
          } else {
            logger.info(
              { email, plan, credits },
              'User upgraded'
            );
          }

          break;
        }

        case 'SUBSCRIPTION_CANCELLATION': {
          const email = (data.buyer_email ||
            data.email) as string;

          // Set plan to free
          await supabaseAdmin
            .from('users')
            .update({ plan: 'free', credits_remaining: 0 })
            .eq('email', email);

          logger.info({ email }, 'Subscription cancelled');

          break;
        }

        case 'PURCHASE_REFUNDED': {
          const email = (data.buyer_email ||
            data.email) as string;

          // Set plan to free
          await supabaseAdmin
            .from('users')
            .update({ plan: 'free', credits_remaining: 0 })
            .eq('email', email);

          logger.info({ email }, 'Purchase refunded');

          break;
        }

        default:
          logger.warn({ event }, 'Unknown webhook event');
      }

      res.json({ received: true });
    } catch (error) {
      logger.error(
        { err: error },
        'Hotmart webhook processing failed'
      );
      res
        .status(500)
        .json({ error: 'Webhook processing failed' });
    }
  }
);

// POST /api/webhooks/production-complete - Job completion notification
router.post(
  '/production-complete',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        lessonId,
        courseId,
        stage,
        success,
        error,
      } = req.body as {
        lessonId: string;
        courseId: string;
        stage: string;
        success: boolean;
        error?: string;
      };

      logger.info(
        { lessonId, courseId, stage, success },
        'Production job completed'
      );

      if (!success && error) {
        // Log error
        await supabaseAdmin
          .from('production_jobs')
          .update({ status: 'failed', error_message: error })
          .eq('lesson_id', lessonId)
          .eq('stage', stage);
      }

      // Check if all lessons are ready
      const { data: modules } = await supabaseAdmin
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId);

      const moduleIds = modules?.map((m) => m.id) || [];

      const { data: lessons } = await supabaseAdmin
        .from('lessons')
        .select('status')
        .in('module_id', moduleIds);

      const allReady = lessons?.every(
        (l) => l.status === 'ready'
      );

      if (allReady) {
        // Update course status
        await supabaseAdmin
          .from('courses')
          .update({ status: 'ready' })
          .eq('id', courseId);

        logger.info(
          { courseId },
          'All lessons ready, course complete'
        );
      }

      res.json({ received: true });
    } catch (error) {
      logger.error(
        { err: error },
        'Production webhook processing failed'
      );
      res
        .status(500)
        .json({ error: 'Webhook processing failed' });
    }
  }
);

// POST /api/webhooks/test - Test webhook (for development)
router.post(
  '/test',
  async (req: Request, res: Response): Promise<void> => {
    if (config.nodeEnv !== 'development') {
      res
        .status(403)
        .json({ error: 'Test webhook disabled' });
      return;
    }

    logger.info({ data: req.body }, 'Test webhook received');
    res.json({ received: true });
  }
);

export default router;
