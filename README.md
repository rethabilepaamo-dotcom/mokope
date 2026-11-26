# Lesedi Coffee House – Coffee Shop Management System

Full-stack web application: customers browse the menu (prices in **Maloti, M**), build a cart, place an order and track it live; staff manage the menu and process orders from a protected dashboard.

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React 19, React Router, Vite, Fetch API | Vercel or Netlify |
| Backend | Node.js, Express 5 REST API | Render |
| Database | Redis (key-value NoSQL, persistence on) | Upstash / Redis Cloud |
| Collaboration | Git + GitHub | GitHub |

## Features
**Customers:** menu with pictures, categories, search, availability and prices in Maloti · cart with quantity changes (saved in the browser) · checkout with name, phone, pick-up/dine-in, table and notes · confirmation with a unique order number (e.g. `LCH-1001`) · live order tracking page (Pending → Preparing → Ready → Collected).

**Staff (password protected):** view and search orders, update status · add, edit, delete menu items · change prices and availability · upload a photo per item · daily summary (orders, revenue in Maloti, items sold, best sellers, status breakdown).

## Run locally
Requirements: Node.js 18+.

```bash
# 1. API  (terminal 1)
cd server
npm install
cp .env.example .env        # then edit STAFF_PASSWORD
npm run dev                 # http://localhost:5000

# 2. Website (terminal 2)
cd client
npm install
npm run dev                 # http://localhost:5173
```
Without `REDIS_URL` the API stores data in `server/data/db.json` (same key-value structure, survives restarts). To use Redis locally:
`docker run -p 6379:6379 redis redis-server --appendonly yes` and set `REDIS_URL=redis://localhost:6379`.

The starter menu (17 items with pictures) is created automatically the first time the API starts. Default staff password in development: `coffee123` (set `STAFF_PASSWORD` to change it).

Tests: `cd server && npm test` (8 API tests: CRUD, validation, auth, order flow, persistence).

## Data model (key-value)
| Key | Value (JSON) |
|---|---|
| `menu:<uuid>` | `{ id, name, category, price, description, available, image, createdAt, updatedAt }` |
| `order:<LCH-1001>` | `{ id, customerName, phone, orderType, tableNumber, notes, items[], total, status, statusHistory[], createdAt }` |
| `counter:order` | integer, incremented atomically to generate order numbers |
| `meta:seeded` | flag so the starter menu is created once |

Order totals are always calculated on the server from stored prices.

## REST API
Staff endpoints need the header `Authorization: Bearer <token>` (from `POST /api/auth/login`).

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | public | Backend and database check |
| POST | `/api/auth/login` | public | `{ password }` → `{ token }` |
| GET | `/api/menu` | public | All menu items |
| GET | `/api/menu/:id` | public | One menu item |
| POST | `/api/menu` | staff | Add a menu item |
| PUT | `/api/menu/:id` | staff | Update name, price, availability, etc. |
| DELETE | `/api/menu/:id` | staff | Delete a menu item |
| POST | `/api/orders` | public | Place an order `{ customerName, items:[{id,quantity}], ... }` |
| GET | `/api/orders` | staff | List orders (`?status=`, `?date=YYYY-MM-DD`) |
| GET | `/api/orders/:id` | public | One order (needs the order number) |
| PATCH | `/api/orders/:id/status` | staff | `{ status }`: Pending, Preparing, Ready, Collected |
| GET | `/api/summary` | staff | Daily summary (`?date=`) |

Errors always look like `{ "error": { "status": 400, "message": "...", "details": { "field": "..." } } }`.

## Deployment
1. **GitHub:** push this folder to a repository.
2. **Database:** create a free Redis database at [Upstash](https://upstash.com) (persistent) and copy the `rediss://...` connection URL.
3. **Backend on Render:** New → Web Service → pick the repo, root directory `server`, build `npm install`, start `npm start` (or use `render.yaml`). Environment variables: `REDIS_URL`, `STAFF_PASSWORD`, `CORS_ORIGIN` (your frontend URL), optional `AUTH_SECRET`. Open `https://<your-api>.onrender.com/api/health`; it should return `"status":"ok"`.
4. **Frontend on Vercel/Netlify:** import the repo, root directory `client`, build `npm run build`, output `dist`. Add environment variable `VITE_API_URL=https://<your-api>.onrender.com`. Routing files (`vercel.json`, `public/_redirects`) are included.
5. Go back to Render and set `CORS_ORIGIN` to the final frontend URL. Credentials stay in the backend environment only.

Note: Render's free plan sleeps after inactivity, so the first request can take up to a minute (the site shows a message while it wakes up).


## Real food and beverage photographs
The customer-facing menu cards now use real food and drink photographs hosted by Unsplash rather than the original illustrated SVG pictures. The image mapping is in `client/src/components/MenuCard.jsx`. It is based on each menu item's name, so it also replaces the old pictures for menu items that were already saved in the backend. The homepage hero and story-section images have also been changed. An internet connection is required to load these photographs.

## Customising
* Shop name, address, phone and opening hours: `client/src/config.js`.
* Menu pictures are illustrated SVGs in `client/public/images/menu/` (regenerate with `npm run images` in `client`). Staff can upload their own photos per item in the dashboard.
* Staff dashboard: `/staff`.

## Group contributions
| Member | Contribution |
|---|---|
| _Name_ | _e.g. Express API and Redis storage_ |
| _Name_ | _e.g. React customer interface_ |
| _Name_ | _e.g. Staff dashboard, testing, deployment_ |
