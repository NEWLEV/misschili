'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/storefront/CartProvider';
import { formatPrice } from '@/lib/utils';

const PRODUCTS: Record<string, {
  id: string; slug: string; name: string; sku: string; description: string;
  longDescription: string; price: number; salePrice: number | null;
  imageUrl: string; labelUrl: string; heatLevel: number; volume: string;
  ingredients: string; maxQuantity: number; category: string;
}> = {
  'fiery-heat-ghost-pepper': {
    id: 'fiery-heat-001', slug: 'fiery-heat-ghost-pepper', name: 'Fiery Heat — Ghost Pepper',
    sku: 'MC-FH-5OZ',
    description: 'Made for heatseekers, those who chase flavor the way others chase thrills.',
    longDescription: 'What starts as a spark quickly becomes a rush of sweetness, spices, and fiery heat. An experience that delivers pleasure long after the last bite. This hot sauce was made for heatseekers — those who chase flavor the way others chase thrills. Crafted with ghost peppers, garlic, sweet basil, and cilantro for a complex heat profile.',
    price: 12.99, salePrice: null,
    imageUrl: '/images/logos/MissChili_Logos_FieryHeat.png',
    labelUrl: '/images/labels/MissChili_Label_FIERYHEAT.jpg',
    heatLevel: 9, volume: '5 fl oz (148 ml)',
    ingredients: 'Distilled White Vinegar, Garlic, Sugar, Sweet Basil, Cilantro, Ghost Pepper, Kosher Salt, Xanthan Gum',
    maxQuantity: 50, category: 'Fiery Heat',
  },
  'spicy-hot-jalapeno-habanero': {
    id: 'spicy-hot-001', slug: 'spicy-hot-jalapeno-habanero', name: 'Spicy Hot — Jalapeño Habanero',
    sku: 'MC-SH-5OZ',
    description: 'To all jalapeño lovers this hot sauce turns up the heat.',
    longDescription: 'Jalapeño flavor combined with habanero peppers and fresh spices for a lively taste that will leave you wanting more. Splash it on anything to deliver the perfect kick. This is the everyday hot sauce for people who want real flavor without compromise.',
    price: 11.99, salePrice: null,
    imageUrl: '/images/logos/MissChili_Logos_SpicyHot.png',
    labelUrl: '/images/labels/MissChili_LabelSPICYHOT.jpg',
    heatLevel: 7, volume: '5 fl oz (148 ml)',
    ingredients: 'Distilled White Vinegar, Jalapeños, Habanero Peppers, Garlic, Onions, Sweet Basil, Cilantro, Kosher Salt, Xanthan Gum',
    maxQuantity: 50, category: 'Spicy Hot',
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = PRODUCTS[slug];
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'shipping'>('description');
  const [activeImage, setActiveImage] = useState<'logo' | 'label'>('logo');

  if (!product) {
    return (
      <div className="section-container section-padding text-center">
        <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-4)]">Product Not Found</h1>
        <p className="text-[var(--color-text-secondary)] mb-[var(--space-6)]">The sauce you are looking for does not exist.</p>
        <Link href="/products"><Button variant="primary">Browse All Sauces</Button></Link>
      </div>
    );
  }

  const otherSlug = slug === 'fiery-heat-ghost-pepper' ? 'spicy-hot-jalapeno-habanero' : 'fiery-heat-ghost-pepper';
  const relatedProduct = PRODUCTS[otherSlug];

  return (
    <div className="section-container section-padding">
      <nav className="mb-[var(--space-6)]" aria-label="Breadcrumb">
        <ol className="flex items-center gap-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-text-muted)]">
          <li><Link href="/" className="hover:text-[var(--color-text)]">Home</Link></li>
          <li>/</li>
          <li><Link href="/products" className="hover:text-[var(--color-text)]">Sauces</Link></li>
          <li>/</li>
          <li className="text-[var(--color-text)]">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-12)]">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-[var(--color-surface)] rounded-[var(--radius-xl)] flex items-center justify-center p-[var(--space-8)] mb-[var(--space-4)] overflow-hidden">
            <Image
              src={activeImage === 'logo' ? product.imageUrl : product.labelUrl}
              alt={product.name}
              width={activeImage === 'logo' ? 320 : 600}
              height={activeImage === 'logo' ? 440 : 300}
              className={`${activeImage === 'logo' ? 'h-[380px] w-auto' : 'w-full h-auto'} object-contain transition-transform duration-300 hover:scale-105`}
              priority
            />
          </div>
          <div className="flex gap-[var(--space-3)]">
            {[{ key: 'logo' as const, src: product.imageUrl, w: 60, h: 82 }, { key: 'label' as const, src: product.labelUrl, w: 100, h: 50 }].map((img) => (
              <button
                key={img.key}
                onClick={() => setActiveImage(img.key)}
                className={`w-20 h-20 rounded-[var(--radius-md)] overflow-hidden border-2 transition-colors flex items-center justify-center bg-[var(--color-surface)] ${activeImage === img.key ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}
              >
                <Image src={img.src} alt="" width={img.w} height={img.h} className="object-contain p-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <span className="badge badge-primary mb-[var(--space-3)]">{product.category}</span>
          <h1 className="text-[var(--text-4xl)] font-bold mb-[var(--space-3)]" style={{ fontFamily: 'var(--font-display)' }}>{product.name}</h1>
          <p className="text-[var(--color-text-secondary)] mb-[var(--space-4)]">{product.description}</p>

          {/* Heat Level */}
          <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-5)]">
            <span className="text-[var(--text-sm)] font-medium">Heat Level:</span>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-3 h-5 rounded-sm" style={{ background: i < product.heatLevel ? `oklch(${0.55 - (i * 0.02)} ${0.18 + (i * 0.005)} ${25 + (i * 5)})` : 'var(--color-surface-hover)' }} />
              ))}
            </div>
            <span className="text-[var(--text-sm)] font-bold tabular-nums">{product.heatLevel}/10</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-[var(--space-3)] mb-[var(--space-6)]">
            <span className="text-[var(--text-3xl)] font-bold tabular-nums">{formatPrice(product.price)}</span>
            <span className="text-[var(--text-sm)] text-[var(--color-text-muted)]">{product.volume}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-5)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
            <span className="text-[var(--text-sm)] text-[var(--color-success)]">In Stock</span>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-6)]">
            <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-md)]">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-[var(--color-surface-hover)] transition-colors text-lg">−</button>
              <input type="number" min="1" max={product.maxQuantity} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.maxQuantity, parseInt(e.target.value) || 1)))}
                className="w-14 h-11 text-center bg-transparent border-x border-[var(--color-border)] tabular-nums" />
              <button onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))} className="w-11 h-11 flex items-center justify-center hover:bg-[var(--color-surface-hover)] transition-colors text-lg">+</button>
            </div>
            <Button variant="primary" size="lg" className="flex-1" onClick={() => addItem({
              id: product.id, slug: product.slug, name: product.name, sku: product.sku,
              price: product.price, salePrice: product.salePrice, imageUrl: product.imageUrl, maxQuantity: product.maxQuantity,
            }, quantity)}>
              Add to Cart — {formatPrice(product.price * quantity)}
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-t border-[var(--color-border)] pt-[var(--space-6)]">
            <div className="flex gap-[var(--space-6)] mb-[var(--space-4)]">
              {(['description', 'ingredients', 'shipping'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`text-[var(--text-sm)] font-medium pb-[var(--space-2)] border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-[var(--color-primary)] text-[var(--color-text)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {activeTab === 'description' && <p>{product.longDescription}</p>}
              {activeTab === 'ingredients' && (
                <div><p className="font-medium text-[var(--color-text)] mb-2">Ingredients:</p><p>{product.ingredients}</p><p className="mt-3 text-[var(--color-text-muted)]">0 Calories · 0g Fat · 0g Protein · 25 servings per container</p></div>
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
        <section className="mt-[var(--space-20)] pt-[var(--space-12)] border-t border-[var(--color-border)]">
          <h2 className="text-[var(--text-2xl)] font-bold mb-[var(--space-6)]" style={{ fontFamily: 'var(--font-display)' }}>You Might Also Like</h2>
          <Link href={`/products/${relatedProduct.slug}`} className="card overflow-hidden group inline-block max-w-sm">
            <div className="aspect-square bg-[var(--color-bg-alt)] flex items-center justify-center p-[var(--space-8)]">
              <Image src={relatedProduct.imageUrl} alt={relatedProduct.name} width={200} height={280} className="h-[220px] w-auto object-contain group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-[var(--space-5)]">
              <h3 className="text-[var(--text-lg)] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{relatedProduct.name}</h3>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mt-1">{relatedProduct.description}</p>
              <p className="text-[var(--text-xl)] font-bold tabular-nums mt-3">{formatPrice(relatedProduct.price)}</p>
            </div>
          </Link>
        </section>
      )}

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Product', name: product.name,
        description: product.longDescription, image: `https://www.misschilipeppers.com${product.imageUrl}`,
        sku: product.sku, brand: { '@type': 'Brand', name: 'Miss Chili Hot Sauce' },
        offers: { '@type': 'Offer', price: product.price, priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `https://www.misschilipeppers.com/products/${product.slug}` },
      })}} />
    </div>
  );
}
