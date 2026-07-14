'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/storefront/CartProvider';
import { formatPrice } from '@/lib/utils';
import { FlameBackground } from '@/components/ui/FlameBackground';

// Product data embedded for initial launch — will be replaced by Prisma queries
const PRODUCTS = [
  {
    id: 'fiery-heat-001',
    slug: 'fiery-heat-ghost-pepper',
    name: 'Fiery Heat — Ghost Pepper',
    sku: 'MC-FH-5OZ',
    description: 'Made for heatseekers. What starts as a spark quickly becomes a rush of sweetness, spices, and fiery heat.',
    price: 12.99,
    salePrice: null,
    imageUrl: '/images/logos/MissChili_Logos_FieryHeat.png',
    labelUrl: '/images/labels/MissChili_Label_FIERYHEAT.jpg',
    heatLevel: 9,
    volume: '5 fl oz (148 ml)',
    ingredients: 'Distilled White Vinegar, Garlic, Sugar, Sweet Basil, Cilantro, Ghost Pepper, Kosher Salt, Xanthan Gum',
    maxQuantity: 50,
  },
  {
    id: 'spicy-hot-001',
    slug: 'spicy-hot-jalapeno-habanero',
    name: 'Spicy Hot — Jalapeño Habanero',
    sku: 'MC-SH-5OZ',
    description: 'Jalapeño flavor combined with habanero peppers and fresh spices for a lively taste that will leave you wanting more.',
    price: 11.99,
    salePrice: null,
    imageUrl: '/images/logos/MissChili_Logos_SpicyHot.png',
    labelUrl: '/images/labels/MissChili_LabelSPICYHOT.jpg',
    heatLevel: 7,
    volume: '5 fl oz (148 ml)',
    ingredients: 'Distilled White Vinegar, Jalapeños, Habanero Peppers, Garlic, Onions, Sweet Basil, Cilantro, Kosher Salt, Xanthan Gum',
    maxQuantity: 50,
  },
];

const REVIEWS = [
  {
    id: '1',
    name: 'Captain Mike R.',
    rating: 5,
    text: 'We discovered this at the sailing club potluck and haven\'t used another hot sauce since. The Fiery Heat on grilled mahi is unreal.',
    verified: true,
  },
  {
    id: '2',
    name: 'Derek T.',
    rating: 5,
    text: 'The Spicy Hot has the perfect jalapeño-habanero balance. Not just heat for heat\'s sake — real depth of flavor.',
    verified: true,
  },
  {
    id: '3',
    name: 'Rachel M.',
    rating: 5,
    text: 'Bought both bottles as a gift. He called me the next day asking where to order more. That says everything.',
    verified: true,
  },
  {
    id: '4',
    name: 'James K.',
    rating: 4,
    text: 'The ghost pepper sauce genuinely surprised me. It builds slowly and then hits hard — the best kind of burn.',
    verified: true,
  },
];

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
      <span className="ml-2 text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] tabular-nums">
        {level}/10
      </span>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < rating ? 'var(--color-secondary)' : 'none'}
          stroke={i < rating ? 'var(--color-secondary)' : 'var(--color-text-muted)'}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { addItem } = useCart();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, source: 'footer' }),
      });
      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
      }
    } catch {
      setNewsletterStatus('error');
    }
  };

  return (
    <>
      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background */}
        <FlameBackground />

        <div className="section-container relative z-10 py-[var(--space-20)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-12)] items-center">
            <div className="max-w-xl">
              <p className="text-[var(--text-sm)] font-semibold text-[var(--color-secondary)] tracking-[var(--tracking-wider)] uppercase mb-[var(--space-4)] animate-fade-in">
                Handcrafted in Miami 🌶️
              </p>
              <h1
                className="text-[var(--text-5xl)] font-bold mb-[var(--space-5)] animate-slide-up"
                style={{ fontFamily: 'var(--font-display)', animationDelay: '100ms' }}
              >
                Ghost Pepper Heat.{' '}
                <span className="text-gradient-fire">Miami Soul.</span>
              </h1>
              <p
                className="text-[var(--text-lg)] text-[var(--color-text-secondary)] mb-[var(--space-8)] max-w-lg animate-slide-up"
                style={{ animationDelay: '200ms' }}
              >
                Born in a backyard garden. Popularized by the sailing club.
                Two small-batch sauces that bring bold flavor and real heat
                to everything they touch.
              </p>
              <div
                className="flex flex-wrap gap-[var(--space-3)] animate-slide-up"
                style={{ animationDelay: '300ms' }}
              >
                <Link href="/products">
                  <Button variant="primary" size="lg">
                    Shop Our Sauces
                  </Button>
                </Link>
                <Link href="#about">
                  <Button variant="outline" size="lg">
                    Our Story
                  </Button>
                </Link>
              </div>

              {/* Trust Strip */}
              <div
                className="flex flex-wrap gap-[var(--space-6)] mt-[var(--space-10)] animate-slide-up"
                style={{ animationDelay: '400ms' }}
              >
                {[
                  { icon: '🔒', text: 'Secure Checkout' },
                  { icon: '🚚', text: 'Ships Nationwide' },
                  { icon: '🌶️', text: 'Small Batch' },
                  { icon: '✨', text: 'Zero Calories' },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-[var(--space-2)]">
                    <span className="text-lg">{badge.icon}</span>
                    <span className="text-[var(--text-xs)] text-[var(--color-text-muted)] font-medium">
                      {badge.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Product Image */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div
                className="relative animate-slide-up"
                style={{ animationDelay: '300ms' }}
              >
                <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: 'var(--color-primary)' }} />
                <Image
                  src="/images/logos/MissChili_Logos_MissChili.png"
                  alt="Miss Chili mascot"
                  width={320}
                  height={440}
                  className="relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Products ────────────────────────── */}
      <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
        <div className="section-container">
          <div className="text-center mb-[var(--space-12)]">
            <h2 className="text-[var(--text-3xl)] font-bold mb-[var(--space-3)]" style={{ fontFamily: 'var(--font-display)' }}>
              Our Sauces
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
              Two distinct heat profiles. Both handcrafted with real peppers, fresh herbs, and no artificial anything.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-8)] max-w-4xl mx-auto">
            {PRODUCTS.map((product, index) => (
              <article
                key={product.id}
                className="card overflow-hidden group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-[var(--color-bg-alt)] flex items-center justify-center p-[var(--space-8)] overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={280}
                    height={380}
                    className="h-[300px] w-auto object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Heat Level Badge */}
                  <div className="absolute top-[var(--space-4)] right-[var(--space-4)]">
                    <span className="badge badge-primary">
                      🔥 Heat {product.heatLevel}/10
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-[var(--space-6)]">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-[var(--text-xl)] font-semibold mb-[var(--space-2)] hover:text-[var(--color-primary)] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-3)] line-clamp-2">
                    {product.description}
                  </p>

                  <HeatMeter level={product.heatLevel} />

                  <div className="flex items-center justify-between mt-[var(--space-4)] pt-[var(--space-4)] border-t border-[var(--color-border)]">
                    <div>
                      <span className="text-[var(--text-2xl)] font-bold tabular-nums">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[var(--text-xs)] text-[var(--color-text-muted)] ml-[var(--space-2)]">
                        {product.volume}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        addItem({
                          id: product.id,
                          slug: product.slug,
                          name: product.name,
                          sku: product.sku,
                          price: product.price,
                          salePrice: product.salePrice,
                          imageUrl: product.imageUrl,
                          maxQuantity: product.maxQuantity,
                        })
                      }
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Origin Story ─────────────────────────────── */}
      <section id="about" className="section-padding relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/backgrounds/background-with-green-peppers-2026-01-08-06-37-16-utc.jpg"
            alt=""
            fill
            className="object-cover"
            quality={60}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, oklch(0.10 0.01 30 / 0.92) 0%, oklch(0.10 0.01 30 / 0.85) 100%)',
            }}
          />
        </div>

        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-[var(--space-12)] items-center">
            <div className="lg:col-span-3">
              <p className="text-[var(--text-sm)] font-semibold text-[var(--color-secondary)] tracking-[var(--tracking-wider)] uppercase mb-[var(--space-3)]">
                Our Origin
              </p>
              <h2 className="text-[var(--text-4xl)] font-bold mb-[var(--space-5)]" style={{ fontFamily: 'var(--font-display)' }}>
                It Started With a Garden
              </h2>
              <div className="space-y-[var(--space-4)] text-[var(--color-text-secondary)] text-[var(--text-base)]">
                <p>
                  Miss Chili started the way all great things do — by accident. A backyard garden
                  in Miami overflowing with ghost peppers and no idea what to do with them all.
                </p>
                <p>
                  The first batch was shared at the local sailing club. Within a week, the phone
                  wouldn&apos;t stop ringing. Members wanted bottles for themselves, then for their
                  friends, then for their restaurants. Word of mouth did what no marketing budget could.
                </p>
                <p>
                  Today, Miss Chili is still made in small batches with fresh ingredients — distilled
                  white vinegar, real garlic, sweet basil, cilantro, and of course, the peppers that
                  started it all. No artificial preservatives. No filler. Just heat, flavor, and the
                  kind of kick that keeps you coming back.
                </p>
              </div>
              <p
                className="text-[var(--text-xl)] font-bold text-[var(--color-secondary)] mt-[var(--space-6)] italic"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                &ldquo;Shake Her Well, Pour Her Slow.&rdquo;
              </p>
            </div>
            <div className="lg:col-span-2 flex justify-center">
              <Image
                src="/images/logos/MissChili_Logos_MissChili2.png"
                alt="Miss Chili mascot — chili pepper character"
                width={260}
                height={360}
                className="drop-shadow-2xl hover:rotate-3 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────── */}
      <section className="section-padding" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="section-container">
          <div className="mb-[var(--space-10)]">
            <h2 className="text-[var(--text-3xl)] font-bold mb-[var(--space-3)]" style={{ fontFamily: 'var(--font-display)' }}>
              What Heat Seekers Say
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              Real reviews from real hot sauce lovers. No paid promotions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-5)]">
            {REVIEWS.map((review) => (
              <article
                key={review.id}
                className="card p-[var(--space-6)]"
              >
                <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
                  <StarRating rating={review.rating} />
                  {review.verified && (
                    <span className="badge badge-success text-[10px]">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-[var(--color-text)] mb-[var(--space-4)] italic">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  — {review.name}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Ingredients Callout ──────────────────────── */}
      <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-12)]">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="card p-[var(--space-6)]">
                <div className="flex items-start gap-[var(--space-4)]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={60}
                    height={82}
                    className="h-[72px] w-auto shrink-0"
                  />
                  <div>
                    <h3 className="text-[var(--text-lg)] font-semibold mb-[var(--space-2)]" style={{ fontFamily: 'var(--font-display)' }}>
                      {product.name}
                    </h3>
                    <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mb-[var(--space-2)]">
                      {product.volume} · {product.heatLevel}/10 Heat
                    </p>
                    <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                      <span className="font-medium text-[var(--color-text)]">Ingredients: </span>
                      {product.ingredients}
                    </p>
                    <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-[var(--space-2)]">
                      0 Calories per serving · Zero fat · All natural
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Newsletter ───────────────────────────────── */}
      <section className="section-padding" style={{ background: 'var(--color-surface)' }}>
        <div className="section-container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-[var(--text-3xl)] font-bold mb-[var(--space-3)]" style={{ fontFamily: 'var(--font-display)' }}>
              Join the Heat
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-[var(--space-6)]">
              New flavors, limited drops, and recipes delivered straight to your inbox. No spam — just spice.
            </p>

            {newsletterStatus === 'success' ? (
              <div className="p-[var(--space-4)] rounded-[var(--radius-lg)] bg-[oklch(from_var(--color-success)_l_c_h_/_0.1)] border border-[oklch(from_var(--color-success)_l_c_h_/_0.2)]">
                <p className="text-[var(--color-success)] font-medium">🌶️ You&apos;re in! Watch your inbox for some heat.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-[var(--space-3)] max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 h-12 px-[var(--space-4)] rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={newsletterStatus === 'loading'}
                >
                  Subscribe
                </Button>
              </form>
            )}
            {newsletterStatus === 'error' && (
              <p className="text-[var(--text-sm)] text-[var(--color-danger)] mt-[var(--space-3)]">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ─── Structured Data ──────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Miss Chili Hot Sauce',
            url: 'https://www.misschilipeppers.com',
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Miss Chili Hot Sauce, LLC',
            url: 'https://www.misschilipeppers.com',
            logo: 'https://www.misschilipeppers.com/images/logos/MissChili_Logos_MissChili.png',
            sameAs: ['https://www.instagram.com/misschilimiami'],
            address: {
              '@type': 'PostalAddress',
              streetAddress: '12485 SW 137 Ave. Ste 212',
              addressLocality: 'Miami',
              addressRegion: 'FL',
              postalCode: '33186',
              addressCountry: 'US',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'misschilihotsauce@gmail.com',
              contactType: 'customer service',
            },
          }),
        }}
      />
    </>
  );
}
