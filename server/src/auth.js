import crypto from 'node:crypto';
import { HttpError } from './validate.js';

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (data, secret) => crypto.createHmac('sha256', secret).update(data).digest('base64url');

export function createToken(secret, ttlHours) {
  const payload = b64(JSON.stringify({ role: 'staff', exp: Date.now() + ttlHours * 3600 * 1000 }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyToken(token, secret) {
  if (typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

/** Constant-time password comparison. */
export function passwordMatches(input, actual) {
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(input), h(actual));
}

export function requireStaff(secret) {
  return (req, _res, next) => {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!verifyToken(token, secret)) {
      return next(new HttpError(401, 'Staff login required'));
    }
    next();
  };
}

/** Small in-memory limiter to slow down password guessing. */
export function loginLimiter({ max = 10, windowMs = 15 * 60 * 1000 } = {}) {
  const hits = new Map();
  return (req, _res, next) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return next(new HttpError(429, 'Too many login attempts. Please try again later.'));
    }
    next();
  };
}
