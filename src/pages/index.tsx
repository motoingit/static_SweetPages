import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ClipboardList, Search, Sparkles } from "lucide-react";
import {
  BackLink,
  BillingModal,
  CartItemCard,
  Navbar,
  ProductCard,
} from "../components/index";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import productsData from "../data/sweetlist.json";
import type { Product } from "../types";
import {
  formatCurrency,
  formatNumber,
  priceForWeight,
  roundToTwo,
} from "../utils";

function useProducts() {
  return { products: productsData as Product[], error: "" };
}

export function Home() {
  const { t } = useLanguage();
  return (
    <>
      <Navbar />
      <main className="home-page">
        <div className="hero-art">
          <Sparkles size={26} />
          <span>Since 1985 · Made with care</span>
        </div>
        <p className="eyebrow">{t("welcome")}</p>
        <h1>SweetShop</h1>
        <p className="hero-copy">
          {t("heroCopy")}
        </p>
        <Link className="button primary large" to="/sweetlist">
          {t("explore")} <ArrowRight size={19} />
        </Link>
        <div className="home-note">
          <ClipboardList size={18} /> {t("quickPricing")}
        </div>
      </main>
    </>
  );
}

export function SweetList() {
  const { t, language, productName } = useLanguage();
  const { products, error } = useProducts();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popularity-high");
  const filtered = useMemo(
    () =>
      [...products]
        .filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            productName(product.name).toLowerCase().includes(query.toLowerCase()) ||
            product.id.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "price-low"
              ? (a.perKgPrice ?? 0) - (b.perKgPrice ?? 0)
              : sort === "price-high"
                ? (b.perKgPrice ?? 0) - (a.perKgPrice ?? 0)
                : (b.popularityIndex ?? 0) - (a.popularityIndex ?? 0),
        ),
    [products, query, sort, language],
  );
  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{t("freshSelection")}</p>
            <h1>{t("sweetList")}</h1>
            <p className="muted">
              {t("listHint")}
            </p>
          </div>
          <div className="list-tools">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder={t("search")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              className="sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label={t("sortLabel")}
            >
              <option value="name">{t("nameAz")}</option>
              <option value="price-low">{t("priceLow")}</option>
              <option value="price-high">{t("priceHigh")}</option>
              <option value="popularity-high">{t("popularityHigh")}</option>
            </select>
          </div>
        </div>
        {error ? (
          <div className="notice error">{error}</div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export function SweetDetails() {
  const { t, productName } = useLanguage();
  const { id } = useParams();
  const { products } = useProducts();
  const product = products.find((item) => item.id === id);
  const { addItem } = useCart();
  const [grams, setGrams] = useState("100.00");
  const [rupees, setRupees] = useState("20.00");
  if (!product)
    return (
      <>
        <Navbar />
        <main className="page">
          <div className="notice">
            Product not found. <Link to="/sweetlist">{t("backToList")}</Link>
          </div>
        </main>
      </>
    );
  const price = product.perKgPrice;
  const displayName = productName(product.name);
  const inputGrams = Number(grams) || 0;
  const inputRupees = Number(rupees) || 0;
  return (
    <>
      <Navbar />
      <main className="page detail-page">
        <BackLink to="/sweetlist">{t("backToList")}</BackLink>
        <div className="detail-layout">
          <section>
            <p className="product-id">{product.id}</p>
            <h1>{displayName}</h1>
            <p className="detail-price">
              {price === null
                ? t("priceNotAdded")
                : `${formatCurrency(price)} / kg`}
            </p>
            <p className="muted">
              {price === null
                ? t("pricePending")
                : `${formatCurrency(price / 1000)} per gram`}
            </p>
            <button
              className="button primary"
              disabled={price === null}
              onClick={() => addItem(product, 10, 10, "g")}
            >
              {t("addToCart")}
            </button>
            <div className="detail-info">
              <h3>{t("ingredients")}</h3>
              <p className="muted">
                {product.ingredients.length
                  ? product.ingredients.join(", ")
                  : t("noIngredients")}
              </p>
            </div>
          </section>
          {price !== null && (
            <section className="conversion-panel">
              <p className="eyebrow">{t("quickConversion")}</p>
              <h2>{t("priceYourWay")}</h2>
              <div className="conversion-card">
                <label>
                  {t("weightToPrice")}<span>{t("costQuestion")}</span>
                </label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={grams}
                    onChange={(event) => setGrams(event.target.value)}
                  />
                  <b>grams</b>
                </div>
                <strong>
                  {formatCurrency(
                    priceForWeight(price, roundToTwo(inputGrams)),
                  )}
                </strong>
                <small>
                  ({formatNumber(inputGrams)}g × {formatCurrency(price)}) ÷
                  1000.00
                </small>
              </div>
              <div className="conversion-card">
                <label>
                  {t("moneyToWeight")}<span>{t("weightQuestion")}</span>
                </label>
                <div className="input-with-suffix">
                  <b>₹</b>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rupees}
                    onChange={(event) => setRupees(event.target.value)}
                  />
                </div>
                <strong>
                  {formatNumber(roundToTwo((inputRupees * 1000) / price))}g
                </strong>
                <small>
                  ({formatCurrency(inputRupees)} × 1000.00) ÷{" "}
                  {formatCurrency(price)}
                </small>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export function Cart() {
  const { t } = useLanguage();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const total = items.reduce(
    (sum, item) =>
      roundToTwo(sum + priceForWeight(item.perKgPrice, item.grams)),
    0,
  );
  const weight = items.reduce((sum, item) => roundToTwo(sum + item.grams), 0);
  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{t("ready")}</p>
            <h1>{t("yourCart")}</h1>
            <p className="muted">
              {items.length
                ? t("reviewCart")
                : t("emptyCart")}
            </p>
          </div>
        </div>
        {items.length ? (
          <>
            <div className="cart-list">
              {items.map((item) => (
                <CartItemCard key={item.cartItemId} item={item} />
              ))}
            </div>
            <section className="summary">
              <div>
                <span>
                  {t("totalProducts")}<strong>{items.length}</strong>
                </span>
                <span>
                  {t("totalWeight")}<strong>{formatNumber(weight)}g</strong>
                </span>
                <span>
                  {t("grandTotal")}
                  <strong className="grand-total">
                    {formatCurrency(total)}
                  </strong>
                </span>
              </div>
              <div className="summary-actions">
                <button className="button ghost" onClick={clearCart}>
                  {t("clearCart")}
                </button>
                <button
                  className="button primary"
                  onClick={() => navigate("/billing")}
                >
                  {t("proceed")} <ArrowRight size={17} />
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h2>{t("noSweets")}</h2>
            <p className="muted">
              {t("pickSweet")}
            </p>
            <Link className="button primary" to="/sweetlist">
              {t("browse")}
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

export function Billing() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <Cart />
      <BillingModal onClose={() => navigate("/cart")} />
    </>
  );
}
