import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

// Explicit shape for the Prisma product row with includes
interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: number | { toNumber(): number };
  salePrice: number | { toNumber(): number } | null;
  isFeatured: boolean;
  heatLevel: number | null;
  volume: string | null;
  images: Array<{ url: string }>;
  categories: Array<{ category: { name: string } }>;
  inventory: {
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
  } | null;
  reviews: Array<{ rating: number }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort     = searchParams.get('sort') || 'newest';
    const page     = parseInt(searchParams.get('page')  || '1');
    const limit    = parseInt(searchParams.get('limit') || '12');
    const search   = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { status: 'ACTIVE' };
    if (category) where.categories = { some: { category: { slug: category } } };
    if (search)   where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];

    const ORDER_MAP: Record<string, object> = {
      'price-asc':  { basePrice: 'asc' },
      'price-desc': { basePrice: 'desc' },
      'name':       { name: 'asc' },
    };
    const orderBy = ORDER_MAP[sort] ?? { createdAt: 'desc' };

    const rawProducts = await prisma.product.findMany({
      where,
      include: {
        images:     { where: { isFeatured: true }, take: 1 },
        categories: { include: { category: true } },
        inventory:  true,
        reviews:    { where: { status: 'APPROVED' }, select: { rating: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.product.count({ where });

    // Cast to our explicit interface — Prisma's runtime shape matches
    const products = rawProducts as unknown as ProductRow[];

    const formattedProducts = products.map((p: ProductRow) => {
      const stock    = p.inventory ? p.inventory.quantity - p.inventory.reservedQuantity : 0;
      const lowStock = p.inventory ? stock <= p.inventory.lowStockThreshold : false;
      const ratings  = p.reviews.map((r: { rating: number }) => r.rating);
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length) * 10) / 10
        : null;

      return {
        id:            p.id,
        slug:          p.slug,
        name:          p.name,
        description:   p.description,
        basePrice:     Number(p.basePrice),
        salePrice:     p.salePrice ? Number(p.salePrice) : null,
        imageUrl:      p.images[0]?.url || '/images/logos/MissChili_Logos_MissChili.png',
        categories:    p.categories.map((pc: { category: { name: string } }) => pc.category.name),
        stock,
        lowStock,
        averageRating: avgRating,
        reviewCount:   ratings.length,
        isFeatured:    p.isFeatured,
        heatLevel:     p.heatLevel,
        volume:        p.volume,
      };
    });

    return NextResponse.json(
      apiSuccess({
        products: formattedProducts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error('[Products] Fetch error:', error);
    return NextResponse.json(apiError('Failed to fetch products'), { status: 500 });
  }
}
