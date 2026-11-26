import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export function loadConfig(env = process.env) {
  const staffPassword = env.STAFF_PASSWORD || 'coffee123';
  return {
    port: Number(env.PORT) || 5000,
    redisUrl: env.REDIS_URL || '',
    dataFile: env.DATA_FILE || path.join(here, '..', 'data', 'db.json'),
    staffPassword,
    usingDefaultPassword: !env.STAFF_PASSWORD,
    // Token signing secret. Derived from the password when AUTH_SECRET is not set,
    // so staff stay logged in across server restarts.
    authSecret:
      env.AUTH_SECRET ||
      crypto.createHash('sha256').update(`lesedi-coffee:${staffPassword}`).digest('hex'),
    tokenTtlHours: Number(env.TOKEN_TTL_HOURS) || 12,
    corsOrigins: (env.CORS_ORIGIN || '*')
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean),
    timezone: env.SHOP_TIMEZONE || 'Africa/Maseru',
    orderPrefix: (env.ORDER_PREFIX || 'LCH').toUpperCase(),
  };
}
