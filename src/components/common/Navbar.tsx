import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../features/billing/hooks/useCart';
import { useLanguage } from '../../features/i18n/hooks/useLanguage';
import type { Language } from '../../features/i18n/types/i18n.types';

export function Navbar() {
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();

  return (
    <>
      <div className="deployment-bar">
        {t('deployed')}:{' '}
        {new Date(__BUILD_TIMESTAMP__).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </div>
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">✦</span> SweetShop
        </Link>
        <nav>
          <Link to="/sweetlist">{t('sweetList')}</Link>
          <Link className="cart-link" to="/cart">
            <ShoppingBag size={18} /> {t('cart')}{' '}
            {totalItems > 0 && <span className="badge">{totalItems}</span>}
          </Link>
          <label className="language-switcher">
            <span>{t('language')}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              aria-label={t('language')}
            >
              <option value="en">{t('english')}</option>
              <option value="hi">{t('hindi')}</option>
            </select>
          </label>
        </nav>
      </header>
    </>
  );
}

