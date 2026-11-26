import { loadConfig } from './config.js';
import { createStore } from './store/index.js';
import { seedMenuIfEmpty } from './seed.js';
import { createApp } from './app.js';

const config = loadConfig();

if (config.usingDefaultPassword) {
  console.warn('WARNING: STAFF_PASSWORD is not set. Using the default password "coffee123". Set it before deploying.');
}

const store = await createStore(config);
await seedMenuIfEmpty(store);

const app = createApp(store, config);
const server = app.listen(config.port, () => {
  console.log(`Coffee Shop API listening on port ${config.port}`);
});

const shutdown = async () => {
  server.close();
  await store.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
