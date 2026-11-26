import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * File-backed key-value store.
 * Same interface as the Redis store, so the API code does not care which one it uses.
 * Every write is flushed to disk (atomic write + rename), so data survives restarts.
 * Used automatically when REDIS_URL is not set (local development, tests).
 */
export async function createFileStore(file) {
  let data = {};
  try {
    data = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    await fs.mkdir(path.dirname(file), { recursive: true });
  }

  let queue = Promise.resolve();
  const persist = () => {
    queue = queue
      .then(async () => {
        const tmp = `${file}.tmp`;
        await fs.writeFile(tmp, JSON.stringify(data, null, 2));
        await fs.rename(tmp, file);
      })
      .catch((err) => console.error('Could not write database file:', err));
    return queue;
  };

  const clone = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));

  return {
    kind: 'file',
    async get(key) {
      return clone(data[key]);
    },
    async set(key, value) {
      data[key] = clone(value);
      await persist();
    },
    async del(key) {
      const existed = key in data;
      delete data[key];
      if (existed) await persist();
      return existed;
    },
    async list(prefix) {
      return Object.keys(data)
        .filter((k) => k.startsWith(prefix))
        .map((k) => clone(data[k]));
    },
    async incr(key) {
      data[key] = (Number(data[key]) || 0) + 1;
      await persist();
      return data[key];
    },
    async ping() {
      return true;
    },
    async close() {
      await queue;
    },
  };
}
