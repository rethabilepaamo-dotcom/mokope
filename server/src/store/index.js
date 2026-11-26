import { createFileStore } from './fileStore.js';
import { createRedisStore } from './redisStore.js';

export async function createStore({ redisUrl, dataFile }) {
  if (redisUrl) {
    const store = await createRedisStore(redisUrl);
    console.log('Database: Redis (key-value NoSQL)');
    return store;
  }
  const store = await createFileStore(dataFile);
  console.log(`Database: local JSON key-value file (${dataFile}). Set REDIS_URL to use Redis.`);
  return store;
}
