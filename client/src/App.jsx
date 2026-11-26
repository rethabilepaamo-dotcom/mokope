import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Cart from './pages/Cart.jsx';
import OrderStatus from './pages/OrderStatus.jsx';
import Track from './pages/Track.jsx';
import Staff from './pages/Staff.jsx';

function NotFound() {
  return (
    <div className="page">
      <div className="container narrow center">
        <h1>Page not found</h1>
        <p className="muted">The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:id" element={<OrderStatus />} />
        <Route path="/track" element={<Track />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
