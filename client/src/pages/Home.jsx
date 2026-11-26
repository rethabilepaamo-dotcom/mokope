import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { SHOP } from '../config.js';
import { formatMoney } from '../utils/format.js';
import MenuCard from '../components/MenuCard.jsx';
import { ErrorBox, Spinner, useAsync } from '../components/Common.jsx';

const FAVOURITES = ['Cappuccino', 'Café Latte', 'Butter Croissant', 'Chocolate Cake Slice'];

const FEATURES = [
  ['Fresh every day', 'Small-batch coffee and pastries baked each morning.'],
  ['Order ahead', 'Choose your favourites online and skip the queue.'],
  ['Live order tracking', 'See when your order is being prepared and when it is ready.'],
];

export default function Home() {
  const { data: menu, loading, error, reload } = useAsync(api.getMenu);
  const available = (menu || []).filter((m) => m.available);
  const cheapest = available.length ? Math.min(...available.map((m) => m.price)) : null;
  const favourites = menu
    ? FAVOURITES.map((n) => menu.find((m) => m.name === n)).filter(Boolean).concat(menu.filter((m) => m.available)).filter((m, i, a) => a.indexOf(m) === i).slice(0, 4)
    : [];

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Maseru, Lesotho</span>
            <h1>Coffee worth slowing down for.</h1>
            <p>
              From a perfectly pulled espresso to warm, freshly baked pastries. Browse the menu, order online and collect
              when it is ready.
            </p>
            <div className="hero-cta">
              <Link to="/menu" className="btn btn-accent btn-lg">Order now</Link>
              <Link to="/track" className="btn btn-ghost btn-lg">Track an order</Link>
            </div>
            <ul className="hero-stats">
              <li><b>{menu ? menu.length : '...'}</b> items on the menu</li>
              <li><b>{cheapest !== null ? `From ${formatMoney(cheapest).replace('.00', '')}` : 'Prices in M'}</b> in Maloti</li>
              <li><b>7 days</b> a week</li>
            </ul>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1400&q=85" alt="Warm coffee house interior" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container features">
          {FEATURES.map(([title, text], i) => (
            <div className="feature" key={title}>
              <span className="feature-num">{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Customer favourites</span>
              <h2>Our most-loved picks</h2>
            </div>
            <Link to="/menu" className="btn btn-outline">View full menu</Link>
          </div>
          {loading && <Spinner label="Loading the menu..." />}
          {error && <ErrorBox message={error} onRetry={reload} />}
          <div className="grid">
            {favourites.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about">
          <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85" alt="Freshly prepared coffee in a cafe" className="about-img" loading="lazy" />
          <div>
            <span className="eyebrow">Our story</span>
            <h2>A neighbourhood coffee house, built around good people.</h2>
            <p>
              {SHOP.name} started with a simple idea: serve honest, well-made coffee in a warm space where everyone feels at
              home. Today you can order from your phone and we will have it ready for you.
            </p>
            <div className="hours">
              <h4>Opening hours</h4>
              {SHOP.hours.map(([d, h]) => (
                <div key={d} className="hours-row">
                  <span>{d}</span>
                  <b>{h}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <h2>Hungry? Your order is a few taps away.</h2>
          <Link to="/menu" className="btn btn-accent btn-lg">Browse the menu</Link>
        </div>
      </section>
    </>
  );
}
