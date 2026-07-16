import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateCoupon } from '@/lib/coupons';
import { apiSuccess, apiError } from '@/lib/utils';
import { checkoutSchema } from '@/lib/validations';

interface CartItem {
  id: string;
  quantity: number;
}

interface LineItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, formData } = body as { items: CartItem[]; formData: unknown };

    if (!items || items.length === 0) {
      return NextResponse.json(apiError('Cart is empty'), { status: 400 });
    }

    const parsed = checkoutSchema.safeParse(formData);
    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0].message), { status: 400 });
    }

    const checkout = parsed.data;

    // Fetch products from database
    const productIds = items.map((item) => item.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      include: { inventory: true, images: { where: { isFeatured: true }, take: 1 } },
    });

    if (products.length !== items.length) {
      return NextResponse.json(apiError('One or more products are unavailable'), { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems: LineItem[] = [];

    for (const cartItem of items) {
      const product = products.find((p: typeof products[number]) => p.id === cartItem.id);
      if (!product) continue;

      // Check stock
      if (product.inventory) {
        const available = product.inventory.quantity - product.inventory.reservedQuantity;
        if (cartItem.quantity > available) {
          return NextResponse.json(
            apiError(`Insufficient stock for ${product.name}. Only ${available} available.`),
            { status: 400 }
          );
        }
      }

      const price = product.salePrice ? Number(product.salePrice) : Number(product.basePrice);
      const lineTotal = price * cartItem.quantity;
      subtotal += lineTotal;

      lineItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: cartItem.quantity,
        unitPrice: price,
        totalPrice: lineTotal,
        imageUrl: product.images[0]?.url || '',
      });
    }

    const shippingCost = subtotal >= 50 ? 0 : 7.99;
    const taxAmount = Math.round(subtotal * 0.07 * 100) / 100;

    const session = await auth();

    // Re-validate the coupon server-side — never trust a client-computed discount.
    let couponId: string | undefined;
    let discountAmount = 0;
    if (checkout.couponCode) {
      const couponResult = await validateCoupon(checkout.couponCode, subtotal, session?.user?.id);
      if (!couponResult.valid) {
        return NextResponse.json(apiError(couponResult.error || 'Invalid coupon code'), { status: 400 });
      }
      couponId = couponResult.couponId;
      discountAmount = couponResult.discountAmount || 0;
    }

    let stripeCouponId: string | undefined;
    if (discountAmount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: 'usd',
        duration: 'once',
      });
      stripeCouponId = stripeCoupon.id;
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productName,
            images: item.imageUrl ? [`${process.env.NEXT_PUBLIC_APP_URL}${item.imageUrl}`] : [],
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(shippingCost * 100),
              currency: 'usd',
            },
            display_name: shippingCost === 0 ? 'Free Shipping' : 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
      customer_email: checkout.contact.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        orderItems: JSON.stringify(lineItems.map((i) => ({ id: i.productId, qty: i.quantity }))),
        shippingAddress: JSON.stringify(checkout.shippingAddress),
        contactInfo: JSON.stringify(checkout.contact),
        userId: session?.user?.id || '',
        shippingCost: String(shippingCost),
        taxAmount: String(taxAmount),
        couponId: couponId || '',
        discountAmount: String(discountAmount),
      },
    });

    return NextResponse.json(apiSuccess({ sessionId: stripeSession.id, url: stripeSession.url }));
  } catch (error) {
    console.error('[Checkout] Error:', error);
    return NextResponse.json(apiError('Failed to create checkout session'), { status: 500 });
  }
}
