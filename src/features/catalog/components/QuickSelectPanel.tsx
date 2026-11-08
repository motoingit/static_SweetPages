import { useState } from 'react';
import type { Product } from '../../../schemas/product.schema';
import { useLanguage } from '../../i18n/hooks/useLanguage';
import { safePositiveNumber } from '../../../utils';

interface QuickSelectPanelProps {
  product: Product;
  onAddKg: (kg: number) => void;
  onAddRupees: (rupees: number) => void;
}

export function QuickSelectPanel({
  product,
  onAddKg,
  onAddRupees,
}: QuickSelectPanelProps) {
  const { t } = useLanguage();
  const [customKg, setCustomKg] = useState('0.12');
  const [rupees, setRupees] = useState('10');

  const handleCustomKgAdd = () => {
    const kg = safePositiveNumber(customKg, 0);
    if (kg > 0) {
      onAddKg(kg);
    }
  };

  const handleRupeesAdd = () => {
    const amount = safePositiveNumber(rupees, 0);
    if (amount > 0 && product.perKgPrice) {
      onAddRupees(amount);
    }
  };

  return (
    <div className="quick-panel" onClick={(event) => event.stopPropagation()}>
      <div className="quick-options">
        <button type="button" onClick={() => onAddKg(1)}>Add 1kg</button>
        <button type="button" onClick={() => onAddKg(0.5)}>Add 0.5kg</button>
        <button type="button" onClick={() => onAddKg(0.25)}>Add 0.25kg</button>
      </div>

      <div className="quick-inputs">
        <label>
          {t('byKg')}
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={customKg}
            onChange={(event) => setCustomKg(event.target.value)}
          />
          <button type="button" onClick={handleCustomKgAdd}>{t('add')}</button>
        </label>

        <label>
          {t('byRupee')}
          <input
            type="number"
            min="1"
            step="0.01"
            value={rupees}
            onChange={(event) => setRupees(event.target.value)}
          />
          <button
            type="button"
            disabled={!product.perKgPrice}
            onClick={handleRupeesAdd}
          >
            {t('add')}
          </button>
        </label>
      </div>
    </div>
  );
}

