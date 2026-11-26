import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { CATEGORIES } from '../config.js';
import { useCart } from '../context/CartContext.jsx';
import { formatMoney } from '../utils/format.js';
import MenuCard from '../components/MenuCard.jsx';
import { Empty, ErrorBox, useAsync } from '../components/Common.jsx';

export default function Menu() {
  const { data: menu, loading, error, reload } = useAsync(api.getMenu);
  const { count, total } = useCart();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [slow, setSlow] = useState(false);

  // Free hosting can take a few seconds to wake up: tell the customer why we are waiting.
  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return undefined;
    }
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [loading]);

  const visible = useMemo(() => {
    if (!menu) return [];
    const q = query.trim().toLowerCase();
    return menu.filter(
      (m) =>
        (category === 'All' || m.category === category) &&
        (!q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
    );
  }, [menu, category, query]);

  const present = menu ? CATEGORIES.filter((c) => menu.some((m) => m.category === c)) : CATEGORIES;

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">Our menu</span>
          <h1>Coffee, tea, pastries and more</h1>
          <p>All prices are in Maloti (M). Add your favourites to the cart and check out when you are ready.</p>
        </header>

        <div className="toolbar">
          <div className="tabs" role="tablist" aria-label="Menu categories">
            {['All', ...present].map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                className={`tab ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            type="search"
            className="input search"
            placeholder="Search the menu"
            aria-label="Search the menu"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && <ErrorBox message={error} onRetry={reload} />}
        {loading && (
          <>
            <div className="grid">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="card skeleton" />
              ))}
            </div>
            {slow && <p className="center-note">The server is waking up. This can take up to a minute the first time.</p>}
          </>
        )}

        {!loading && !error && visible.length === 0 && (
          <Empty title="Nothing matches your search">Try another category or a different word.</Empty>
        )}
        <div className="grid">
          {visible.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {count > 0 && (
        <Link to="/cart" className="cart-bar">
          <span>
            {count} item{count > 1 ? 's' : ''} in your cart
          </span>
          <b>View cart · {formatMoney(total)}</b>
        </Link>
      )}
    </div>
  );
}
