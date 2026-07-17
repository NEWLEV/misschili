'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/storefront/CartProvider';
import { formatPrice } from '@/lib/utils';
import type { FormattedProduct } from '@/lib/products';

export function ProductDetailClient({
  product,
  relatedProduct,
}: {
  product: FormattedProduct;
  relatedProduct: FormattedProduct | null;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'shipping'>('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images.length > 0 ? product.images : [product.imageUrl];
  const activeImage = images[activeImageIndex] ?? images[0];
  const price = product.salePrice ?? product.basePrice;
  const inStock = product.maxQuantity > 0;

  return (
    <div className="section-container section-padding">
      <nav className="mb-(--space-6)" aria-label="Breadcrumb">
        <ol className="flex items-center gap-(--space-2) text-(--text-sm) text-(--color-text-muted)">
          <li><Link href="/" className="hover:text-(--color-text)">Home</Link></li>
          <li>/</li>
          <li><Link href="/products" className="hover:text-(--color-text)">Sauces</Link></li>
          <li>/</li>
          <li className="text-(--color-text)">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-(--space-12)">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-(--color-surface) rounded-(--radius-xl) flex items-center justify-center p-(--space-8) mb-(--space-4) overflow-hidden">
            <Image
              src={activeImage}
              alt={product.name}
              width={320}
              height={440}
              className="h-[380px] w-auto object-contain transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-(--space-3)">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-20 h-20 rounded-(--radius-md) overflow-hidden border-2 transition-colors flex items-center justify-center bg-(--color-surface) ${activeImageIndex === i ? 'border-(--color-primary)' : 'border-(--color-border)'}`}
                >
                  <Image src={src} alt="" width={60} height={82} className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.categories[0] && <span className="badge badge-primary mb-(--space-3)">{product.categories[0]}</span>}
          <h1 className="text-(--text-4xl) font-bold mb-(--space-3)" style={{ fontFamily: 'var(--font-display)' }}>{product.name}</h1>
          <p className="text-(--color-text-secondary) mb-(--space-4)">{product.description}</p>

          {/* Heat Level */}
          {product.heatLevel !== null && (
            <div className="flex items-center gap-(--space-3) mb-(--space-5)">
              <span className="text-(--text-sm) font-medium">Heat Level:</span>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="w-3 h-5 rounded-sm" style={{ background: i < product.heatLevel! ? `oklch(${0.55 - (i * 0.02)} ${0.18 + (i * 0.005)} ${25 + (i * 5)})` : 'var(--color-surface-hover)' }} />
                ))}
              </div>
              <span className="text-(--text-sm) font-bold tabular-nums">{product.heatLevel}/10</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-(--space-3) mb-(--space-6)">
            <span className="text-(--text-3xl) font-bold tabular-nums">{formatPrice(price)}</span>
            {product.volume && <span className="text-(--text-sm) text-(--color-text-muted)">{product.volume}</span>}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-(--space-2) mb-(--space-5)">
            <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-(--color-success)' : 'bg-(--color-danger)'}`} />
            <span className={`text-(--text-sm) ${inStock ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-(--space-4) mb-(--space-6)">
            <div className="flex items-center border border-(--color-border) rounded-(--radius-md)">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-(--color-surface-hover) transition-colors text-lg">−</button>
              <input type="number" min="1" max={product.maxQuantity} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.maxQuantity, parseInt(e.target.value) || 1)))}
                className="w-14 h-11 text-center bg-transparent border-x border-(--color-border) tabular-nums" />
              <button onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))} className="w-11 h-11 flex items-center justify-center hover:bg-(--color-surface-hover) transition-colors text-lg">+</button>
            </div>
            <Button variant="primary" size="lg" className="flex-1" disabled={!inStock} onClick={() => addItem({
              id: product.id, slug: product.slug, name: product.name, sku: product.sku,
              price, salePrice: product.salePrice, imageUrl: product.imageUrl, maxQuantity: product.maxQuantity,
            }, quantity)}>
              {inStock ? `Add to Cart — ${formatPrice(price * quantity)}` : 'Out of Stock'}
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-t border-(--color-border) pt-(--space-6)">
            <div className="flex gap-(--space-6) mb-(--space-4)">
              {(['description', 'ingredients', 'shipping'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`text-(--text-sm) font-medium pb-(--space-2) border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-(--color-primary) text-(--color-text)' : 'border-transparent text-(--color-text-muted) hover:text-(--color-text)'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="text-(--text-sm) text-(--color-text-secondary)">
              {activeTab === 'description' && <p>{product.description}</p>}
              {activeTab === 'ingredients' && (
                <div><p className="font-medium text-(--color-text) mb-2">Ingredients:</p><p>{product.ingredients || 'Not listed.'}</p><p className="mt-3 text-(--color-text-muted)">0 Calories · 0g Fat · 0g Protein · 25 servings per container</p></div>
              )}
              {activeTab === 'shipping' && (
                <div><p>Free shipping on orders over $50. Standard shipping (3-7 business days): $7.99.</p><p className="mt-2">We ship to all 50 states. Orders are processed within 1-2 business days.</p><p className="mt-2">Returns accepted within 30 days for unopened products.</p></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Product */}
      {relatedProduct && (
        <section className="mt-(--space-20) pt-(--space-12) border-t border-(--color-border)">
          <h2 className="text-(--text-2xl) font-bold mb-(--space-6)" style={{ fontFamily: 'var(--font-display)' }}>You Might Also Like</h2>
          <Link href={`/products/${relatedProduct.slug}`} className="card overflow-hidden group inline-block max-w-sm">
            <div className="aspect-square bg-(--color-bg-alt) flex items-center justify-center p-(--space-8)">
              <Image src={relatedProduct.imageUrl} alt={relatedProduct.name} width={200} height={280} className="h-[220px] w-auto object-contain group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-(--space-5)">
              <h3 className="text-(--text-lg) font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{relatedProduct.name}</h3>
              <p className="text-(--text-sm) text-(--color-text-secondary) mt-1">{relatedProduct.description}</p>
              <p className="text-(--text-xl) font-bold tabular-nums mt-3">{formatPrice(relatedProduct.salePrice ?? relatedProduct.basePrice)}</p>
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
