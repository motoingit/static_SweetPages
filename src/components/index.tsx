import { useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CartItem, Product } from '../types';
import { formatCurrency, priceForWeight } from '../utils';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { totalItems } = useCart();
  return <header className="topbar"><Link className="brand" to="/"><span className="brand-mark">✦</span> SweetShop</Link><nav><Link to="/sweetlist">Sweet List</Link><Link className="cart-link" to="/cart"><ShoppingBag size={18} /> Cart {totalItems > 0 && <span className="badge">{totalItems}</span>}</Link></nav></header>;
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
  return <div className="drag-selector" onPointerMove={move} onPointerUp={() => { addItem(product, selection * 10); onClose(); }} onPointerCancel={onClose}>
    <div className="drag-handle" onPointerDown={event => { startX.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }}><span>← Drag left to choose</span><strong>{selection * 10}g</strong></div>
    <div className="drag-track"><span style={{ width: `${(selection / 30) * 100}%` }} /></div>
    <small>Release to add {selection * 10} grams</small>
  </div>;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [dragging, setDragging] = useState(false);
  return <article className="product-card">
    <div className="product-top"><span className="product-id">{product.id}</span><span className="product-dot">✦</span></div>
    <h3>{product.name}</h3>
    <div className="price-row"><strong>{product.perKgPrice === null ? 'Price not added' : formatCurrency(product.perKgPrice)}</strong>{product.perKgPrice !== null && <span>/ kg</span>}</div>
    {product.perKgPrice !== null && <p className="muted">{formatCurrency(product.perKgPrice / 1000)} per gram</p>}
    {dragging && <QuantityDragSelector product={product} onClose={() => setDragging(false)} />}
    <div className="card-actions"><button className="button primary" disabled={product.perKgPrice === null} onClick={() => addItem(product)}>Add 10g</button><button className="button ghost" onPointerDown={() => setDragging(true)} disabled={product.perKgPrice === null}>Quick select</button></div>
    <Link className="details-link" to={`/sweetlist/${product.id}`}>View details <ArrowRight size={15} /></Link>
  </article>;
}

export function CartItemCard({ item }: { item: CartItem }) {
  const { updateGrams, removeItem } = useCart();
  return <article className="cart-item"><div className="cart-item-head"><div><span className="product-id">{item.id}</span><h3>{item.name}</h3></div><button className="icon-button danger" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={18} /></button></div><div className="cart-grid"><span>Rate<strong>{formatCurrency(item.perKgPrice ?? 0)}/kg</strong></span><span>Quantity<strong>{item.grams}g</strong></span><span>Total<strong>{formatCurrency(priceForWeight(item.perKgPrice, item.grams))}</strong></span></div><div className="cart-controls"><button className="icon-button" onClick={() => updateGrams(item.id, item.grams - 10)}><Minus size={16} /></button><input type="number" min="10" step="10" value={item.grams} onChange={event => updateGrams(item.id, Number(event.target.value))} aria-label={`Weight of ${item.name} in grams`} /><button className="icon-button" onClick={() => updateGrams(item.id, item.grams + 10)}><Plus size={16} /></button><span className="calculation">{formatCurrency(item.perKgPrice ?? 0)}/kg × {item.grams}g ÷ 1000 = <b>{formatCurrency(priceForWeight(item.perKgPrice, item.grams))}</b></span></div></article>;
}

export function BillingModal({ onClose }: { onClose: () => void }) {
  const { items } = useCart();
  const total = items.reduce((sum, item) => sum + priceForWeight(item.perKgPrice, item.grams), 0);
  const [note, setNote] = useState('');
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="billing-modal" id="printable-bill"><div className="modal-head"><div><p className="eyebrow">SweetShop</p><h2>Customer Bill</h2><p className="muted">{new Date().toLocaleString('en-IN')}</p></div><button className="icon-button no-print" onClick={onClose}><X /></button></div><div className="bill-table"><div className="bill-row bill-header"><span>Item</span><span>Qty</span><span>Total</span></div>{items.map(item => <div className="bill-row" key={item.id}><span><b>{item.name}</b><small>{item.id} · {formatCurrency(item.perKgPrice ?? 0)}/kg</small></span><span>{item.grams}g</span><strong>{formatCurrency(priceForWeight(item.perKgPrice, item.grams))}</strong></div>)}<div className="bill-total"><span>Grand total</span><strong>{formatCurrency(total)}</strong></div></div><label className="field no-print">Additional Note<textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Customer name, instructions, payment details..." /></label>{note && <div className="printed-note"><b>Additional Note</b><p>{note}</p></div>}<div className="modal-actions no-print"><button className="button ghost" onClick={onClose}>Close</button><button className="button primary" onClick={() => window.print()}>Print Bill</button></div></div></div>;
}

export function BackLink({ to, children }: { to: string; children: string }) { return <Link className="back-link" to={to}><ArrowLeft size={16} />{children}</Link>; }
