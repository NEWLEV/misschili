import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FlameBackground } from '@/components/ui/FlameBackground';
import { FeaturedProductsSection } from '@/components/storefront/FeaturedProductsSection';
import { NewsletterSignup } from '@/components/storefront/NewsletterSignup';
import { getProducts } from '@/lib/products';
import { prisma } from '@/lib/prisma';

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

async function getFeaturedReviews() {
  const reviews = await prisma.review.findMany({
    where: { status: 'APPROVED' },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  });

  return reviews.map((r) => ({
    id: r.id,
    name: r.user.name || 'Verified Customer',
    rating: r.rating,
    text: r.body || r.title || '',
    verified: r.isVerified,
  }));
}

export default async function HomePage() {
  const [{ products: featuredProducts }, reviews] = await Promise.all([
    getProducts({ featured: true, limit: 4 }),
    getFeaturedReviews(),
  ]);

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

          <FeaturedProductsSection products={featuredProducts} />
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
      {reviews.length > 0 && (
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
              {reviews.map((review) => (
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
      )}

      {/* ─── Ingredients Callout ──────────────────────── */}
      <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-12)]">
            {featuredProducts.map((product) => (
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

            <NewsletterSignup />
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
