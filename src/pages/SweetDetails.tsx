import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { BackLink } from '../components/common/BackLink';
import { useCart } from '../features/billing/hooks/useCart';
import { useLanguage } from '../features/i18n/hooks/useLanguage';
import { useProducts } from '../features/catalog/hooks/useProducts';
import {
  calculatePriceForWeight,
  calculateWeightForPrice,
  formatCurrency,
  formatNumber,
  roundToTwo,
  safePositiveNumber,
} from '../utils';

export function SweetDetails() {
  const { t, productName } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const { addItem } = useCart();

  const product = products.find((item) => item.id === id);

  const [grams, setGrams] = useState('100.00');
  const [rupees, setRupees] = useState('20.00');

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="page">
          <div className="notice">
            Product not found. <Link to="/sweetlist">{t('backToList')}</Link>
          </div>
        </main>
      </>
    );
  }

  const price = product.perKgPrice;
  const displayName = productName(product.name);
  const inputGrams = safePositiveNumber(grams, 0);
  const inputRupees = safePositiveNumber(rupees, 0);

  return (
    <>
      <Navbar />
      <main className="page detail-page">
        <BackLink to="/sweetlist">{t('backToList')}</BackLink>

        <div className="detail-layout">
          <section>
            <p className="product-id">{product.id}</p>
            <h1>{displayName}</h1>
            <p className="detail-price">
              {price === null
                ? t('priceNotAdded')
                : `${formatCurrency(price)} / kg`}
            </p>
            <p className="muted">
              {price === null
                ? t('pricePending')
                : `${formatCurrency(price / 1000)} per gram`}
            </p>
            <button
              type="button"
              className="button primary"
              disabled={price === null}
              onClick={() => addItem(product, 10, 10, 'g')}
            >
              {t('addToCart')}
            </button>
            <div className="detail-info">
              <h3>{t('ingredients')}</h3>
              <p className="muted">
                {product.ingredients.length
                  ? product.ingredients.join(', ')
                  : t('noIngredients')}
              </p>
            </div>
          </section>

          {price !== null && (
            <section className="conversion-panel">
              <p className="eyebrow">{t('quickConversion')}</p>
              <h2>{t('priceYourWay')}</h2>

              <div className="conversion-card">
                <label>
                  {t('weightToPrice')}
                  <span>{t('costQuestion')}</span>
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
                  {formatCurrency(calculatePriceForWeight(price, inputGrams))}
                </strong>
                <small>
                  ({formatNumber(inputGrams)}g × {formatCurrency(price)}) ÷ 1000.00
                </small>
              </div>

              <div className="conversion-card">
                <label>
                  {t('moneyToWeight')}
                  <span>{t('weightQuestion')}</span>
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
                  {formatNumber(roundToTwo(calculateWeightForPrice(price, inputRupees)))}g
                </strong>
                <small>
                  ({formatCurrency(inputRupees)} × 1000.00) ÷ {formatCurrency(price)}
                </small>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

