import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../../i18n/hooks/useLanguage';
import { createOrderSnapshot } from '../services/orderSnapshot';
import { formatCurrency, formatNumber } from '../../../utils';

interface BillingModalProps {
  onClose: () => void;
}

export function BillingModal({ onClose }: BillingModalProps) {
  const { items } = useCart();
  const { t } = useLanguage();
  const [note, setNote] = useState('');

  const order = useMemo(() => createOrderSnapshot(items, note), [items, note]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="billing-modal" id="printable-bill">
        <div className="modal-head">
          <div>
            <p className="eyebrow">
              SweetShop · Order {order.orderId.slice(0, 8)}
            </p>
            <h2>{t('customerBill')}</h2>
            <p className="muted">
              {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
          <button className="icon-button no-print" onClick={onClose} aria-label={t('closeModal')}>
            <X />
          </button>
        </div>

        <div className="bill-table">
          <div className="bill-row bill-header">
            <span>{t('item')}</span>
            <span>{t('qty')}</span>
            <span>{t('total')}</span>
          </div>

          {order.items.map((item) => (
            <div className="bill-row" key={item.orderItemId}>
              <span>
                <b>{item.productName}</b>
                <small>
                  {item.productId} · {formatCurrency(item.baseUnitPrice)}/{item.baseUnit} ·{' '}
                  {formatCurrency(
                    item.unitGrams
                      ? (item.baseUnitPrice * item.unitGrams) / 1000
                      : 0,
                  )}{' '}
                  per unit
                </small>
              </span>
              <span>{formatNumber(item.quantityInGrams)}g</span>
              <strong>{formatCurrency(item.totalPrice)}</strong>
            </div>
          ))}

          <div className="bill-total">
            <span>{t('grandTotal')}</span>
            <strong>{formatCurrency(order.totalPrice)}</strong>
          </div>
        </div>

        <label className="field no-print">
          {t('additionalNote')}
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Customer name, instructions, payment details..."
          />
        </label>

        {note && (
          <div className="printed-note">
            <b>{t('additionalNote')}</b>
            <p>{note}</p>
          </div>
        )}

        <div className="modal-actions no-print">
          <button className="button ghost" onClick={onClose}>
            {t('closeModal')}
          </button>
          <button className="button primary" onClick={() => window.print()}>
            {t('printBill')}
          </button>
        </div>
      </div>
    </div>
  );
}

