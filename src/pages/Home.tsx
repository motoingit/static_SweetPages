import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Sparkles } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { useLanguage } from '../features/i18n/hooks/useLanguage';

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
        <p className="eyebrow">{t('welcome')}</p>
        <h1>SweetShop</h1>
        <p className="hero-copy">{t('heroCopy')}</p>
        <Link className="button primary large" to="/sweetlist">
          {t('explore')} <ArrowRight size={19} />
        </Link>
        <div className="home-note">
          <ClipboardList size={18} /> {t('quickPricing')}
        </div>
      </main>
    </>
  );
}

