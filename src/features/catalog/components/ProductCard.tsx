import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../../schemas/product.schema';
import { useCart } from '../../billing/hooks/useCart';
import { useLanguage } from '../../i18n/hooks/useLanguage';
import { useRadialGesture } from '../hooks/useRadialGesture';
import { RadialQuantityMenu } from './RadialQuantityMenu';
import { UnitMultiplierControl } from './UnitMultiplierControl';
import { QuickSelectPanel } from './QuickSelectPanel';
import {
  calculateWeightForPrice,
  formatCurrency,
  formatNumber,
  roundToTwo,
} from '../../../utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, updateItemUnits } = useCart();
  const { t, productName } = useLanguage();
  const navigate = useNavigate();

  const displayName = productName(product.name);
  const fallbackImage = `${import.meta.env.BASE_URL}placeholder-image.jpg`;

  const [quickSelect, setQuickSelect] = useState(false);
  const [addMessage, setAddMessage] = useState('');
  const [lastAddedCartItemId, setLastAddedCartItemId] = useState<string | null>(null);
  const [unitCount, setUnitCount] = useState(1);
  const [unitControlVisible, setUnitControlVisible] = useState(false);

  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
      if (unitTimer.current) clearTimeout(unitTimer.current);
    };
  }, []);

  const showAddMessage = (message: string) => {
    setAddMessage(message);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setAddMessage(''), 3500);
  };

  const handleAddKg = (kg: number, closeQuickPanel = false) => {
    if (!Number.isFinite(kg) || kg <= 0) return;
    const roundedKg = roundToTwo(kg);
    const cartItemId = addItem(product, roundToTwo(roundedKg * 1000), roundedKg, 'kg');

    setLastAddedCartItemId(cartItemId);
    setUnitCount(1);
    setUnitControlVisible(true);

    if (unitTimer.current) clearTimeout(unitTimer.current);
    unitTimer.current = setTimeout(() => setUnitControlVisible(false), 3000);

    if (closeQuickPanel) {
      setQuickSelect(false);
      showAddMessage(`Added ${formatNumber(roundedKg)}kg ${displayName} to cart.`);
    }
  };

  const handleAddRupees = (amount: number) => {
    if (!product.perKgPrice || amount <= 0) return;
    const grams = calculateWeightForPrice(product.perKgPrice, amount);
    addItem(product, grams, amount, '₹');
    setQuickSelect(false);
    showAddMessage(
      `Added ₹${formatNumber(amount)} of ${displayName} (${formatNumber(grams)}g) to cart.`,
    );
  };

  const handleApplyUnits = (units: number) => {
    if (!lastAddedCartItemId) return;
    const safeUnits = Math.min(30, Math.max(1, Math.round(units)));
    updateItemUnits(lastAddedCartItemId, safeUnits);
    setUnitCount(safeUnits);
  };

  const elementSelector = `[data-radial-button="${product.id}"]`;

  const {
    isOpen: radialOpen,
    selectedKg: radialSelection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useRadialGesture({
    elementSelector,
    onSelect: (kg) => {
      handleAddKg(kg);
      showAddMessage(`Added ${formatNumber(kg)}kg ${displayName} to cart.`);
    },
  });

  return (
    <article
      className="product-card"
      onClick={(event) => {
        if ((event.target as Element).closest('button, input, textarea, select')) {
          return;
        }
        navigate(`/sweetlist/${product.id}`);
      }}
    >
      <div className="product-top">
        <span className="product-dot">✦</span>
        <img
          className="product-image"
          src={product.imageUrl || fallbackImage}
          alt={`${displayName} sweets`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
      </div>

      <div className="product-details">
        <h3>{displayName}</h3>
        <div
          className="popularity-index"
          aria-label={`${t('popularity')}: ${product.popularityIndex ?? 0} / 5`}
        >
          <span>★</span> {product.popularityIndex ?? 0}/5
        </div>

        <div className="price-row">
          <strong>
            {product.perKgPrice === null
              ? t('priceNotAdded')
              : formatCurrency(product.perKgPrice)}
          </strong>
          {product.perKgPrice !== null && <span>/ kg</span>}
        </div>

        {product.perKgPrice !== null && (
          <div className="conversion-lines">
            <span>10.00g → {formatCurrency(product.perKgPrice / 100)}</span>
            <span>1.00g → {formatCurrency(product.perKgPrice / 1000)}</span>
          </div>
        )}

        {addMessage && (
          <div className="add-message" role="status">
            {addMessage}
          </div>
        )}

        {quickSelect && (
          <QuickSelectPanel
            product={product}
            onAddKg={(kg) => handleAddKg(kg, true)}
            onAddRupees={handleAddRupees}
          />
        )}

        <div className="card-actions">
          <div className={`radial-trigger ${radialOpen ? 'is-open' : ''}`}>
            {radialOpen && <RadialQuantityMenu selectedKg={radialSelection} />}
            <button
              data-radial-button={product.id}
              className="button primary radial-button"
              disabled={product.perKgPrice === null}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onPointerLeave={handlePointerMove}
              onClick={(event) => event.stopPropagation()}
            >
              psize
            </button>
          </div>

          {unitControlVisible && (
            <UnitMultiplierControl
              productId={product.id}
              unitCount={unitCount}
              onApplyUnits={handleApplyUnits}
            />
          )}

          <button
            type="button"
            className="button ghost"
            onClick={(event) => {
              event.stopPropagation();
              setQuickSelect((value) => !value);
            }}
            disabled={product.perKgPrice === null}
          >
            {quickSelect ? t('close') : t('quickAdd')}
          </button>
        </div>
      </div>
    </article>
  );
}

