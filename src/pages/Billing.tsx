import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { BillingModal } from '../features/billing/components/BillingModal';
import { Cart } from './Cart';

export function Billing() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Cart />
      <BillingModal onClose={() => navigate('/cart')} />
    </>
  );
}

