import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { CartItem, Product } from "../types";
import {
  createOrderSnapshot,
  formatCurrency,
  formatNumber,
  priceForWeight,
  roundToTwo,
} from "../utils";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

export function Navbar() {
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  return (
    <>
      <div className="deployment-bar">
        {t("deployed")}:{" "}
        {new Date(__BUILD_TIMESTAMP__).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </div>
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">✦</span> SweetShop
        </Link>
        <nav>
          <Link to="/sweetlist">{t("sweetList")}</Link>
          <Link className="cart-link" to="/cart">
            <ShoppingBag size={18} /> {t("cart")}{" "}
            {totalItems > 0 && <span className="badge">{totalItems}</span>}
          </Link>
          <label className="language-switcher">
            <span>{t("language")}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as "en" | "hi")}
              aria-label={t("language")}
            >
              <option value="en">{t("english")}</option>
              <option value="hi">{t("hindi")}</option>
            </select>
          </label>
        </nav>
      </header>
    </>
  );
}

export function QuantityDragSelector({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [selection, setSelection] = useState(1);
  const startX = useRef<number | null>(null);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const distance = Math.max(0, startX.current - event.clientX);
    setSelection(Math.min(30, Math.max(1, Math.round(distance / 8) + 1)));
  };
  return (
    <div
      className="drag-selector"
      onPointerMove={move}
      onPointerUp={() => {
        addItem(product, selection * 10, selection * 10, "g");
        onClose();
      }}
      onPointerCancel={onClose}
    >
      <div
        className="drag-handle"
        onPointerDown={(event) => {
          startX.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
      >
        <span>← Drag left to choose</span>
        <strong>{formatNumber(selection * 10)}g</strong>
      </div>
      <div className="drag-track">
        <span style={{ width: `${(selection / 30) * 100}%` }} />
      </div>
      <small>Release to add {formatNumber(selection * 10)} grams</small>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [quickSelect, setQuickSelect] = useState(false);
  const [customKg, setCustomKg] = useState("0.12");
  const [rupees, setRupees] = useState("10");
  const [addMessage, setAddMessage] = useState("");
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
    },
    [],
  );
  const showAddMessage = (message: string) => {
    setAddMessage(message);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setAddMessage(""), 3500);
  };
  const addKg = (kg: number, closeQuickPanel = false) => {
    if (!Number.isFinite(kg) || kg <= 0) return;
    addItem(product, roundToTwo(kg * 1000), kg, "kg");
    if (closeQuickPanel) {
      setQuickSelect(false);
      showAddMessage(`Added ${formatNumber(kg)}kg ${product.name} to cart.`);
    }
  };
  const addByRupees = () => {
    const amount = Number(rupees);
    if (product.perKgPrice && amount > 0) {
      const grams = roundToTwo((amount * 1000) / product.perKgPrice);
      addItem(product, grams, amount, "₹");
      setQuickSelect(false);
      showAddMessage(
        `Added ₹${formatNumber(amount)} of ${product.name} (${formatNumber(grams)}g) to cart.`,
      );
    }
  };
  return (
    <article
      className="product-card"
      onClick={() => navigate(`/sweetlist/${product.id}`)}
    >
      <div className="product-top">
        <span className="product-dot">✦</span>
        <img
          className="product-image"
          src={product.imageUrl || `${import.meta.env.BASE_URL}placeholder-image.jpg`}
          alt={`${product.name} sweets`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = `${import.meta.env.BASE_URL}placeholder-image.jpg`;
          }}
        />
      </div>
      <h3>{product.name}</h3>
      <div className="price-row">
        <strong>
          {product.perKgPrice === null
            ? t("priceNotAdded")
            : formatCurrency(product.perKgPrice)}
        </strong>
        {product.perKgPrice !== null && <span>/ kg</span>}
      </div>
      {product.perKgPrice !== null && (
        <div className="conversion-lines">
          <span>10.00g → {formatCurrency(product.perKgPrice / 100)}</span>
          <span>
            ₹1.00 →{" "}
            {product.perKgPrice
              ? `${formatNumber(1000 / product.perKgPrice)}g`
              : "—"}
          </span>
        </div>
      )}
      {addMessage && (
        <div className="add-message" role="status">
          {addMessage}
        </div>
      )}
      {quickSelect && (
        <div
          className="quick-panel"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="quick-options">
              <button onClick={() => addKg(1, true)}>Add 1kg</button>
            <button onClick={() => addKg(0.5, true)}>Add 0.5kg</button>
            <button onClick={() => addKg(0.25, true)}>Add 0.25kg</button>
          </div>
          <div className="quick-inputs">
            <label>
              {t("byKg")}
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={customKg}
                onChange={(event) => setCustomKg(event.target.value)}
              />
              <button onClick={() => addKg(Number(customKg), true)}>{t("add")}</button>
            </label>
            <label>
              {t("byRupee")}
              <input
                type="number"
                min="1"
                step="0.01"
                value={rupees}
                onChange={(event) => setRupees(event.target.value)}
              />
              <button disabled={!product.perKgPrice} onClick={addByRupees}>
                {t("add")}
              </button>
            </label>
          </div>
        </div>
      )}
      <div className="card-actions">
        <button
          className="button primary"
          disabled={product.perKgPrice === null}
          onClick={(event) => {
            event.stopPropagation();
            addKg(1);
            showAddMessage(`Added 1.00kg ${product.name} to cart.`);
          }}
        >
          Add 1kg
        </button>
        <button
          className="button ghost"
          onClick={(event) => {
            event.stopPropagation();
            setQuickSelect((value) => !value);
          }}
          disabled={product.perKgPrice === null}
        >
          {quickSelect ? t("close") : t("quickAdd")}
        </button>
      </div>
    </article>
  );
}

export function CartItemCard({ item }: { item: CartItem }) {
  const { adjustByUnit, updateGrams, removeItem } = useCart();
  const { t } = useLanguage();
  return (
    <article className="cart-item">
      <div className="cart-item-head">
        <div>
          <span className="product-id">{item.id}</span>
          <h3>{item.name}</h3>
        </div>
        <button
          className="icon-button danger"
          onClick={() => removeItem(item.cartItemId)}
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="cart-grid">
        <span>
          {t("rate")}<strong>{formatCurrency(item.perKgPrice ?? 0)}/kg</strong>
        </span>
        <span>
          {t("quantity")}<strong>{formatNumber(item.grams)}g</strong>
          <small>
            {t("selected")}: {formatNumber(item.selectedQuantity)}
            {item.selectedUnit} · {t("unit")}: {formatNumber(item.unitGrams)}g
          </small>
        </span>
        <span>
          {t("total")}
          <strong>
            {formatCurrency(priceForWeight(item.perKgPrice, item.grams))}
          </strong>
        </span>
      </div>
      <div className="cart-controls">
        <button
          className="icon-button"
          onClick={() => adjustByUnit(item.cartItemId, -1)}
          aria-label={`Remove ${formatNumber(item.unitGrams)} grams of ${item.name}`}
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          min={item.unitGrams}
          step="0.01"
          value={formatNumber(item.grams)}
          onChange={(event) =>
            updateGrams(item.cartItemId, Number(event.target.value))
          }
          aria-label={`Weight of ${item.name} in grams`}
        />
        <button
          className="icon-button"
          onClick={() => adjustByUnit(item.cartItemId, 1)}
          aria-label={`Add ${formatNumber(item.unitGrams)} grams of ${item.name}`}
        >
          <Plus size={16} />
        </button>
        <span className="calculation">
          {formatCurrency(item.perKgPrice ?? 0)}/kg × {formatNumber(item.grams)}
          g ÷ 1000.00 ={" "}
          <b>{formatCurrency(priceForWeight(item.perKgPrice, item.grams))}</b>
        </span>
      </div>
    </article>
  );
}

export function BillingModal({ onClose }: { onClose: () => void }) {
  const { items } = useCart();
  const { t } = useLanguage();
  const [note, setNote] = useState("");
  const order = useMemo(() => createOrderSnapshot(items), [items]);
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="billing-modal" id="printable-bill">
        <div className="modal-head">
          <div>
            <p className="eyebrow">
              SweetShop · Order {order.orderId.slice(0, 8)}
            </p>
            <h2>{t("customerBill")}</h2>
            <p className="muted">
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
          <button className="icon-button no-print" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="bill-table">
          <div className="bill-row bill-header">
            <span>{t("item")}</span>
            <span>{t("qty")}</span>
            <span>{t("total")}</span>
          </div>
          {order.items.map((item) => (
            <div className="bill-row" key={item.orderItemId}>
              <span>
                <b>{item.productName}</b>
                <small>
                  {item.productId} · {formatCurrency(item.baseUnitPrice)}/
                  {item.baseUnit} ·{" "}
                  {formatCurrency(
                    item.unitGrams
                      ? (item.baseUnitPrice * item.unitGrams) / 1000
                      : 0,
                  )}{" "}
                  per unit
                </small>
              </span>
              <span>{formatNumber(item.quantityInGrams)}g</span>
              <strong>{formatCurrency(item.totalPrice)}</strong>
            </div>
          ))}
          <div className="bill-total">
            <span>{t("grandTotal")}</span>
            <strong>{formatCurrency(order.totalPrice)}</strong>
          </div>
        </div>
        <label className="field no-print">
          {t("additionalNote")}
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Customer name, instructions, payment details..."
          />
        </label>
        {note && (
          <div className="printed-note">
            <b>{t("additionalNote")}</b>
            <p>{note}</p>
          </div>
        )}
        <div className="modal-actions no-print">
          <button className="button ghost" onClick={onClose}>
            {t("closeModal")}
          </button>
          <button className="button primary" onClick={() => window.print()}>
            {t("printBill")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <Link className="back-link" to={to}>
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}
