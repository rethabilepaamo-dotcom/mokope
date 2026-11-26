import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api.js';
import { ORDER_STATUSES } from '../../config.js';
import { formatMoney } from '../../utils/format.js';
import { Empty, ErrorBox, Spinner } from '../../components/Common.jsx';
import { useStaffCall } from './useStaffApi.js';

export default function SummaryPanel() {
  const call = useStaffCall();
  const [date, setDate] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const s = await call((t) => api.getSummary(t, date));
      setData(s);
      if (!date) setDate(s.date);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [call, date]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  if (!data && !error) return <Spinner label="Loading summary..." />;
  const maxQty = Math.max(1, ...(data?.topItems || []).map((i) => i.quantity));

  return (
    <section>
      <div className="toolbar">
        <label className="inline-field">
          <span>Date</span>
          <input type="date" className="input" value={date} max={data?.today} onChange={(e) => setDate(e.target.value)} />
        </label>
        {data && date !== data.today && (
          <button className="btn btn-outline btn-sm" onClick={() => setDate(data.today)}>Back to today</button>
        )}
      </div>
      {error && <ErrorBox message={error} onRetry={load} />}
      {data && (
        <>
          <div className="stats">
            <div className="stat"><span>Orders</span><strong>{data.totalOrders}</strong></div>
            <div className="stat"><span>Revenue</span><strong>{formatMoney(data.totalRevenue)}</strong></div>
            <div className="stat"><span>Items sold</span><strong>{data.itemsSold}</strong></div>
            <div className="stat"><span>Average order</span><strong>{formatMoney(data.averageOrderValue)}</strong></div>
          </div>

          {data.totalOrders === 0 ? (
            <Empty title="No orders on this date">Orders placed on {data.date} will be summarised here.</Empty>
          ) : (
            <div className="two-col">
              <div className="panel">
                <h2>Orders by status</h2>
                <ul className="bars">
                  {ORDER_STATUSES.map((s) => (
                    <li key={s}>
                      <span>{s}</span>
                      <div className="bar"><i className={`bar-${s.toLowerCase()}`} style={{ width: `${(data.byStatus[s] / data.totalOrders) * 100}%` }} /></div>
                      <b>{data.byStatus[s]}</b>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel">
                <h2>Best sellers</h2>
                <ul className="bars">
                  {data.topItems.map((i) => (
                    <li key={i.name}>
                      <span>{i.name}</span>
                      <div className="bar"><i className="bar-item" style={{ width: `${(i.quantity / maxQty) * 100}%` }} /></div>
                      <b>{i.quantity}</b>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <p className="fine left">Dates use the shop time zone ({data.timezone}). All amounts are in Maloti.</p>
        </>
      )}
    </section>
  );
}
