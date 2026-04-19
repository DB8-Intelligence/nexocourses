import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../db/index.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations(): Promise<void> {
  try {
    logger.info('Running migrations...');

    // Read migration file
    const migrationPath = join(
      __dirname,
      '../db/migrations/001-create-core-tables.sql'
    );

    const sql = readFileSync(migrationPath, 'utf-8');

    // Execute migration
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      query: sql,
    });

    if (error) {
      // Fallback: Try executing via direct SQL if RPC fails
      logger.warn(
        { err: error },
        'RPC failed, attempting direct execution'
      );

      // Split by semicolon and execute statements
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await supabaseAdmin.rpc('exec_sql', { query: statement });
      }
    }

    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error({ err: error }, 'Migration failed');

    // Note: If RPC doesn't exist, run migrations manually in Supabase SQL Editor
    logger.warn(
      'Manual step: Copy migrations/001-create-core-tables.sql content'
    );
    logger.warn('and execute in Supabase SQL Editor (dashboard)');

    throw error;
  }
}

runMigrations()
  .then(() => {
    logger.info('All migrations successful');
    process.exit(0);
  })
  .catch((err) => {
    logger.error({ err }, 'Migration error');
    process.exit(1);
  });
