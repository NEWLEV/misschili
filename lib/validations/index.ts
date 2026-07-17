import { z } from 'zod';

// ─── Product ────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sku: z.string().min(1, 'SKU is required'),
  basePrice: z.coerce.number().positive('Price must be positive'),
  salePrice: z.coerce.number().positive().nullable().optional(),
  saleStart: z.coerce.date().nullable().optional(),
  saleEnd: z.coerce.date().nullable().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
  weight: z.coerce.number().positive().nullable().optional(),
  ingredients: z.string().nullable().optional(),
  heatLevel: z.coerce.number().int().min(1).max(10).nullable().optional(),
  volume: z.string().nullable().optional(),
  categoryIds: z.array(z.string()).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ─── Order ──────────────────────────────────────────

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional().or(z.literal('')),
  adminNotes: z.string().optional(),
});

export type OrderStatusFormData = z.infer<typeof orderStatusSchema>;

// ─── Coupon ─────────────────────────────────────────

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.coerce.number().positive('Value must be positive'),
  minOrderAmount: z.coerce.number().min(0).nullable().optional(),
  maxUses: z.coerce.number().int().positive().nullable().optional(),
  maxUsesPerUser: z.coerce.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
}).refine(
  (data) => data.type !== 'PERCENTAGE' || data.value <= 100,
  { message: 'Percentage discount cannot exceed 100%', path: ['value'] }
);

export type CouponFormData = z.infer<typeof couponSchema>;

// ─── Popup ──────────────────────────────────────────

export const popupSchema = z.object({
  type: z.enum(['NEWSLETTER', 'EXIT_INTENT', 'PROMOTION', 'COOKIE_CONSENT', 'CART_ABANDONMENT']),
  title: z.string().min(2, 'Title is required'),
  message: z.string().min(5, 'Message is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional().or(z.literal('')),
  discountCode: z.string().optional(),
  isActive: z.boolean().default(false),
  frequency: z.enum(['ONCE', 'SESSION', 'DAILY', 'EVERY_VISIT']).default('ONCE'),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  targetPage: z.string().optional(),
});

export type PopupFormData = z.infer<typeof popupSchema>;

// ─── Checkout ───────────────────────────────────────

export const checkoutContactSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const checkoutAddressSchema = z.object({
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().default('US'),
});

export const checkoutSchema = z.object({
  contact: checkoutContactSchema,
  shippingAddress: checkoutAddressSchema,
  billingAddress: checkoutAddressSchema.optional(),
  sameAsBilling: z.boolean().default(true),
  shippingMethod: z.string().min(1, 'Please select a shipping method'),
  couponCode: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ─── Review ─────────────────────────────────────────

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// ─── Newsletter ─────────────────────────────────────

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().optional(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

// ─── User Registration ─────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Login ──────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Forgot / Reset Password ───────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Category ───────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  parentId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ─── Address ────────────────────────────────────────

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().default('US'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
  isBilling: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// ─── Site Settings ──────────────────────────────────

export const siteSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  type: z.enum(['STRING', 'JSON', 'BOOLEAN']).default('STRING'),
});

export type SiteSettingFormData = z.infer<typeof siteSettingSchema>;
