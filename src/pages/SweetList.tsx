import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { ProductCard } from '../features/catalog/components/ProductCard';
import { useProducts } from '../features/catalog/hooks/useProducts';
import { productService } from '../features/catalog/services/productService';
import { useLanguage } from '../features/i18n/hooks/useLanguage';

export function SweetList() {
  const { t, language, productName } = useLanguage();
  const { products, error } = useProducts();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('popularity-high');

  const filteredProducts = useMemo(
    () => productService.filterAndSortProducts(products, query, sort, productName),
    [products, query, sort, language, productName],
  );

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{t('freshSelection')}</p>
            <h1>{t('sweetList')}</h1>
            <p className="muted">{t('listHint')}</p>
          </div>
          <div className="list-tools">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder={t('search')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t('search')}
              />
            </div>
            <select
              className="sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label={t('sortLabel')}
            >
              <option value="name">{t('nameAz')}</option>
              <option value="price-low">{t('priceLow')}</option>
              <option value="price-high">{t('priceHigh')}</option>
              <option value="popularity-high">{t('popularityHigh')}</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="notice error">{error}</div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

