import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ItemImage, Price, Stepper } from './Common.jsx';


// Real food and beverage photographs. These override the starter SVG illustrations
// even when the menu has already been seeded in the backend.
const REAL_MENU_PHOTOS = {
  'Espresso': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
  'Americano': 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85',
  'Cappuccino': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85',
  'Café Latte': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85',
  'Flat White': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85',
  'Mocha': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=85',
  'Rooibos Tea': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85',
  'Chai Latte': 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=85',
  'Green Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85',
  'Iced Latte': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85',
  'Caramel Frappé': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=85',
  'Butter Croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85',
  'Blueberry Muffin': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=85',
  'Cinnamon Roll': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85',
  'Chocolate Cake Slice': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85',
  'Chicken Mayo Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85',
  'Cheese & Tomato Toastie': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85',
};


export default function MenuCard({ item }) {
  const { items, add, setQuantity } = useCart();
  const toast = useToast();
  const inCart = items.find((i) => i.id === item.id);

  return (
    <article className={`card menu-card ${item.available ? '' : 'is-soldout'}`}>
      <div className="card-media">
        <ItemImage src={REAL_MENU_PHOTOS[item.name] || item.image} alt={item.name} />
        <span className="chip">{item.category}</span>
        {!item.available && <span className="soldout">Sold out</span>}
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h3>{item.name}</h3>
          <Price value={item.price} />
        </div>
        <p className="card-desc">{item.description}</p>
        <div className="card-foot">
          {!item.available ? (
            <button className="btn btn-block" disabled>
              Unavailable
            </button>
          ) : inCart ? (
            <Stepper value={inCart.quantity} onChange={(q) => setQuantity(item.id, q)} label={item.name} />
          ) : (
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                add(item);
                toast.success(`${item.name} added to your cart`);
              }}
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
