import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getProducts } from '@/lib/products';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';
import { safeJsonLd } from '@/lib/json-ld';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const rawDescription = product.description || `${product.name} — handcrafted hot sauce from Miss Chili Hot Sauce.`;
  const description = rawDescription.length > 160 ? `${rawDescription.slice(0, 157)}...` : rawDescription;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      images: [{ url: product.imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return notFound();

  const { products: others } = await getProducts({ limit: 3 });
  const relatedProduct = others.find((p) => p.slug !== slug) ?? null;

  return (
    <>
      <ProductDetailClient product={product} relatedProduct={relatedProduct} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.misschilipeppers.com/' },
              { '@type': 'ListItem', position: 2, name: 'Sauces', item: 'https://www.misschilipeppers.com/products' },
              { '@type': 'ListItem', position: 3, name: product.name, item: `https://www.misschilipeppers.com/products/${product.slug}` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: `https://www.misschilipeppers.com${product.imageUrl}`,
            sku: product.sku,
            brand: { '@type': 'Brand', name: 'Miss Chili Hot Sauce' },
            offers: {
              '@type': 'Offer',
              price: product.salePrice ?? product.basePrice,
              priceCurrency: 'USD',
              availability: product.maxQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: `https://www.misschilipeppers.com/products/${product.slug}`,
            },
            // Only include a rating when real review data exists — never
            // fabricate one to avoid a rich-result penalty for mismatched
            // structured data.
            ...(product.reviewCount > 0 && product.averageRating !== null
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: product.averageRating,
                    reviewCount: product.reviewCount,
                  },
                }
              : {}),
          }),
        }}
      />
    </>
  );
}
