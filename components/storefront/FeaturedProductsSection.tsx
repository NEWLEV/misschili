'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/storefront/CartProvider';
import { formatPrice } from '@/lib/utils';
import type { FormattedProduct } from '@/lib/products';

function HeatMeter({ level }: { level: number }) {
  return (
    <div className="flex gap-1 items-center" aria-label={`Heat level ${level} out of 10`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-4 rounded-sm transition-all duration-300"
          style={{
            background: i < level
              ? `oklch(${0.55 - (i * 0.02)} ${0.18 + (i * 0.005)} ${25 + (i * 5)})`
              : 'var(--color-surface-hover)',
          }}
        />
      ))}
      <span className="ml-2 text-(--text-xs) font-semibold text-(--color-text-secondary) tabular-nums">
        {level}/10
      </span>
    </div>
  );
}

export function FeaturedProductsSection({ products }: { products: FormattedProduct[] }) {
  const { addItem } = useCart();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-(--space-8) max-w-4xl mx-auto">
      {products.map((product, index) => (
        <article
          key={product.id}
          className="card overflow-hidden group"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className="relative aspect-square bg-(--color-bg-alt) flex items-center justify-center p-(--space-8) overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={280}
              height={380}
              className="h-[300px] w-auto object-contain group-hover:scale-110 transition-transform duration-500"
            />
            {product.heatLevel !== null && (
              <div className="absolute top-(--space-4) right-(--space-4)">
                <span className="badge badge-primary">
                  🔥 Heat {product.heatLevel}/10
                </span>
              </div>
            )}
          </div>

          <div className="p-(--space-6)">
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-(--text-xl) font-semibold mb-(--space-2) hover:text-(--color-primary) transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                {product.name}
              </h3>
            </Link>
            <p className="text-(--text-sm) text-(--color-text-secondary) mb-(--space-3) line-clamp-2">
              {product.description}
            </p>

            {product.heatLevel !== null && <HeatMeter level={product.heatLevel} />}

            <div className="flex items-center justify-between mt-(--space-4) pt-(--space-4) border-t border-(--color-border)">
              <div>
                <span className="text-(--text-2xl) font-bold tabular-nums">
                  {formatPrice(product.salePrice ?? product.basePrice)}
                </span>
                {product.volume && (
                  <span className="text-(--text-xs) text-(--color-text-muted) ml-(--space-2)">
                    {product.volume}
                  </span>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={product.maxQuantity <= 0}
                onClick={() =>
                  addItem({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    sku: product.sku,
                    price: product.basePrice,
                    salePrice: product.salePrice,
                    imageUrl: product.imageUrl,
                    maxQuantity: product.maxQuantity,
                  })
                }
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
