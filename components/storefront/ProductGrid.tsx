'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/storefront/CartProvider';
import { formatPrice } from '@/lib/utils';
import type { FormattedProduct } from '@/lib/products';

export function ProductGrid({ products }: { products: FormattedProduct[] }) {
  const { addItem } = useCart();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-(--space-6)">
      {products.map((product) => (
        <article key={product.id} className="card overflow-hidden group">
          <Link href={`/products/${product.slug}`}>
            <div className="relative aspect-square bg-(--color-bg-alt) flex items-center justify-center p-(--space-8)">
              <Image src={product.imageUrl} alt={product.name} width={240} height={330}
                className="h-[260px] w-auto object-contain group-hover:scale-110 transition-transform duration-500" />
              {product.heatLevel !== null && (
                <span className="absolute top-(--space-3) right-(--space-3) badge badge-primary">🔥 {product.heatLevel}/10</span>
              )}
            </div>
          </Link>
          <div className="p-(--space-5)">
            <div className="flex items-center gap-(--space-2) mb-(--space-2)">
              {product.categories[0] && (
                <span className="text-(--text-xs) text-(--color-text-muted)">{product.categories[0]}</span>
              )}
              {product.averageRating !== null && (
                <span className="text-(--text-xs) text-(--color-secondary)">★ {product.averageRating} ({product.reviewCount})</span>
              )}
            </div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-(--text-lg) font-semibold mb-(--space-2) hover:text-(--color-primary) transition-colors" style={{ fontFamily: 'var(--font-display)' }}>{product.name}</h3>
            </Link>
            <p className="text-(--text-sm) text-(--color-text-secondary) line-clamp-2 mb-(--space-3)">{product.description}</p>
            <div className="flex items-center justify-between mt-(--space-4) pt-(--space-3) border-t border-(--color-border)">
              <span className="text-(--text-xl) font-bold tabular-nums">{formatPrice(product.salePrice ?? product.basePrice)}</span>
              <Button
                variant="primary"
                size="sm"
                disabled={product.maxQuantity <= 0}
                onClick={(e) => {
                  e.preventDefault();
                  addItem({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    sku: product.sku,
                    price: product.basePrice,
                    salePrice: product.salePrice,
                    imageUrl: product.imageUrl,
                    maxQuantity: product.maxQuantity,
                  });
                }}
              >
                {product.maxQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
