import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/products';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getProducts({
      category: searchParams.get('category'),
      sort: searchParams.get('sort'),
      search: searchParams.get('search'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    console.error('[Products] Fetch error:', error);
    return NextResponse.json(apiError('Failed to fetch products'), { status: 500 });
  }
}
