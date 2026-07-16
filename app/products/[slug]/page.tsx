import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/products';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';

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
          __html: JSON.stringify({
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
          }),
        }}
      />
    </>
  );
}
