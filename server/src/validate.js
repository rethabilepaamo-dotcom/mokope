export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const CATEGORIES = ['Coffee', 'Tea', 'Cold Drinks', 'Pastries', 'Light Bites'];
export const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Collected'];
export const ORDER_TYPES = ['pickup', 'dine-in'];

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const cleanString = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v);

function fail(errors) {
  throw new HttpError(400, 'Validation failed', errors);
}

/** Money helpers: always work in whole cents to avoid floating point errors. */
export const toCents = (n) => Math.round(Number(n) * 100);
export const fromCents = (c) => c / 100;

const IMAGE_RE = /^(https?:\/\/\S+|\/[^\s]*|data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+)$/;
const MAX_IMAGE_LENGTH = 600_000; // characters (about 450 KB of image data)

export function validateMenuInput(body, { partial = false } = {}) {
  if (!isObject(body)) fail({ body: 'Request body must be a JSON object' });
  const errors = {};
  const out = {};

  if (!partial || body.name !== undefined) {
    const name = cleanString(body.name);
    if (typeof name !== 'string' || name.length < 2 || name.length > 60) {
      errors.name = 'Name is required (2 to 60 characters)';
    } else out.name = name;
  }

  if (!partial || body.price !== undefined) {
    const price = typeof body.price === 'string' && body.price.trim() !== '' ? Number(body.price) : body.price;
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0 || price > 10000) {
      errors.price = 'Price must be a number greater than 0 (in Maloti)';
    } else out.price = fromCents(toCents(price));
  }

  if (!partial || body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      errors.category = `Category must be one of: ${CATEGORIES.join(', ')}`;
    } else out.category = body.category;
  }

  if (body.description !== undefined) {
    const d = cleanString(body.description);
    if (typeof d !== 'string' || d.length > 200) errors.description = 'Description must be text up to 200 characters';
    else out.description = d;
  } else if (!partial) out.description = '';

  if (body.available !== undefined) {
    if (typeof body.available !== 'boolean') errors.available = 'Available must be true or false';
    else out.available = body.available;
  } else if (!partial) out.available = true;

  if (body.image !== undefined) {
    const img = typeof body.image === 'string' ? body.image.trim() : body.image;
    if (img === '' || img === null) out.image = '';
    else if (typeof img !== 'string' || img.length > MAX_IMAGE_LENGTH || !IMAGE_RE.test(img)) {
      errors.image = 'Image must be an http(s) link, a site path, or an uploaded PNG/JPEG/WebP under 450 KB';
    } else out.image = img;
  } else if (!partial) out.image = '';

  if (Object.keys(errors).length) fail(errors);
  if (partial && Object.keys(out).length === 0) fail({ body: 'Provide at least one field to update' });
  return out;
}

export function validateOrderInput(body) {
  if (!isObject(body)) fail({ body: 'Request body must be a JSON object' });
  const errors = {};
  const out = {};

  const name = cleanString(body.customerName);
  if (typeof name !== 'string' || name.length < 2 || name.length > 60) {
    errors.customerName = 'Please enter your name (2 to 60 characters)';
  } else out.customerName = name;

  const phone = cleanString(body.phone ?? '');
  if (typeof phone !== 'string' || !/^[0-9+()\-\s]{0,20}$/.test(phone)) {
    errors.phone = 'Phone number may only contain digits, spaces, + ( ) -';
  } else out.phone = phone;

  const orderType = body.orderType ?? 'pickup';
  if (!ORDER_TYPES.includes(orderType)) errors.orderType = 'Order type must be pickup or dine-in';
  else out.orderType = orderType;

  const table = cleanString(body.tableNumber ?? '');
  if (typeof table !== 'string' || table.length > 10) errors.tableNumber = 'Table number is too long';
  else out.tableNumber = out.orderType === 'dine-in' ? table : '';

  const notes = cleanString(body.notes ?? '');
  if (typeof notes !== 'string' || notes.length > 200) errors.notes = 'Notes must be up to 200 characters';
  else out.notes = notes;

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.items = 'Your order must contain at least one item';
  } else if (body.items.length > 30) {
    errors.items = 'An order can contain at most 30 different items';
  } else {
    const merged = new Map();
    for (const line of body.items) {
      const id = isObject(line) ? line.id : undefined;
      const qty = isObject(line) ? line.quantity : undefined;
      if (typeof id !== 'string' || !id || !Number.isInteger(qty) || qty < 1 || qty > 20) {
        errors.items = 'Each item needs an id and a quantity between 1 and 20';
        break;
      }
      merged.set(id, (merged.get(id) || 0) + qty);
    }
    if (!errors.items) {
      out.items = [...merged].map(([id, quantity]) => ({ id, quantity }));
      if (out.items.some((l) => l.quantity > 20)) errors.items = 'Maximum quantity per item is 20';
    }
  }

  if (Object.keys(errors).length) fail(errors);
  return out;
}

export function validateStatusInput(body) {
  if (!isObject(body) || !ORDER_STATUSES.includes(body.status)) {
    fail({ status: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
  }
  return body.status;
}

export function validateDateParam(value) {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    fail({ date: 'Date must be in YYYY-MM-DD format' });
  }
  return value;
}
