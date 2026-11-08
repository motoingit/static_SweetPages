import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../../schemas/cart.schema';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../../i18n/hooks/useLanguage';
import {
  calculatePriceForWeight,
  formatCurrency,
  formatNumber,
  formatInputNumber,
} from '../../../utils';

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { adjustByUnit, updateGrams, removeItem } = useCart();
  const { t, productName } = useLanguage();
  const displayName = productName(item.name);
  const itemTotal = calculatePriceForWeight(item.perKgPrice, item.grams);
  const fallbackImage = `${import.meta.env.BASE_URL}placeholder-image.jpg`;

  return (
    <article className="cart-item">
      <img
        className="cart-item-image"
        src={item.imageUrl || fallbackImage}
        alt={`${displayName} sweets`}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = fallbackImage;
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
          {t('rate')}
          <strong>{formatCurrency(item.perKgPrice ?? 0)}/kg</strong>
        </span>
        <span>
          {t('quantity')}
          <strong>{formatNumber(item.grams)}g</strong>
          <small>
            {t('selected')}: {formatNumber(item.selectedQuantity)}
            {item.selectedUnit} · {t('unit')}: {formatNumber(item.unitGrams)}g
          </small>
        </span>
        <span>
          {t('total')}
          <strong>{formatCurrency(itemTotal)}</strong>
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
        {/* Use formatInputNumber without commas to prevent HTML5 number input validation errors */}
        <input
          type="number"
          min={item.unitGrams}
          step="0.01"
          value={formatInputNumber(item.grams)}
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
          {formatCurrency(item.perKgPrice ?? 0)}/kg × {formatNumber(item.grams)}g ÷ 1000.00 ={' '}
          <b>{formatCurrency(itemTotal)}</b>
        </span>
      </div>
    </article>
  );
}

