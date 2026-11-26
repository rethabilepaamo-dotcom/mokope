import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatMoney } from '../utils/format.js';
import { Empty, ItemImage, Stepper } from '../components/Common.jsx';

export const RECENT_KEY = 'lch_recent_orders';

export function rememberOrder(order) {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    const next = [{ id: order.id, total: order.total, createdAt: order.createdAt }, ...list.filter((o) => o.id !== order.id)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

const EMPTY_FORM = { customerName: '', phone: '', orderType: 'pickup', tableNumber: '', notes: '' };

export default function Cart() {
  const { items, total, count, setQuantity, remove, clear, syncWithMenu } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [soldOut, setSoldOut] = useState(new Set());

  // Check the cart against the live menu so prices and availability are always current.
  useEffect(() => {
    let live = true;
    api
      .getMenu()
      .then((menu) => {
        if (!live) return;
        syncWithMenu(menu);
        setSoldOut(new Set(menu.filter((m) => !m.available).map((m) => m.id)));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [syncWithMenu]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blocked = items.some((i) => soldOut.has(i.id));

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    const nextErrors = {};
    if (form.customerName.trim().length < 2) nextErrors.customerName = 'Please enter your name';
    if (!/^[0-9+()\-\s]{0,20}$/.test(form.phone)) nextErrors.phone = 'Use digits, spaces, + ( ) - only';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (blocked) return setFormError('Please remove the sold-out items from your cart.');

    setSubmitting(true);
    try {
      const order = await api.createOrder({
        ...form,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      });
      rememberOrder(order);
      clear();
      toast.success(`Order ${order.id} placed`);
      navigate(`/order/${order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      if (err.status === 400 && err.details) setErrors(err.details);
      if (err.status === 409 && err.details) {
        setSoldOut(new Set(Object.keys(err.details)));
        api.getMenu().then(syncWithMenu).catch(() => {});
      }
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container narrow">
          <Empty title="Your cart is empty">
            Pick something delicious from the menu to get started.
          </Empty>
          <p className="center"><Link to="/menu" className="btn btn-primary btn-lg">Browse the menu</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">Checkout</span>
          <h1>Your order</h1>
        </header>

        <div className="checkout">
          <section className="panel" aria-label="Cart items">
            <h2>Items ({count})</h2>
            <ul className="cart-list">
              {items.map((i) => (
                <li key={i.id} className={soldOut.has(i.id) ? 'is-soldout' : ''}>
                  <ItemImage src={i.image} alt={i.name} className="cart-thumb" />
                  <div className="cart-info">
                    <b>{i.name}</b>
                    <span className="muted">{formatMoney(i.price)} each</span>
                    {soldOut.has(i.id) && <span className="field-error">Sold out. Please remove it.</span>}
                  </div>
                  <Stepper value={i.quantity} onChange={(q) => setQuantity(i.id, q)} label={i.name} />
                  <b className="cart-line">{formatMoney(i.price * i.quantity)}</b>
                  <button className="icon-btn" onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`}>×</button>
                </li>
              ))}
            </ul>
            <div className="total-row">
              <span>Total</span>
              <strong>{formatMoney(total)}</strong>
            </div>
            <Link to="/menu" className="link">← Add more items</Link>
          </section>

          <form className="panel" onSubmit={submit} noValidate>
            <h2>Your details</h2>

            <label className="field">
              <span>Name *</span>
              <input className="input" value={form.customerName} onChange={set('customerName')} placeholder="e.g. Palesa" autoComplete="name" maxLength={60} />
              {errors.customerName && <em className="field-error">{errors.customerName}</em>}
            </label>

            <label className="field">
              <span>Phone (optional)</span>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="e.g. 5800 0000" autoComplete="tel" inputMode="tel" maxLength={20} />
              {errors.phone && <em className="field-error">{errors.phone}</em>}
            </label>

            <fieldset className="field">
              <legend>How would you like your order?</legend>
              <div className="segmented">
                {[['pickup', 'Pick-up'], ['dine-in', 'Dine in']].map(([v, l]) => (
                  <label key={v} className={form.orderType === v ? 'active' : ''}>
                    <input type="radio" name="orderType" value={v} checked={form.orderType === v} onChange={set('orderType')} />
                    {l}
                  </label>
                ))}
              </div>
            </fieldset>

            {form.orderType === 'dine-in' && (
              <label className="field">
                <span>Table number (optional)</span>
                <input className="input" value={form.tableNumber} onChange={set('tableNumber')} maxLength={10} placeholder="e.g. 5" />
              </label>
            )}

            <label className="field">
              <span>Notes (optional)</span>
              <textarea className="input" rows="3" value={form.notes} onChange={set('notes')} maxLength={200} placeholder="Allergies, extra shot, no sugar..." />
            </label>

            {formError && <div className="alert alert-error" role="alert">{formError}</div>}

            <button className="btn btn-primary btn-lg btn-block" disabled={submitting || blocked}>
              {submitting ? 'Placing order...' : `Place order · ${formatMoney(total)}`}
            </button>
            <p className="fine">Pay at the counter when you collect your order.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
