import Redis from 'ioredis';

/**
 * Redis-backed key-value store (the persistent NoSQL database).
 *   menu:<id>        -> JSON menu item
 *   order:<id>       -> JSON order
 *   counter:order    -> integer used to generate order numbers (atomic INCR)
 *   meta:seeded      -> flag so the starter menu is only created once
 *
 * Use a Redis instance with persistence enabled (e.g. Upstash, Redis Cloud,
 * or a local Redis started with --appendonly yes).
 */
export async function createRedisStore(url) {
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 10000,
  });
  client.on('error', (err) => console.error('[redis]', err.message));
  await client.connect();

  return {
    kind: 'redis',
    async get(key) {
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    },
    async set(key, value) {
      await client.set(key, JSON.stringify(value));
    },
    async del(key) {
      return (await client.del(key)) > 0;
    },
    async list(prefix) {
      const keys = new Set();
      for await (const batch of client.scanStream({ match: `${prefix}*`, count: 200 })) {
        batch.forEach((k) => keys.add(k));
      }
      if (keys.size === 0) return [];
      const all = [...keys];
      const out = [];
      for (let i = 0; i < all.length; i += 200) {
        const values = await client.mget(all.slice(i, i + 200));
        values.forEach((v) => v && out.push(JSON.parse(v)));
      }
      return out;
    },
    async incr(key) {
      return client.incr(key);
    },
    async ping() {
      return (await client.ping()) === 'PONG';
    },
    async close() {
      await client.quit();
    },
  };
}
