import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CartItem, Product } from '../types';
import { formatCurrency, formatNumber, priceForWeight, roundToTwo } from '../utils';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { totalItems } = useCart();
  return <><div className="deployment-bar">Last deployed: 07 Nov 2026, 10:40 AM IST</div><header className="topbar"><Link className="brand" to="/"><span className="brand-mark">✦</span> SweetShop</Link><nav><Link to="/sweetlist">Sweet List</Link><Link className="cart-link" to="/cart"><ShoppingBag size={18} /> Cart {totalItems > 0 && <span className="badge">{totalItems}</span>}</Link></nav></header></>;
}

export function QuantityDragSelector({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart();
  const [selection, setSelection] = useState(1);
  const startX = useRef<number | null>(null);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const distance = Math.max(0, startX.current - event.clientX);
    setSelection(Math.min(30, Math.max(1, Math.round(distance / 8) + 1)));
  };
  return <div className="drag-selector" onPointerMove={move} onPointerUp={() => { addItem(product, selection * 10, selection * 10, 'g'); onClose(); }} onPointerCancel={onClose}>
    <div className="drag-handle" onPointerDown={event => { startX.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }}><span>← Drag left to choose</span><strong>{formatNumber(selection * 10)}g</strong></div>
    <div className="drag-track"><span style={{ width: `${(selection / 30) * 100}%` }} /></div>
    <small>Release to add {formatNumber(selection * 10)} grams</small>
  </div>;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quickSelect, setQuickSelect] = useState(false);
  const [customKg, setCustomKg] = useState('0.12');
  const [rupees, setRupees] = useState('10');
  const [addMessage, setAddMessage] = useState('');
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (messageTimer.current) clearTimeout(messageTimer.current);
  }, []);
  const showAddMessage = (message: string) => {
    setAddMessage(message);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setAddMessage(''), 3500);
  };
  const addKg = (kg: number, closeQuickPanel = false) => {
    if (!Number.isFinite(kg) || kg <= 0) return;
    addItem(product, roundToTwo(kg * 1000), kg, 'kg');
    if (closeQuickPanel) {
      setQuickSelect(false);
      showAddMessage(`Added ${formatNumber(kg)}kg ${product.name} to cart.`);
    }
  };
  const addByRupees = () => {
    const amount = Number(rupees);
    if (product.perKgPrice && amount > 0) {
      const grams = roundToTwo((amount * 1000) / product.perKgPrice);
      addItem(product, grams, amount, '₹');
      setQuickSelect(false);
      showAddMessage(`Added ₹${formatNumber(amount)} of ${product.name} (${formatNumber(grams)}g) to cart.`);
    }
  };
  return <article className="product-card" onClick={() => navigate(`/sweetlist/${product.id}`)}>
    <div className="product-top"><span className="product-dot">✦</span></div>
    <h3>{product.name}</h3>
    <div className="price-row"><strong>{product.perKgPrice === null ? 'Price not added' : formatCurrency(product.perKgPrice)}</strong>{product.perKgPrice !== null && <span>/ kg</span>}</div>
    {product.perKgPrice !== null && <div className="conversion-lines"><span>10.00g → {formatCurrency(product.perKgPrice / 100)}</span><span>₹1.00 → {product.perKgPrice ? `${formatNumber(1000 / product.perKgPrice)}g` : '—'}</span></div>}
    {addMessage && <div className="add-message" role="status">{addMessage}</div>}
    {quickSelect && <div className="quick-panel" onClick={event => event.stopPropagation()}>
      <div className="quick-options"><button onClick={() => addKg(1, true)}>Add 1kg</button><button onClick={() => addKg(.5, true)}>Add 0.5kg</button><button onClick={() => addKg(.25, true)}>Add 0.25kg</button></div>
      <div className="quick-inputs"><label>By kg<input type="number" min="0.01" step="0.01" value={customKg} onChange={event => setCustomKg(event.target.value)} /><button onClick={() => addKg(Number(customKg), true)}>Add</button></label><label>By ₹<input type="number" min="1" step="0.01" value={rupees} onChange={event => setRupees(event.target.value)} /><button disabled={!product.perKgPrice} onClick={addByRupees}>Add</button></label></div>
    </div>}
    <div className="card-actions"><button className="button primary" disabled={product.perKgPrice === null} onClick={event => { event.stopPropagation(); addKg(1); showAddMessage(`Added 1.00kg ${product.name} to cart.`); }}>Add 1kg</button><button className="button ghost" onClick={event => { event.stopPropagation(); setQuickSelect(value => !value); }} disabled={product.perKgPrice === null}>{quickSelect ? 'Close' : 'Quick add'}</button></div>
  </article>;
}

export function CartItemCard({ item }: { item: CartItem }) {
  const { adjustByUnit, updateGrams, removeItem } = useCart();
  return <article className="cart-item"><div className="cart-item-head"><div><span className="product-id">{item.id}</span><h3>{item.name}</h3></div><button className="icon-button danger" onClick={() => removeItem(item.cartItemId)} aria-label={`Remove ${item.name}`}><Trash2 size={18} /></button></div><div className="cart-grid"><span>Rate<strong>{formatCurrency(item.perKgPrice ?? 0)}/kg</strong></span><span>Quantity<strong>{formatNumber(item.grams)}g</strong><small>Selected: {formatNumber(item.selectedQuantity)}{item.selectedUnit} · Unit: {formatNumber(item.unitGrams)}g</small></span><span>Total<strong>{formatCurrency(priceForWeight(item.perKgPrice, item.grams))}</strong></span></div><div className="cart-controls"><button className="icon-button" onClick={() => adjustByUnit(item.cartItemId, -1)} aria-label={`Remove ${formatNumber(item.unitGrams)} grams of ${item.name}`}><Minus size={16} /></button><input type="number" min={item.unitGrams} step="0.01" value={formatNumber(item.grams)} onChange={event => updateGrams(item.cartItemId, Number(event.target.value))} aria-label={`Weight of ${item.name} in grams`} /><button className="icon-button" onClick={() => adjustByUnit(item.cartItemId, 1)} aria-label={`Add ${formatNumber(item.unitGrams)} grams of ${item.name}`}><Plus size={16} /></button><span className="calculation">{formatCurrency(item.perKgPrice ?? 0)}/kg × {formatNumber(item.grams)}g ÷ 1000.00 = <b>{formatCurrency(priceForWeight(item.perKgPrice, item.grams))}</b></span></div></article>;
}

export function BillingModal({ onClose }: { onClose: () => void }) {
  const { items } = useCart();
  const total = items.reduce((sum, item) => roundToTwo(sum + priceForWeight(item.perKgPrice, item.grams)), 0);
  const [note, setNote] = useState('');
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="billing-modal" id="printable-bill"><div className="modal-head"><div><p className="eyebrow">SweetShop</p><h2>Customer Bill</h2><p className="muted">{new Date().toLocaleString('en-IN')}</p></div><button className="icon-button no-print" onClick={onClose}><X /></button></div><div className="bill-table"><div className="bill-row bill-header"><span>Item</span><span>Qty</span><span>Total</span></div>{items.map(item => <div className="bill-row" key={item.cartItemId}><span><b>{item.name}</b><small>{item.id} · {formatCurrency(item.perKgPrice ?? 0)}/kg</small></span><span>{formatNumber(item.grams)}g</span><strong>{formatCurrency(priceForWeight(item.perKgPrice, item.grams))}</strong></div>)}<div className="bill-total"><span>Grand total</span><strong>{formatCurrency(total)}</strong></div></div><label className="field no-print">Additional Note<textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Customer name, instructions, payment details..." /></label>{note && <div className="printed-note"><b>Additional Note</b><p>{note}</p></div>}<div className="modal-actions no-print"><button className="button ghost" onClick={onClose}>Close</button><button className="button primary" onClick={() => window.print()}>Print Bill</button></div></div></div>;
}

export function BackLink({ to, children }: { to: string; children: string }) { return <Link className="back-link" to={to}><ArrowLeft size={16} />{children}</Link>; }
