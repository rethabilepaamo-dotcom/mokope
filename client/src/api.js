// All communication with the Express backend goes through the Fetch API in this file.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server. Please check your connection and try again.', 0);
  }

  if (res.status === 204) return null;
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* response had no JSON body */
  }
  if (!res.ok) {
    throw new ApiError(data?.error?.message || `Request failed (${res.status})`, res.status, data?.error?.details);
  }
  return data;
}

export const api = {
  health: () => request('/health'),

  // Public
  getMenu: () => request('/menu'),
  createOrder: (order) => request('/orders', { method: 'POST', body: order }),
  getOrder: (id) => request(`/orders/${encodeURIComponent(id)}`),

  // Staff
  login: (password) => request('/auth/login', { method: 'POST', body: { password } }),
  getOrders: (token, status) => request(`/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`, { token }),
  updateOrderStatus: (token, id, status) =>
    request(`/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status }, token }),
  getSummary: (token, date) => request(`/summary${date ? `?date=${date}` : ''}`, { token }),
  createMenuItem: (token, item) => request('/menu', { method: 'POST', body: item, token }),
  updateMenuItem: (token, id, changes) => request(`/menu/${id}`, { method: 'PUT', body: changes, token }),
  deleteMenuItem: (token, id) => request(`/menu/${id}`, { method: 'DELETE', token }),
};
