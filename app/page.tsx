import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FlameBackground } from '@/components/ui/FlameBackground';
import { FeaturedProductsSection } from '@/components/storefront/FeaturedProductsSection';
import { NewsletterSignup } from '@/components/storefront/NewsletterSignup';
import { getProducts } from '@/lib/products';
import { prisma } from '@/lib/prisma';
import { safeJsonLd } from '@/lib/json-ld';

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
  const [{ products: featuredProducts }, reviews, settings] = await Promise.all([
    getProducts({ featured: true, limit: 4 }),
    getFeaturedReviews(),
    prisma.siteSetting.findMany(),
  ]);
  const getSetting = (key: string, fallback: string) => settings.find((s) => s.key === key)?.value ?? fallback;

  const heroHeadline = getSetting('hero_headline', 'Ghost Pepper Heat. Miami Soul.');
  const heroSubtext = getSetting(
    'hero_subtext',
    'Born in a backyard garden. Popularized by the sailing club. Two small-batch sauces that bring bold flavor and real heat to everything they touch.'
  );
  const heroCtaText = getSetting('hero_cta_text', 'Shop Our Sauces');
  const heroCtaUrl = getSetting('hero_cta_url', '/products');

  return (
    <>
      {/* ─── Hero Section ─────────────────────────────── */}
      {/* Scoped to the dark theme regardless of site theme: FlameBackground is
          always a dark fire animation, so text here must stay light-on-dark. */}
      <section data-theme="dark" className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background */}
        <FlameBackground />

        <div className="section-container relative z-10 py-(--space-20)">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-(--space-12) items-center">
            <div className="max-w-xl">
              <h1
                className="text-(--text-5xl) font-bold mb-(--space-5) animate-slide-up text-gradient-fire"
                style={{ fontFamily: 'var(--font-stain)', animationDelay: '100ms' }}
              >
                {heroHeadline}
              </h1>
              <p
                className="text-(--text-lg) text-white/85 mb-(--space-8) max-w-lg animate-slide-up"
                style={{ animationDelay: '200ms' }}
              >
                {heroSubtext}
              </p>
              <div
                className="flex flex-wrap gap-(--space-3) animate-slide-up"
                style={{ animationDelay: '300ms' }}
              >
                <Link href={heroCtaUrl}>
                  <Button variant="primary" size="lg">
                    {heroCtaText}
                  </Button>
                </Link>
                <Link href="#about">
                  <Button variant="outline" size="lg" className="border-white/30 hover:bg-white/10" style={{ color: 'white' }}>
                    Our Story
                  </Button>
                </Link>
              </div>

              {/* Trust Strip */}
              <div
                className="flex flex-wrap gap-(--space-6) mt-(--space-10) animate-slide-up"
                style={{ animationDelay: '400ms' }}
              >
                {[
                  { icon: '🔒', text: 'Secure Checkout' },
                  { icon: '🚚', text: 'Ships Nationwide' },
                  { icon: '🌶️', text: 'Small Batch' },
                  { icon: '✨', text: 'Zero Calories' },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-(--space-2)">
                    <span className="text-lg">{badge.icon}</span>
                    <span className="text-(--text-xs) text-white/70 font-medium">
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
          <div className="text-center mb-(--space-12)">
            <h2 className="text-(--text-3xl) font-bold mb-(--space-3)" style={{ fontFamily: 'var(--font-display)' }}>
              Our Sauces
            </h2>
            <p className="text-(--color-text-secondary) max-w-md mx-auto">
              Two distinct heat profiles. Both handcrafted with real peppers, fresh herbs, and no artificial anything.
            </p>
          </div>

          <FeaturedProductsSection products={featuredProducts} />
        </div>
      </section>

      {/* ─── Origin Story ─────────────────────────────── */}
      {/* Scoped to the dark theme: the background image has a fixed dark
          overlay regardless of site theme, so text here must stay light-on-dark. */}
      <section id="about" data-theme="dark" className="section-padding relative overflow-hidden">
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-(--space-12) items-center">
            <div className="lg:col-span-3">
              <p className="text-(--text-sm) font-semibold text-white tracking-wider uppercase mb-(--space-3)">
                Our Origin
              </p>
              <h2 className="text-(--text-4xl) font-bold mb-(--space-5) text-white" style={{ fontFamily: 'var(--font-stain)' }}>
                The Founder&apos;s Story
              </h2>
              <div className="space-y-(--space-4) text-white/85 text-(--text-base)">
                <p>
                  Miss Chili&apos;s journey began with a single, unexpected gift: a ghost pepper
                  plant. That one seedling sparked a deep-rooted passion for the craft of cultivating
                  peppers and herbs. What started as a casual hobby soon transformed into a delicious
                  obsession, a relentless pursuit of the perfect balance between fire and flavor,
                  harvested straight from the soil.
                </p>
                <p>
                  Drawing on over two decades of hospitality experience, spanning the heat of the
                  kitchen to the craft of bartending and the leadership of general management, I began
                  sharing my small-batch creations with guests. Whether splashed over a signature dish
                  or stirred into a spirited Bloody Mary, my sauces were designed for those brave
                  enough to seek a little extra kick. The response was immediate: people didn&apos;t
                  just want a taste; they wanted a bottle. It was clear that Miss Chili wasn&apos;t
                  just a condiment, it was an experience.
                </p>
                <p>
                  That&apos;s when the vision crystallized: to build a brand defined by flavor,
                  attitude, and irresistible heat. I wanted a brand that didn&apos;t just sit quietly
                  on the shelf, but one that flirted with the senses and pulled you in with a wink and
                  a smile before the first drop even hit your tongue.
                </p>
                <p>And so, Miss Chili was born.</p>
                <p>
                  She is the perfect embodiment of the sauce itself: bold, playful, confident, and
                  utterly unforgettable. With a look that turns heads and a flavor that flirts back,
                  she&apos;s a character that people connect with instantly.
                </p>
                <p>
                  Evolving from late-night kitchen experiments to a full-fledged brand, Miss Chili has
                  become a sensation. Fans have fallen for her bold attitude and, above all, the
                  exceptional flavor that keeps them coming back for more.
                </p>
              </div>
              <p
                className="text-(--text-xl) font-bold text-white mt-(--space-6) italic"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Miss Chili. Just the way you like it.
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
            <div className="mb-(--space-10)">
              <h2 className="text-(--text-3xl) font-bold mb-(--space-3)" style={{ fontFamily: 'var(--font-display)' }}>
                What Heat Seekers Say
              </h2>
              <p className="text-(--color-text-secondary)">
                Real reviews from real hot sauce lovers. No paid promotions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-(--space-5)">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="card p-(--space-6)"
                >
                  <div className="flex items-center gap-(--space-3) mb-(--space-4)">
                    <StarRating rating={review.rating} />
                    {review.verified && (
                      <span className="badge badge-success text-[10px]">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-(--color-text) mb-(--space-4) italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <p className="text-(--text-sm) font-medium text-(--color-text-secondary)">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-(--space-12)">
            {featuredProducts.map((product) => (
              <div key={product.id} className="card p-(--space-6)">
                <div className="flex items-start gap-(--space-4)">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={60}
                    height={82}
                    className="h-[72px] w-auto shrink-0"
                  />
                  <div>
                    <h3 className="text-(--text-lg) font-semibold mb-(--space-2)" style={{ fontFamily: 'var(--font-display)' }}>
                      {product.name}
                    </h3>
                    <p className="text-(--text-sm) text-(--color-text-muted) mb-(--space-2)">
                      {product.volume} · {product.heatLevel}/10 Heat
                    </p>
                    <p className="text-(--text-sm) text-(--color-text-secondary)">
                      <span className="font-medium text-(--color-text)">Ingredients: </span>
                      {product.ingredients}
                    </p>
                    <p className="text-(--text-xs) text-(--color-text-muted) mt-(--space-2)">
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
            <h2 className="text-(--text-3xl) font-bold mb-(--space-3)" style={{ fontFamily: 'var(--font-display)' }}>
              Join the Heat
            </h2>
            <p className="text-(--color-text-secondary) mb-(--space-6)">
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
          __html: safeJsonLd({
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
          __html: safeJsonLd({
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
