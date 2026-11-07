import { HashRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { Billing, Cart, Home, SweetDetails, SweetList } from './pages';
import './index.css';

export default function App() {
  return <LanguageProvider><CartProvider><HashRouter><Routes><Route path="/" element={<Home />} /><Route path="/sweetlist" element={<SweetList />} /><Route path="/sweetlist/:id" element={<SweetDetails />} /><Route path="/cart" element={<Cart />} /><Route path="/billing" element={<Billing />} /></Routes></HashRouter></CartProvider></LanguageProvider>;
}
