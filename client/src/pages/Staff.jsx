import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import OrdersPanel from './staff/OrdersPanel.jsx';
import MenuPanel from './staff/MenuPanel.jsx';
import SummaryPanel from './staff/SummaryPanel.jsx';

function Login() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="container narrow">
        <header className="page-head">
          <span className="eyebrow">Staff area</span>
          <h1>Staff login</h1>
          <p>Sign in to manage orders and the menu.</p>
        </header>
        <form className="panel" onSubmit={submit}>
          <label className="field">
            <span>Staff password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
          </label>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={busy || !password}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

const TABS = [
  ['orders', 'Orders'],
  ['menu', 'Menu'],
  ['summary', 'Daily summary'],
];

export default function Staff() {
  const { isStaff, logout } = useAuth();
  const [tab, setTab] = useState('orders');
  if (!isStaff) return <Login />;

  return (
    <div className="page">
      <div className="container">
        <header className="page-head row">
          <div>
            <span className="eyebrow">Staff dashboard</span>
            <h1>Manage the coffee shop</h1>
          </div>
          <button className="btn btn-outline" onClick={logout}>Log out</button>
        </header>
        <div className="tabs" role="tablist" aria-label="Dashboard sections">
          {TABS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
        {tab === 'orders' && <OrdersPanel />}
        {tab === 'menu' && <MenuPanel />}
        {tab === 'summary' && <SummaryPanel />}
      </div>
    </div>
  );
}
