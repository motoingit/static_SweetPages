import { HashRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Billing, Cart, Home, SweetDetails, SweetList } from './pages';
import './index.css';

export default function App() {
  return <CartProvider><HashRouter><Routes><Route path="/" element={<Home />} /><Route path="/sweetlist" element={<SweetList />} /><Route path="/sweetlist/:id" element={<SweetDetails />} /><Route path="/cart" element={<Cart />} /><Route path="/billing" element={<Billing />} /></Routes></HashRouter></CartProvider>;
}
