'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/storefront/CartProvider';
import { formatPrice } from '@/lib/utils';

const ALL_PRODUCTS = [
  {
    id: 'fiery-heat-001', slug: 'fiery-heat-ghost-pepper', name: 'Fiery Heat — Ghost Pepper',
    sku: 'MC-FH-5OZ', description: 'Made for heatseekers. A rush of sweetness, spices, and fiery heat.',
    price: 12.99, salePrice: null, imageUrl: '/images/logos/MissChili_Logos_FieryHeat.png',
    category: 'fiery-heat', categoryName: 'Fiery Heat', heatLevel: 9,
    volume: '5 fl oz (148 ml)', rating: 4.9, reviewCount: 24, maxQuantity: 50,
  },
  {
    id: 'spicy-hot-001', slug: 'spicy-hot-jalapeno-habanero', name: 'Spicy Hot — Jalapeño Habanero',
    sku: 'MC-SH-5OZ', description: 'Jalapeño flavor combined with habanero peppers and fresh spices.',
    price: 11.99, salePrice: null, imageUrl: '/images/logos/MissChili_Logos_SpicyHot.png',
    category: 'spicy-hot', categoryName: 'Spicy Hot', heatLevel: 7,
    volume: '5 fl oz (148 ml)', rating: 4.8, reviewCount: 18, maxQuantity: 50,
  },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const { addItem } = useCart();

  const filtered = category ? ALL_PRODUCTS.filter((p) => p.category === category) : ALL_PRODUCTS;

  return (
    <div className="section-container section-padding">
      <nav className="mb-[var(--space-6)]" aria-label="Breadcrumb">
        <ol className="flex items-center gap-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-text-muted)]">
          <li><Link href="/" className="hover:text-[var(--color-text)]">Home</Link></li>
          <li>/</li>
          <li className="text-[var(--color-text)]">{category ? filtered[0]?.categoryName || 'Products' : 'All Sauces'}</li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[var(--space-4)] mb-[var(--space-8)]">
        <div>
          <h1 className="text-[var(--text-4xl)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {category ? filtered[0]?.categoryName : 'All Sauces'}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-[var(--space-2)]">
          <Link href="/products"><Button variant={!category ? 'primary' : 'outline'} size="sm">All</Button></Link>
          <Link href="/products?category=fiery-heat"><Button variant={category === 'fiery-heat' ? 'primary' : 'outline'} size="sm">🔥 Fiery Heat</Button></Link>
          <Link href="/products?category=spicy-hot"><Button variant={category === 'spicy-hot' ? 'primary' : 'outline'} size="sm">🌶️ Spicy Hot</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-6)]">
        {filtered.map((product) => (
          <article key={product.id} className="card overflow-hidden group">
            <Link href={`/products/${product.slug}`}>
              <div className="relative aspect-square bg-[var(--color-bg-alt)] flex items-center justify-center p-[var(--space-8)]">
                <Image src={product.imageUrl} alt={product.name} width={240} height={330}
                  className="h-[260px] w-auto object-contain group-hover:scale-110 transition-transform duration-500" />
                <span className="absolute top-[var(--space-3)] right-[var(--space-3)] badge badge-primary">🔥 {product.heatLevel}/10</span>
              </div>
            </Link>
            <div className="p-[var(--space-5)]">
              <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-2)]">
                <span className="text-[var(--text-xs)] text-[var(--color-text-muted)]">{product.categoryName}</span>
                <span className="text-[var(--text-xs)] text-[var(--color-secondary)]">★ {product.rating} ({product.reviewCount})</span>
              </div>
              <Link href={`/products/${product.slug}`}>
                <h3 className="text-[var(--text-lg)] font-semibold mb-[var(--space-2)] hover:text-[var(--color-primary)] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>{product.name}</h3>
              </Link>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] line-clamp-2 mb-[var(--space-3)]">{product.description}</p>
              <div className="flex items-center justify-between mt-[var(--space-4)] pt-[var(--space-3)] border-t border-[var(--color-border)]">
                <span className="text-[var(--text-xl)] font-bold tabular-nums">{formatPrice(product.price)}</span>
                <Button variant="primary" size="sm" onClick={(e) => {
                  e.preventDefault();
                  addItem({ id: product.id, slug: product.slug, name: product.name, sku: product.sku, price: product.price, salePrice: product.salePrice, imageUrl: product.imageUrl, maxQuantity: product.maxQuantity });
                }}>Add to Cart</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="section-container section-padding"><div className="skeleton h-96 w-full" /></div>}><ProductsContent /></Suspense>;
}
