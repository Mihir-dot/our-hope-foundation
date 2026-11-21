import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.API_PORT, () => {
    logger.info({ port: env.API_PORT }, 'Our Hope Foundation API listening');
  });
}

main().catch((err) => {
  logger.error({ err }, 'API failed to start');
  process.exit(1);
});
