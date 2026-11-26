import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateTime, formatMoney } from '../utils/format.js';
import { RECENT_KEY } from './Cart.jsx';

export default function Track() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  let recent = [];
  try {
    recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    recent = [];
  }

  function submit(e) {
    e.preventDefault();
    const id = value.trim().toUpperCase().replace(/^#/, '');
    if (!/^[A-Z]{2,6}-\d{3,}$/.test(id)) {
      return setError('Order numbers look like LCH-1001.');
    }
    navigate(`/order/${id}`);
  }

  return (
    <div className="page">
      <div className="container narrow">
        <header className="page-head">
          <span className="eyebrow">Track your order</span>
          <h1>Where is my order?</h1>
          <p>Enter the order number from your confirmation to see its progress.</p>
        </header>

        <form className="panel track-form" onSubmit={submit} noValidate>
          <label className="field">
            <span>Order number</span>
            <input
              className="input"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              placeholder="e.g. LCH-1001"
              autoCapitalize="characters"
            />
            {error && <em className="field-error">{error}</em>}
          </label>
          <button className="btn btn-primary btn-lg btn-block">Track order</button>
        </form>

        {recent.length > 0 && (
          <section className="panel">
            <h2>Your recent orders</h2>
            <ul className="summary-list">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link to={`/order/${o.id}`} className="link"><b>{o.id}</b></Link>
                  <span className="muted">{formatDateTime(o.createdAt)} · {formatMoney(o.total)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
