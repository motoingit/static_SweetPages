import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { CartItemCard } from '../features/billing/components/CartItemCard';
import { useCart } from '../features/billing/hooks/useCart';
import {
  calculateCartTotal,
  calculateCartTotalWeight,
} from '../features/billing/services/billingCalculator';
import { useLanguage } from '../features/i18n/hooks/useLanguage';
import { formatCurrency, formatNumber } from '../utils';

export function Cart() {
  const { t } = useLanguage();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const total = calculateCartTotal(items);
  const totalWeight = calculateCartTotalWeight(items);

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{t('ready')}</p>
            <h1>{t('yourCart')}</h1>
            <p className="muted">
              {items.length ? t('reviewCart') : t('emptyCart')}
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
                  {t('totalProducts')}
                  <strong>{items.length}</strong>
                </span>
                <span>
                  {t('totalWeight')}
                  <strong>{formatNumber(totalWeight)}g</strong>
                </span>
                <span>
                  {t('grandTotal')}
                  <strong className="grand-total">
                    {formatCurrency(total)}
                  </strong>
                </span>
              </div>
              <div className="summary-actions">
                <button type="button" className="button ghost" onClick={clearCart}>
                  {t('clearCart')}
                </button>
                <button
                  type="button"
                  className="button primary"
                  onClick={() => navigate('/billing')}
                >
                  {t('proceed')} <ArrowRight size={17} />
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h2>{t('noSweets')}</h2>
            <p className="muted">{t('pickSweet')}</p>
            <Link className="button primary" to="/sweetlist">
              {t('browse')}
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

