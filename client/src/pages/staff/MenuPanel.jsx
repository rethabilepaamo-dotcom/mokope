import { useRef, useState } from 'react';
import { api } from '../../api.js';
import { BUILT_IN_IMAGES, CATEGORIES } from '../../config.js';
import { useToast } from '../../context/ToastContext.jsx';
import { fileToDataUrl, formatMoney } from '../../utils/format.js';
import { Empty, ErrorBox, ItemImage, Modal, Spinner, useAsync } from '../../components/Common.jsx';
import { useStaffCall } from './useStaffApi.js';

const BLANK = { name: '', category: 'Coffee', price: '', description: '', image: '/images/menu/latte.svg', available: true };

function ItemForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => (initial ? { ...initial, price: String(initial.price) } : BLANK));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const set = (f) => (e) => setForm((x) => ({ ...x, [f]: e.target.value }));
  const isUpload = form.image.startsWith('data:');
  const builtIn = BUILT_IN_IMAGES.some((b) => b.value === form.image) ? form.image : '';

  async function pickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setForm((x) => ({ ...x, image: '' }));
      const url = await fileToDataUrl(file);
      setForm((x) => ({ ...x, image: url }));
      setErrors((x) => ({ ...x, image: undefined }));
    } catch (err) {
      setErrors((x) => ({ ...x, image: err.message }));
    }
  }

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter a name (at least 2 characters)';
    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price <= 0) next.price = 'Enter a price greater than 0';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        price: Math.round(price * 100) / 100,
        description: form.description.trim(),
        image: form.image,
        available: form.available,
      });
    } catch (err) {
      if (err.details) setErrors(err.details);
      setFormError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title={initial ? 'Edit menu item' : 'Add menu item'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="item-form">
        <div className="form-cols">
          <div>
            <label className="field">
              <span>Name *</span>
              <input className="input" value={form.name} onChange={set('name')} maxLength={60} autoFocus />
              {errors.name && <em className="field-error">{errors.name}</em>}
            </label>
            <div className="field-row">
              <label className="field">
                <span>Category *</span>
                <select className="input" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Price (Maloti) *</span>
                <div className="money-input">
                  <b>M</b>
                  <input className="input" inputMode="decimal" value={form.price} onChange={set('price')} placeholder="0.00" />
                </div>
                {errors.price && <em className="field-error">{errors.price}</em>}
              </label>
            </div>
            <label className="field">
              <span>Description</span>
              <textarea className="input" rows="3" value={form.description} onChange={set('description')} maxLength={200} />
              {errors.description && <em className="field-error">{errors.description}</em>}
            </label>
            <label className="check">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm((x) => ({ ...x, available: e.target.checked }))} />
              <span>Available to order</span>
            </label>
          </div>

          <div>
            <span className="label">Picture</span>
            <div className="preview"><ItemImage src={form.image} alt="Preview" /></div>
            <div className="field-row">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>Upload photo</button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickFile} />
              {form.image && <button type="button" className="btn btn-ghost-dark btn-sm" onClick={() => setForm((x) => ({ ...x, image: '' }))}>Remove</button>}
            </div>
            <label className="field">
              <span>Or choose a built-in picture</span>
              <select className="input" value={builtIn} onChange={(e) => e.target.value && setForm((x) => ({ ...x, image: e.target.value }))}>
                <option value="">{isUpload ? 'Using uploaded photo' : 'Custom'}</option>
                {BUILT_IN_IMAGES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Or paste an image link</span>
              <input className="input" placeholder="https://..." value={isUpload || builtIn ? '' : form.image} onChange={set('image')} />
            </label>
            {errors.image && <em className="field-error">{errors.image}</em>}
          </div>
        </div>

        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : initial ? 'Save changes' : 'Add item'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function MenuPanel() {
  const call = useStaffCall();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(api.getMenu);
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('');

  async function save(values) {
    if (editing === 'new') {
      const item = await call((t) => api.createMenuItem(t, values));
      toast.success(`${item.name} added to the menu`);
    } else {
      const item = await call((t) => api.updateMenuItem(t, editing.id, values));
      toast.success(`${item.name} updated`);
    }
    setEditing(null);
    reload();
  }

  async function toggle(item) {
    try {
      await call((t) => api.updateMenuItem(t, item.id, { available: !item.available }));
      toast.success(`${item.name} is now ${item.available ? 'sold out' : 'available'}`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function confirmDelete() {
    try {
      await call((t) => api.deleteMenuItem(t, deleting.id));
      toast.success(`${deleting.name} deleted`);
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.message);
      setDeleting(null);
    }
  }

  const items = (data || []).filter((i) => !filter || i.name.toLowerCase().includes(filter.toLowerCase()) || i.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section>
      <div className="toolbar">
        <input type="search" className="input search" placeholder="Search menu items" aria-label="Search menu items" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button className="btn btn-primary" onClick={() => setEditing('new')}>+ Add menu item</button>
      </div>

      {loading && !data && <Spinner label="Loading menu..." />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && items.length === 0 && <Empty title="No menu items found" />}

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr><th>Item</th><th>Category</th><th className="num">Price</th><th>Availability</th><th className="actions-col">Actions</th></tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td data-label="Item">
                  <div className="item-cell">
                    <ItemImage src={i.image} alt="" className="thumb" />
                    <div><b>{i.name}</b><small className="muted clamp">{i.description}</small></div>
                  </div>
                </td>
                <td data-label="Category">{i.category}</td>
                <td data-label="Price" className="num"><b>{formatMoney(i.price)}</b></td>
                <td data-label="Availability">
                  <button className={`switch ${i.available ? 'on' : ''}`} role="switch" aria-checked={i.available} aria-label={`${i.name} availability`} onClick={() => toggle(i)}>
                    <i />
                    <span>{i.available ? 'Available' : 'Sold out'}</span>
                  </button>
                </td>
                <td className="actions-col">
                  <button className="btn btn-sm btn-outline" onClick={() => setEditing(i)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => setDeleting(i)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <ItemForm initial={editing === 'new' ? null : editing} onSave={save} onClose={() => setEditing(null)} />}
      {deleting && (
        <Modal title="Delete menu item?" onClose={() => setDeleting(null)}>
          <p>Are you sure you want to delete <b>{deleting.name}</b>? Customers will no longer see it. Existing orders are not affected.</p>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setDeleting(null)}>Cancel</button>
            <button className="btn btn-danger-solid" onClick={confirmDelete}>Delete item</button>
          </div>
        </Modal>
      )}
    </section>
  );
}
