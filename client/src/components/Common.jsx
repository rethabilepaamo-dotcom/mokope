import { useEffect, useState } from 'react';
import { formatMoney } from '../utils/format.js';

export const FALLBACK_IMAGE = '/images/placeholder.svg';

/** Picture with a graceful fallback if the link is broken. */
export function ItemImage({ src, alt, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
  }, [src]);
  return (
    <img
      className={className}
      src={!src || broken ? FALLBACK_IMAGE : src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="center-note" role="status">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 20, label }) {
  return (
    <div className="stepper" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Decrease ${label}`}>
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label}`}>
        +
      </button>
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Price({ value }) {
  return <span className="price">{formatMoney(value)}</span>;
}

/** Hook: load data once, with loading/error state and a retry. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fn()
      .then((data) => live && setState({ data, loading: false, error: '' }))
      .catch((err) => live && setState({ data: null, loading: false, error: err.message }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}
