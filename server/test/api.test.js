import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig } from '../src/config.js';
import { createFileStore } from '../src/store/fileStore.js';
import { seedMenuIfEmpty } from '../src/seed.js';
import { createApp } from '../src/app.js';

let server, base, store, token, dbFile;
const config = loadConfig({ STAFF_PASSWORD: 'test-pass', CORS_ORIGIN: '*' });

async function call(method, url, body, auth = false) {
  const res = await fetch(base + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

before(async () => {
  dbFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'coffee-')), 'db.json');
  store = await createFileStore(dbFile);
  await seedMenuIfEmpty(store);
  const app = createApp(store, config);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await store.close();
});

test('health check works', async () => {
  const r = await call('GET', '/health');
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'ok');
});

test('menu is seeded with prices in Maloti and images', async () => {
  const r = await call('GET', '/menu');
  assert.equal(r.status, 200);
  assert.ok(r.body.length >= 15);
  assert.ok(r.body.every((i) => i.price > 0 && i.image.startsWith('/images/menu/')));
});

test('staff endpoints reject missing or wrong credentials', async () => {
  assert.equal((await call('POST', '/menu', { name: 'X', price: 1, category: 'Tea' })).status, 401);
  assert.equal((await call('GET', '/orders')).status, 401);
  assert.equal((await call('POST', '/auth/login', { password: 'nope' })).status, 401);
  const ok = await call('POST', '/auth/login', { password: 'test-pass' });
  assert.equal(ok.status, 200);
  token = ok.body.token;
});

test('menu CRUD with validation', async () => {
  const bad = await call('POST', '/menu', { name: '', price: -5, category: 'Nope' }, true);
  assert.equal(bad.status, 400);
  assert.ok(bad.body.error.details.name && bad.body.error.details.price && bad.body.error.details.category);

  const created = await call('POST', '/menu', { name: 'Vanilla Latte', price: 41.5, category: 'Coffee', description: 'Sweet' }, true);
  assert.equal(created.status, 201);
  assert.ok(created.body.id);
  const id = created.body.id;

  const got = await call('GET', `/menu/${id}`);
  assert.equal(got.body.name, 'Vanilla Latte');

  const upd = await call('PUT', `/menu/${id}`, { price: 44, available: false }, true);
  assert.equal(upd.status, 200);
  assert.equal(upd.body.price, 44);
  assert.equal(upd.body.available, false);
  assert.equal(upd.body.name, 'Vanilla Latte');

  assert.equal((await call('DELETE', `/menu/${id}`, undefined, true)).status, 204);
  assert.equal((await call('GET', `/menu/${id}`)).status, 404);
  assert.equal((await call('DELETE', `/menu/${id}`, undefined, true)).status, 404);
});

test('order flow: place, track, update status, summary', async () => {
  const menu = (await call('GET', '/menu')).body;
  const cap = menu.find((i) => i.name === 'Cappuccino');
  const croissant = menu.find((i) => i.name === 'Butter Croissant');

  // client-supplied prices are ignored; totals are computed from the database
  const placed = await call('POST', '/orders', {
    customerName: 'Palesa',
    orderType: 'dine-in',
    tableNumber: '4',
    items: [
      { id: cap.id, quantity: 2, price: 1 },
      { id: croissant.id, quantity: 1 },
    ],
  });
  assert.equal(placed.status, 201);
  assert.match(placed.body.id, /^LCH-\d+$/);
  assert.equal(placed.body.total, 35 * 2 + 25);
  assert.equal(placed.body.status, 'Pending');

  const second = await call('POST', '/orders', { customerName: 'Thabo', items: [{ id: cap.id, quantity: 1 }] });
  assert.notEqual(second.body.id, placed.body.id);

  const found = await call('GET', `/orders/${placed.body.id.toLowerCase()}`);
  assert.equal(found.status, 200);
  assert.equal(found.body.customerName, 'Palesa');

  const patched = await call('PATCH', `/orders/${placed.body.id}/status`, { status: 'Preparing' }, true);
  assert.equal(patched.body.status, 'Preparing');
  assert.equal(patched.body.statusHistory.length, 2);
  assert.equal((await call('PATCH', `/orders/${placed.body.id}/status`, { status: 'Done' }, true)).status, 400);
  assert.equal((await call('PATCH', '/orders/LCH-9999/status', { status: 'Ready' }, true)).status, 404);

  const list = await call('GET', '/orders?status=Preparing', undefined, true);
  assert.equal(list.body.length, 1);

  const summary = await call('GET', '/summary', undefined, true);
  assert.equal(summary.body.totalOrders, 2);
  assert.equal(summary.body.totalRevenue, 35 * 2 + 25 + 35);
  assert.equal(summary.body.itemsSold, 4);
  assert.equal(summary.body.topItems[0].name, 'Cappuccino');
  assert.equal(summary.body.byStatus.Pending, 1);
});

test('order validation and unavailable items', async () => {
  const menu = (await call('GET', '/menu')).body;
  const item = menu[0];
  assert.equal((await call('POST', '/orders', { customerName: 'A', items: [] })).status, 400);
  assert.equal((await call('POST', '/orders', { customerName: 'Ann', items: [{ id: item.id, quantity: 0 }] })).status, 400);
  assert.equal((await call('POST', '/orders', { customerName: 'Ann', items: [{ id: 'missing', quantity: 1 }] })).status, 409);

  await call('PUT', `/menu/${item.id}`, { available: false }, true);
  const sold = await call('POST', '/orders', { customerName: 'Ann', items: [{ id: item.id, quantity: 1 }] });
  assert.equal(sold.status, 409);
  await call('PUT', `/menu/${item.id}`, { available: true }, true);
});

test('bad JSON and unknown routes return consistent errors', async () => {
  const res = await fetch(`${base}/menu`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: '{oops' });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).error.message);
  const nf = await call('GET', '/nothing');
  assert.equal(nf.status, 404);
  assert.ok(nf.body.error);
});

test('data persists after the store is reopened (server restart)', async () => {
  const before = (await call('GET', '/menu')).body.length;
  await store.close();
  const reopened = await createFileStore(dbFile);
  assert.equal((await reopened.list('menu:')).length, before);
  assert.ok((await reopened.list('order:')).length >= 2);
  store = reopened;
});
