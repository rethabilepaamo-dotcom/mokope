import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../api.js';
import { ORDER_STATUSES } from '../../config.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDateTime, formatMoney, timeAgo } from '../../utils/format.js';
import { Empty, ErrorBox, Spinner, StatusBadge } from '../../components/Common.jsx';
import { useStaffCall } from './useStaffApi.js';

const NEXT = { Pending: 'Preparing', Preparing: 'Ready', Ready: 'Collected' };

export default function OrdersPanel() {
  const call = useStaffCall();
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Active');
  const [query, setQuery] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [busyId, setBusyId] = useState('');
  const seen = useRef(null);
  const [fresh, setFresh] = useState(new Set());

  const load = useCallback(async () => {
    try {
      const list = await call((t) => api.getOrders(t));
      if (seen.current) {
        const added = list.filter((o) => !seen.current.has(o.id)).map((o) => o.id);
        if (added.length) {
          setFresh((f) => new Set([...f, ...added]));
          toast.info(`${added.length} new order${added.length > 1 ? 's' : ''} received`);
        }
      }
      seen.current = new Set(list.map((o) => o.id));
      setOrders(list);
      setError('');
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err.message);
    }
  }, [call, toast]);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  async function setStatus(order, status) {
    if (status === order.status) return;
    setBusyId(order.id);
    try {
      const updated = await call((t) => api.updateOrderStatus(t, order.id, status));
      setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
      toast.success(`${order.id} marked as ${status}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId('');
    }
  }

  const counts = useMemo(() => {
    const c = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
    (orders || []).forEach((o) => (c[o.status] += 1));
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (orders || []).filter((o) => {
      const byStatus = filter === 'All' ? true : filter === 'Active' ? o.status !== 'Collected' : o.status === filter;
      const byQuery = !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
      return byStatus && byQuery;
    });
  }, [orders, filter, query]);

  if (!orders && !error) return <Spinner label="Loading orders..." />;

  return (
    <section>
      <div className="toolbar">
        <div className="tabs pills" role="tablist" aria-label="Filter orders">
          {['Active', ...ORDER_STATUSES, 'All'].map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
              {counts[f] !== undefined && <span className="count">{counts[f]}</span>}
            </button>
          ))}
        </div>
        <input type="search" className="input search" placeholder="Search name or order no." aria-label="Search orders" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <p className="fine left">
        {updatedAt && <>Updated {updatedAt.toLocaleTimeString('en-GB')} · refreshes every 10 seconds · </>}
        <button className="link-btn" onClick={load}>Refresh now</button>
      </p>

      {error && <ErrorBox message={error} onRetry={load} />}
      {orders && visible.length === 0 && <Empty title="No orders here yet">New orders will appear automatically.</Empty>}

      <div className="orders-grid">
        {visible.map((o) => (
          <article key={o.id} className={`panel order-item ${fresh.has(o.id) ? 'is-new' : ''}`} onMouseEnter={() => fresh.has(o.id) && setFresh((f) => { const n = new Set(f); n.delete(o.id); return n; })}>
            <div className="order-head">
              <div>
                <strong className="order-no">{o.id}</strong>
                <span className="muted"> · {timeAgo(o.createdAt)}</span>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <p className="order-who">
              <b>{o.customerName}</b>
              {o.phone && <span className="muted"> · {o.phone}</span>}
              <br />
              <span className="muted">
                {o.orderType === 'dine-in' ? `Dine in${o.tableNumber ? `, table ${o.tableNumber}` : ''}` : 'Pick-up'} · {formatDateTime(o.createdAt)}
              </span>
            </p>
            <ul className="summary-list">
              {o.items.map((l) => (
                <li key={l.id}>
                  <span>{l.quantity} × {l.name}</span>
                  <span className="muted">{formatMoney(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            {o.notes && <p className="note">Note: {o.notes}</p>}
            <div className="total-row small"><span>Total</span><strong>{formatMoney(o.total)}</strong></div>

            <div className="status-actions" role="group" aria-label={`Update status for ${o.id}`}>
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  className={`status-btn ${o.status === s ? 'active' : ''} ${NEXT[o.status] === s ? 'next' : ''}`}
                  disabled={busyId === o.id}
                  aria-pressed={o.status === s}
                  onClick={() => setStatus(o, s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
