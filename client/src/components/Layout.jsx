import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { SHOP } from '../config.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${SHOP.name} home`}>
      <img src="/favicon.svg" alt="" width="36" height="36" />
      <span>
        {SHOP.name.split(' ')[0]}
        <small>Coffee House</small>
      </span>
    </Link>
  );
}

function Navbar() {
  const { count } = useCart();
  const { isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Logo />
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/track">Track order</NavLink>
          <NavLink to="/staff">{isStaff ? 'Staff dashboard' : 'Staff login'}</NavLink>
        </nav>
        <div className="nav-actions">
          <Link to="/cart" className="cart-btn" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span>Cart</span>
            {count > 0 && <b className="cart-count">{count}</b>}
          </Link>
          <button className="menu-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle navigation">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="muted-light">{SHOP.tagline}</p>
        </div>
        <div>
          <h4>Visit us</h4>
          <p>{SHOP.address}</p>
          {SHOP.hours.map(([d, h]) => (
            <p key={d}>
              {d}: <b>{h}</b>
            </p>
          ))}
        </div>
        <div>
          <h4>Contact</h4>
          <p>{SHOP.phone}</p>
          <p>{SHOP.email}</p>
          <p className="footer-links">
            <Link to="/menu">Menu</Link> · <Link to="/track">Track order</Link> · <Link to="/staff">Staff</Link>
          </p>
        </div>
      </div>
      <div className="container footer-bottom">© {new Date().getFullYear()} {SHOP.name}. All prices are in Maloti (M).</div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
