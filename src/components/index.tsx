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
  const { addItem, updateItemUnits } = useCart();
  const { t, productName } = useLanguage();
  const displayName = productName(product.name);
  const navigate = useNavigate();
  const [quickSelect, setQuickSelect] = useState(false);
  const [customKg, setCustomKg] = useState("0.12");
  const [rupees, setRupees] = useState("10");
  const [addMessage, setAddMessage] = useState("");
  const [radialOpen, setRadialOpen] = useState(false);
  const [radialSelection, setRadialSelection] = useState<number | null>(null);
  const [lastAddedCartItemId, setLastAddedCartItemId] = useState<string | null>(null);
  const [unitCount, setUnitCount] = useState(1);
  const [unitControlVisible, setUnitControlVisible] = useState(false);
  const [unitRadialOpen, setUnitRadialOpen] = useState(false);
  const [unitRadialSelection, setUnitRadialSelection] = useState<number | null>(null);
  const radialSelectionRef = useRef<number | null>(null);
  const unitRadialSelectionRef = useRef<number | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressStarted = useRef(false);
  const radialMoved = useRef(false);
  const suppressClick = useRef(false);
  const unitLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unitLongPressStarted = useRef(false);
  const unitRadialMoved = useRef(false);
  const unitSuppressClick = useRef(false);
  const unitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
      if (unitTimer.current) clearTimeout(unitTimer.current);
      if (unitLongPressTimer.current) clearTimeout(unitLongPressTimer.current);
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
    const cartItemId = addItem(product, roundToTwo(kg * 1000), kg, "kg");
    setLastAddedCartItemId(cartItemId);
    setUnitCount(1);
    setUnitControlVisible(true);
    if (unitTimer.current) clearTimeout(unitTimer.current);
    unitTimer.current = setTimeout(() => setUnitControlVisible(false), 3000);
    if (closeQuickPanel) {
      setQuickSelect(false);
      showAddMessage(`Added ${formatNumber(kg)}kg ${displayName} to cart.`);
    }
  };
  const addByRupees = () => {
    const amount = Number(rupees);
    if (product.perKgPrice && amount > 0) {
      const grams = roundToTwo((amount * 1000) / product.perKgPrice);
      addItem(product, grams, amount, "₹");
      setQuickSelect(false);
      showAddMessage(
        `Added ₹${formatNumber(amount)} of ${displayName} (${formatNumber(grams)}g) to cart.`,
      );
    }
  };
  const addRadialQuantity = (kg: number) => {
    addKg(kg);
    showAddMessage(`Added ${formatNumber(kg)}kg ${displayName} to cart.`);
  };
  const applyUnitCount = (units: number) => {
    if (!lastAddedCartItemId) return;
    const safeUnits = Math.min(30, Math.max(1, Math.round(units)));
    updateItemUnits(lastAddedCartItemId, safeUnits);
    setUnitCount(safeUnits);
  };
  const updateUnitRadialSelection = (clientX: number, clientY: number) => {
    const button = document.querySelector(`[data-unit-button="${product.id}"]`);
    if (!(button instanceof HTMLElement)) return;
    const bounds = button.getBoundingClientRect();
    const dx = clientX - (bounds.left + bounds.width / 2);
    const dy = clientY - (bounds.top + bounds.height / 2);
    if (Math.hypot(dx, dy) < 30) {
      setUnitRadialSelection(unitCount);
      unitRadialSelectionRef.current = unitCount;
      return;
    }
    const options = [
      { units: 5, angle: Math.PI },
      { units: 10, angle: 0 },
      { units: 20, angle: -Math.PI * 0.75 },
      { units: 30, angle: -Math.PI * 0.25 },
    ];
    const nearest = options.reduce<{ units: number; distance: number }>((best, option) => {
      const distance = Math.hypot(dx - Math.cos(option.angle) * 80, dy - Math.sin(option.angle) * 80);
      return distance < best.distance ? { units: option.units, distance } : best;
    }, { units: 1, distance: Infinity });
    const selection = nearest.distance <= 58 ? nearest.units : null;
    setUnitRadialSelection(selection);
    unitRadialSelectionRef.current = selection;
  };
  const startUnitGesture = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const target = event.currentTarget;
    const pointerId = event.pointerId;
    target.setPointerCapture(pointerId);
    unitLongPressStarted.current = false;
    unitRadialMoved.current = false;
    unitSuppressClick.current = false;
    unitLongPressTimer.current = setTimeout(() => {
      unitLongPressStarted.current = true;
      unitSuppressClick.current = true;
      setUnitRadialOpen(true);
      setUnitRadialSelection(null);
      unitRadialSelectionRef.current = null;
      if ("vibrate" in navigator) navigator.vibrate(15);
    }, 300);
  };
  const moveUnitGesture = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (unitLongPressStarted.current) {
      unitRadialMoved.current = true;
      updateUnitRadialSelection(event.clientX, event.clientY);
    }
  };
  const finishUnitGesture = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (unitLongPressTimer.current) clearTimeout(unitLongPressTimer.current);
    if (unitLongPressStarted.current) {
      if (unitRadialMoved.current && unitRadialSelectionRef.current !== null) {
        applyUnitCount(unitRadialSelectionRef.current);
      }
      setUnitRadialOpen(false);
      setUnitRadialSelection(null);
      unitRadialSelectionRef.current = null;
      unitLongPressStarted.current = false;
      unitRadialMoved.current = false;
      return;
    }
    applyUnitCount(unitCount >= 30 ? 1 : unitCount + 1);
  };
  const cancelUnitGesture = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (unitLongPressTimer.current) clearTimeout(unitLongPressTimer.current);
    setUnitRadialOpen(false);
    setUnitRadialSelection(null);
    unitRadialSelectionRef.current = null;
    unitLongPressStarted.current = false;
    unitRadialMoved.current = false;
  };
  const updateRadialSelection = (clientX: number, clientY: number) => {
    const button = document.querySelector(`[data-radial-button="${product.id}"]`);
    if (!(button instanceof HTMLElement)) return;
    const bounds = button.getBoundingClientRect();
    const dx = clientX - (bounds.left + bounds.width / 2);
    const dy = clientY - (bounds.top + bounds.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 72) {
      setRadialSelection(1);
      radialSelectionRef.current = 1;
      return;
    }
    const candidates: Array<{ kg: number; angle: number }> = [
      { kg: 0.25, angle: Math.PI },
      { kg: 0.5, angle: 0 },
      { kg: 2, angle: -Math.PI * 0.75 },
      { kg: 5, angle: -Math.PI * 0.25 },
    ];
    const radialDistance = 112;
    const nearest = candidates.reduce<{ kg: number; distance: number }>((best, candidate) => {
      const optionX = Math.cos(candidate.angle) * radialDistance;
      const optionY = Math.sin(candidate.angle) * radialDistance;
      const optionDistance = Math.hypot(dx - optionX, dy - optionY);
      return optionDistance < best.distance
        ? { kg: candidate.kg, distance: optionDistance }
        : best;
    }, { kg: 0, distance: Infinity });
    const selection = nearest.distance <= 72 ? nearest.kg : null;
    setRadialSelection(selection);
    radialSelectionRef.current = selection;
  };
  const startRadialGesture = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    longPressStarted.current = false;
    suppressClick.current = false;
    const target = event.currentTarget;
    const pointerId = event.pointerId;
    target.setPointerCapture(pointerId);
    longPressTimer.current = setTimeout(() => {
      longPressStarted.current = true;
      radialMoved.current = false;
      suppressClick.current = true;
      setRadialOpen(true);
      setRadialSelection(null);
      radialSelectionRef.current = null;
      if ("vibrate" in navigator) navigator.vibrate(15);
    }, 300);
  };
  const moveRadialGesture = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (longPressStarted.current) {
      radialMoved.current = true;
      updateRadialSelection(event.clientX, event.clientY);
    }
  };
  const finishRadialGesture = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (longPressStarted.current) {
      if (radialMoved.current && radialSelectionRef.current !== null) {
        addRadialQuantity(radialSelectionRef.current);
      }
      setRadialOpen(false);
      setRadialSelection(null);
      radialSelectionRef.current = null;
      longPressStarted.current = false;
      radialMoved.current = false;
      return;
    }
    addRadialQuantity(1);
  };
  const cancelRadialGesture = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setRadialOpen(false);
    setRadialSelection(null);
    radialSelectionRef.current = null;
    longPressStarted.current = false;
    radialMoved.current = false;
  };
  return (
    <article
      className="product-card"
      onClick={(event) => {
        if ((event.target as Element).closest("button, input, textarea, select")) return;
        navigate(`/sweetlist/${product.id}`);
      }}
    >
      <div className="product-top">
        <span className="product-dot">✦</span>
        <img
          className="product-image"
          src={product.imageUrl || `${import.meta.env.BASE_URL}placeholder-image.jpg`}
          alt={`${displayName} sweets`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = `${import.meta.env.BASE_URL}placeholder-image.jpg`;
          }}
        />
      </div>
      <div className="product-details">
        <h3>{displayName}</h3>
        <div className="popularity-index" aria-label={`${t("popularity")}: ${product.popularityIndex ?? 0} / 5`}>
          <span>★</span> {product.popularityIndex ?? 0}/5
        </div>
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
              1.00g → {formatCurrency(product.perKgPrice / 1000)}
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
          <div className={`radial-trigger ${radialOpen ? "is-open" : ""}`}>
            {radialOpen && (
              <div className="radial-menu" role="menu" aria-label="Choose quantity">
                {[
                  { kg: 2, label: "2 kg", className: "radial-option upper-left" },
                  { kg: 5, label: "5 kg", className: "radial-option upper-right" },
                  { kg: 0.25, label: "¼ kg", className: "radial-option left" },
                  { kg: 0.5, label: "½ kg", className: "radial-option right" },
                ].map((option) => (
                  <span
                    key={option.kg}
                    className={`${option.className} ${radialSelection === option.kg ? "selected" : ""}`}
                  >
                    {option.label}
                  </span>
                ))}
                <span className={`radial-option center ${radialSelection === 1 ? "selected" : ""}`}>
                  1 kg
                </span>
              </div>
            )}
            <button
              data-radial-button={product.id}
              className="button primary radial-button"
              disabled={product.perKgPrice === null}
              onPointerDown={startRadialGesture}
              onPointerMove={moveRadialGesture}
              onPointerUp={finishRadialGesture}
              onPointerCancel={cancelRadialGesture}
              onPointerLeave={moveRadialGesture}
              onClick={(event) => {
                event.stopPropagation();
                suppressClick.current = false;
              }}
            >
              psize
            </button>
          </div>
          {unitControlVisible && (
            <div className={`unit-trigger ${unitRadialOpen ? "is-open" : ""}`}>
              {unitRadialOpen && (
                <div className="unit-radial-menu" role="menu" aria-label="Choose units">
                  {[20, 30, 5, 10].map((units) => (
                    <span
                      key={units}
                      className={`unit-option unit-${units} ${unitRadialSelection === units ? "selected" : ""}`}
                    >
                      ×{units}
                    </span>
                  ))}
                  <span className={`unit-option unit-center ${unitRadialSelection === unitCount ? "selected" : ""}`}>
                    ×{unitCount}
                  </span>
                </div>
              )}
              <button
                data-unit-button={product.id}
                className="button ghost unit-button"
                onPointerDown={startUnitGesture}
                onPointerMove={moveUnitGesture}
                onPointerUp={finishUnitGesture}
                onPointerCancel={cancelUnitGesture}
                onPointerLeave={moveUnitGesture}
                onClick={(event) => {
                  event.stopPropagation();
                  unitSuppressClick.current = false;
                }}
              >
                ×{unitCount}
              </button>
            </div>
          )}
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
      </div>
    </article>
  );
}

export function CartItemCard({ item }: { item: CartItem }) {
  const { adjustByUnit, updateGrams, removeItem } = useCart();
  const { t, productName } = useLanguage();
  const displayName = productName(item.name);
  return (
    <article className="cart-item">
      <img
        className="cart-item-image"
        src={item.imageUrl || `${import.meta.env.BASE_URL}placeholder-image.jpg`}
        alt={`${displayName} sweets`}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = `${import.meta.env.BASE_URL}placeholder-image.jpg`;
        }}
      />
      <div className="cart-item-head">
        <div>
          <span className="product-id">{item.id}</span>
          <h3>{displayName}</h3>
        </div>
        <button
          className="icon-button danger"
          onClick={() => removeItem(item.cartItemId)}
          aria-label={`Remove ${displayName}`}
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
          aria-label={`Remove ${formatNumber(item.unitGrams)} grams of ${displayName}`}
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
          aria-label={`Weight of ${displayName} in grams`}
        />
        <button
          className="icon-button"
          onClick={() => adjustByUnit(item.cartItemId, 1)}
          aria-label={`Add ${formatNumber(item.unitGrams)} grams of ${displayName}`}
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
