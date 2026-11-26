import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import {
  HttpError,
  ORDER_STATUSES,
  CATEGORIES,
  toCents,
  fromCents,
  validateMenuInput,
  validateOrderInput,
  validateStatusInput,
  validateDateParam,
} from './validate.js';
import { createToken, passwordMatches, requireStaff, loginLimiter } from './auth.js';

const byCategoryThenName = (a, b) =>
  CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name);

export function createApp(store, config) {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  const dateInShop = (iso) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: config.timezone }).format(new Date(iso));

  app.use(
    cors({
      origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '1mb' }));

  const staffOnly = requireStaff(config.authSecret);
  const api = express.Router();

  /* ------------------------------ Health -------------------------------- */
  api.get('/health', async (_req, res) => {
    let dbOk = false;
    try {
      dbOk = await store.ping();
    } catch {
      dbOk = false;
    }
    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? 'ok' : 'degraded',
      database: { type: store.kind, connected: dbOk },
      time: new Date().toISOString(),
    });
  });

  /* ------------------------------- Auth --------------------------------- */
  api.post('/auth/login', loginLimiter(), (req, res) => {
    const password = req.body?.password;
    if (typeof password !== 'string' || !password) {
      throw new HttpError(400, 'Validation failed', { password: 'Password is required' });
    }
    if (!passwordMatches(password, config.staffPassword)) {
      throw new HttpError(401, 'Incorrect staff password');
    }
    res.json({ token: createToken(config.authSecret, config.tokenTtlHours), expiresInHours: config.tokenTtlHours });
  });

  api.get('/auth/me', staffOnly, (_req, res) => res.json({ role: 'staff' }));

  /* -------------------------------- Menu -------------------------------- */
  api.get('/menu', async (_req, res) => {
    const items = await store.list('menu:');
    res.json(items.sort(byCategoryThenName));
  });

  api.get('/menu/:id', async (req, res) => {
    const item = await store.get(`menu:${req.params.id}`);
    if (!item) throw new HttpError(404, 'Menu item not found');
    res.json(item);
  });

  api.post('/menu', staffOnly, async (req, res) => {
    const data = validateMenuInput(req.body);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const item = { id, ...data, createdAt: now, updatedAt: now };
    await store.set(`menu:${id}`, item);
    res.status(201).json(item);
  });

  api.put('/menu/:id', staffOnly, async (req, res) => {
    const existing = await store.get(`menu:${req.params.id}`);
    if (!existing) throw new HttpError(404, 'Menu item not found');
    const changes = validateMenuInput(req.body, { partial: true });
    const item = { ...existing, ...changes, id: existing.id, updatedAt: new Date().toISOString() };
    await store.set(`menu:${item.id}`, item);
    res.json(item);
  });

  api.delete('/menu/:id', staffOnly, async (req, res) => {
    const removed = await store.del(`menu:${req.params.id}`);
    if (!removed) throw new HttpError(404, 'Menu item not found');
    res.status(204).end();
  });

  /* ------------------------------- Orders ------------------------------- */
  api.post('/orders', async (req, res) => {
    const input = validateOrderInput(req.body);

    const lines = [];
    const problems = {};
    for (const { id, quantity } of input.items) {
      const item = await store.get(`menu:${id}`);
      if (!item) {
        problems[id] = 'This item is no longer on the menu';
        continue;
      }
      if (!item.available) {
        problems[id] = `${item.name} is currently sold out`;
        continue;
      }
      lines.push({
        id: item.id,
        name: item.name,
        unitPrice: item.price,
        quantity,
        lineTotal: fromCents(toCents(item.price) * quantity),
      });
    }
    if (Object.keys(problems).length) {
      throw new HttpError(409, 'Some items in your cart are unavailable', problems);
    }

    const total = fromCents(lines.reduce((sum, l) => sum + toCents(l.lineTotal), 0));
    const number = 1000 + (await store.incr('counter:order'));
    const id = `${config.orderPrefix}-${number}`;
    const now = new Date().toISOString();
    const order = {
      id,
      customerName: input.customerName,
      phone: input.phone,
      orderType: input.orderType,
      tableNumber: input.tableNumber,
      notes: input.notes,
      items: lines,
      itemCount: lines.reduce((n, l) => n + l.quantity, 0),
      total,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', at: now }],
      createdAt: now,
      updatedAt: now,
    };
    await store.set(`order:${id}`, order);
    res.status(201).json(order);
  });

  api.get('/orders', staffOnly, async (req, res) => {
    const { status } = req.query;
    if (status !== undefined && !ORDER_STATUSES.includes(status)) {
      throw new HttpError(400, 'Validation failed', { status: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }
    const date = validateDateParam(req.query.date);
    let orders = await store.list('order:');
    if (status) orders = orders.filter((o) => o.status === status);
    if (date) orders = orders.filter((o) => dateInShop(o.createdAt) === date);
    orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json(orders);
  });

  api.get('/orders/:id', async (req, res) => {
    const order = await store.get(`order:${req.params.id.toUpperCase()}`);
    if (!order) throw new HttpError(404, 'Order not found. Please check the order number.');
    res.json(order);
  });

  api.patch('/orders/:id/status', staffOnly, async (req, res) => {
    const status = validateStatusInput(req.body);
    const key = `order:${req.params.id.toUpperCase()}`;
    const order = await store.get(key);
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.status !== status) {
      const now = new Date().toISOString();
      order.status = status;
      order.updatedAt = now;
      order.statusHistory = [...(order.statusHistory || []), { status, at: now }];
      await store.set(key, order);
    }
    res.json(order);
  });

  /* ------------------------------- Summary ------------------------------ */
  api.get('/summary', staffOnly, async (req, res) => {
    const today = dateInShop(new Date().toISOString());
    const date = validateDateParam(req.query.date) || today;
    const orders = (await store.list('order:')).filter((o) => dateInShop(o.createdAt) === date);

    const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
    const products = new Map();
    let revenueCents = 0;
    let itemsSold = 0;
    for (const o of orders) {
      byStatus[o.status] += 1;
      revenueCents += toCents(o.total);
      for (const l of o.items) {
        itemsSold += l.quantity;
        const p = products.get(l.id) || { name: l.name, quantity: 0, revenueCents: 0 };
        p.quantity += l.quantity;
        p.revenueCents += toCents(l.lineTotal);
        products.set(l.id, p);
      }
    }
    const topItems = [...products.values()]
      .sort((a, b) => b.quantity - a.quantity || b.revenueCents - a.revenueCents)
      .slice(0, 5)
      .map((p) => ({ name: p.name, quantity: p.quantity, revenue: fromCents(p.revenueCents) }));

    res.json({
      date,
      today,
      timezone: config.timezone,
      totalOrders: orders.length,
      totalRevenue: fromCents(revenueCents),
      averageOrderValue: orders.length ? fromCents(Math.round(revenueCents / orders.length)) : 0,
      itemsSold,
      byStatus,
      topItems,
    });
  });

  app.use('/api', api);

  app.get('/', (_req, res) => {
    res.json({ name: 'Coffee Shop API', health: '/api/health' });
  });

  /* --------------------------- Errors and 404s -------------------------- */
  app.use('/api', (req, _res, next) => next(new HttpError(404, `No such endpoint: ${req.method} ${req.originalUrl}`)));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    let status = err.status || 500;
    let message = err.message;
    let details = err.details;
    if (err.type === 'entity.parse.failed') {
      status = 400;
      message = 'Request body is not valid JSON';
    } else if (err.type === 'entity.too.large') {
      status = 413;
      message = 'Request body is too large (images must be under 450 KB)';
    } else if (status >= 500) {
      console.error(err);
      message = 'Something went wrong on the server';
      details = undefined;
    }
    res.status(status).json({ error: { status, message, ...(details ? { details } : {}) } });
  });

  return app;
}
