import { prisma } from '@/lib/prisma';

// Explicit shape for the Prisma product row with includes
interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sku: string;
  basePrice: number | { toNumber(): number };
  salePrice: number | { toNumber(): number } | null;
  isFeatured: boolean;
  heatLevel: number | null;
  volume: string | null;
  ingredients: string | null;
  images: Array<{ url: string }>;
  categories: Array<{ category: { name: string; slug: string } }>;
  inventory: {
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
  } | null;
  reviews: Array<{ rating: number }>;
}

function formatProduct(p: ProductRow) {
  const stock = p.inventory ? p.inventory.quantity - p.inventory.reservedQuantity : 0;
  const lowStock = p.inventory ? stock <= p.inventory.lowStockThreshold : false;
  const ratings = p.reviews.map((r) => r.rating);
  const averageRating = ratings.length > 0
    ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
    : null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    sku: p.sku,
    basePrice: Number(p.basePrice),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    imageUrl: p.images[0]?.url || '/images/logos/MissChili_Logos_MissChili.png',
    images: p.images.map((img) => img.url),
    categories: p.categories.map((pc) => pc.category.name),
    stock,
    lowStock,
    maxQuantity: Math.max(stock, 0),
    averageRating,
    reviewCount: ratings.length,
    isFeatured: p.isFeatured,
    heatLevel: p.heatLevel,
    volume: p.volume,
    ingredients: p.ingredients,
  };
}

export type FormattedProduct = ReturnType<typeof formatProduct>;

interface GetProductsOptions {
  category?: string | null;
  sort?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export async function getProducts(options: GetProductsOptions = {}) {
  const { category, sort = 'newest', search, page = 1, limit = 12, featured } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { status: 'ACTIVE' };
  if (category) where.categories = { some: { category: { slug: category } } };
  if (featured) where.isFeatured = true;
  // `mode: 'insensitive'` is a Postgres/MongoDB-only Prisma option — MariaDB's
  // default collation is already case-insensitive, and passing it here throws
  // a PrismaClientValidationError on every search request against MySQL.
  if (search) where.OR = [
    { name: { contains: search } },
    { description: { contains: search } },
  ];

  const ORDER_MAP: Record<string, object> = {
    'price-asc': { basePrice: 'asc' },
    'price-desc': { basePrice: 'desc' },
    'name': { name: 'asc' },
  };
  const orderBy = ORDER_MAP[sort ?? 'newest'] ?? { createdAt: 'desc' };

  const rawProducts = await prisma.product.findMany({
    where,
    include: {
      images: { where: { isFeatured: true }, take: 1 },
      categories: { include: { category: true } },
      inventory: true,
      reviews: { where: { status: 'APPROVED' }, select: { rating: true } },
    },
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.product.count({ where });
  const products = (rawProducts as unknown as ProductRow[]).map(formatProduct);

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProductBySlug(slug: string) {
  const raw = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      categories: { include: { category: true } },
      inventory: true,
      reviews: { where: { status: 'APPROVED' }, select: { rating: true } },
    },
  });

  if (!raw) return null;

  return formatProduct(raw as unknown as ProductRow);
}
