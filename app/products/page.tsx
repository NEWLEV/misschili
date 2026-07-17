import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { getProducts } from '@/lib/products';

const CATEGORY_NAMES: Record<string, string> = {
  'fiery-heat': 'Fiery Heat',
  'spicy-hot': 'Spicy Hot',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const { products } = await getProducts({ category, limit: 100 });
  const categoryName = category ? CATEGORY_NAMES[category] || 'Products' : 'All Sauces';

  return (
    <div className="section-container section-padding">
      <nav className="mb-(--space-6)" aria-label="Breadcrumb">
        <ol className="flex items-center gap-(--space-2) text-(--text-sm) text-(--color-text-muted)">
          <li><Link href="/" className="hover:text-(--color-text)">Home</Link></li>
          <li>/</li>
          <li className="text-(--color-text)">{categoryName}</li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-(--space-4) mb-(--space-8)">
        <div>
          <h1 className="text-(--text-4xl) font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {categoryName}
          </h1>
          <p className="text-(--color-text-secondary) mt-1">Showing {products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-(--space-2)">
          <Link href="/products"><Button variant={!category ? 'primary' : 'outline'} size="sm">All</Button></Link>
          <Link href="/products?category=fiery-heat"><Button variant={category === 'fiery-heat' ? 'primary' : 'outline'} size="sm">🔥 Fiery Heat</Button></Link>
          <Link href="/products?category=spicy-hot"><Button variant={category === 'spicy-hot' ? 'primary' : 'outline'} size="sm">🌶️ Spicy Hot</Button></Link>
        </div>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
