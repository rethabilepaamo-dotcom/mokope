import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { ORDER_STATUSES } from '../config.js';
import { formatDateTime, formatMoney, formatTime } from '../utils/format.js';
import { Empty, ErrorBox, Spinner, StatusBadge } from '../components/Common.jsx';

const MESSAGES = {
  Pending: 'We have received your order and will start on it shortly.',
  Preparing: 'Your order is being prepared right now.',
  Ready: 'Your order is ready. Please come and collect it.',
  Collected: 'Order collected. Thank you, we hope you enjoyed it!',
};

export default function OrderStatus() {
  const { id } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      setOrder(await api.getOrder(id));
      setError('');
      setNotFound(false);
    } catch (err) {
      if (err.status === 404) setNotFound(true);
      else setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    setOrder(null);
    load();
  }, [load]);

  // Refresh automatically until the order has been collected.
  useEffect(() => {
    if (!order || order.status === 'Collected') return;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [order, load]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (notFound) {
    return (
      <div className="page"><div className="container narrow">
        <Empty title="We could not find that order">Please check the order number and try again.</Empty>
        <p className="center"><Link to="/track" className="btn btn-primary">Try another number</Link></p>
      </div></div>
    );
  }
  if (error && !order) return <div className="page"><div className="container narrow"><ErrorBox message={error} onRetry={load} /></div></div>;
  if (!order) return <div className="page"><Spinner label="Loading your order..." /></div>;

  const step = ORDER_STATUSES.indexOf(order.status);
  const timeFor = (s) => order.statusHistory?.find((h) => h.status === s)?.at;

  return (
    <div className="page">
      <div className="container narrow">
        {state?.justPlaced && (
          <div className="confirm">
            <div className="tick" aria-hidden="true">✓</div>
            <h1>Thank you, {order.customerName}!</h1>
            <p>Your order has been placed.</p>
          </div>
        )}

        <section className="panel order-card">
          <div className="order-head">
            <div>
              <span className="eyebrow">Order number</span>
              <div className="order-number">
                <strong>{order.id}</strong>
                <button className="btn btn-sm btn-outline" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <ol className="progress" aria-label="Order progress">
            {ORDER_STATUSES.map((s, i) => (
              <li key={s} className={i < step ? 'done' : i === step ? 'current' : ''}>
                <span className="dot">{i < step ? '✓' : i + 1}</span>
                <b>{s}</b>
                <small>{timeFor(s) ? formatTime(timeFor(s)) : ''}</small>
              </li>
            ))}
          </ol>
          <p className="status-msg">{MESSAGES[order.status]}</p>

          <h2>Order summary</h2>
          <ul className="summary-list">
            {order.items.map((l) => (
              <li key={l.id}>
                <span>{l.quantity} × {l.name}</span>
                <b>{formatMoney(l.lineTotal)}</b>
              </li>
            ))}
          </ul>
          <div className="total-row"><span>Total</span><strong>{formatMoney(order.total)}</strong></div>

          <dl className="meta">
            <div><dt>Placed</dt><dd>{formatDateTime(order.createdAt)}</dd></div>
            <div><dt>Type</dt><dd>{order.orderType === 'dine-in' ? `Dine in${order.tableNumber ? `, table ${order.tableNumber}` : ''}` : 'Pick-up'}</dd></div>
            {order.notes && <div><dt>Notes</dt><dd>{order.notes}</dd></div>}
          </dl>
          {order.status !== 'Collected' && <p className="fine">This page updates automatically. Pay at the counter when you collect.</p>}
        </section>

        <p className="center actions">
          <Link to="/menu" className="btn btn-primary">Order something else</Link>
          <Link to="/track" className="btn btn-outline">Track another order</Link>
        </p>
      </div>
    </div>
  );
}
