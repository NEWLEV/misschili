import { PrismaClient, UserRole, ProductStatus, PopupType, PopupFrequency, SettingType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// Prisma v7 requires a driver adapter (see lib/prisma.ts)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌶️ Seeding Miss Chili database...');

  // Admin user
  const adminHash = await bcrypt.hash('MissChili2024!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@misschilipeppers.com' },
    update: {},
    create: {
      email: 'admin@misschilipeppers.com',
      name: 'Miss Chili Admin',
      passwordHash: adminHash,
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Categories
  const catFiery = await prisma.category.upsert({
    where: { slug: 'fiery-heat' },
    update: {},
    create: { slug: 'fiery-heat', name: 'Fiery Heat', description: 'Ghost pepper-based sauces for true heatseekers.', sortOrder: 1 },
  });
  const catSpicy = await prisma.category.upsert({
    where: { slug: 'spicy-hot' },
    update: {},
    create: { slug: 'spicy-hot', name: 'Spicy Hot', description: 'Jalapeño & habanero blends for everyday heat.', sortOrder: 2 },
  });
  console.log('✅ Categories created');

  // Products
  const fieryHeat = await prisma.product.upsert({
    where: { slug: 'fiery-heat-ghost-pepper' },
    update: {},
    create: {
      slug: 'fiery-heat-ghost-pepper',
      name: 'Fiery Heat — Ghost Pepper',
      description: 'Made for heatseekers. What starts as a spark quickly becomes a rush of sweetness, spices, and fiery heat. An experience that delivers pleasure long after the last bite.',
      sku: 'MC-FH-5OZ',
      basePrice: 12.99,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      heatLevel: 9,
      volume: '5 fl oz (148 ml)',
      ingredients: 'Distilled White Vinegar, Garlic, Sugar, Sweet Basil, Cilantro, Ghost Pepper, Kosher Salt, Xanthan Gum',
      metaTitle: 'Fiery Heat Ghost Pepper Hot Sauce | Miss Chili',
      metaDesc: 'Ghost pepper hot sauce handcrafted in Miami. Bold heat with sweetness, spices, and fiery intensity. 5 fl oz.',
      images: {
        create: [
          { url: '/images/logos/MissChili_Logos_FieryHeat.png', altText: 'Fiery Heat Ghost Pepper Hot Sauce', sortOrder: 0, isFeatured: true },
          { url: '/images/labels/MissChili_Label_FIERYHEAT.jpg', altText: 'Fiery Heat label with nutrition facts', sortOrder: 1 },
        ],
      },
      categories: { create: { categoryId: catFiery.id } },
      inventory: { create: { quantity: 100, lowStockThreshold: 10 } },
    },
  });

  const spicyHot = await prisma.product.upsert({
    where: { slug: 'spicy-hot-jalapeno-habanero' },
    update: {},
    create: {
      slug: 'spicy-hot-jalapeno-habanero',
      name: 'Spicy Hot — Jalapeño Habanero',
      description: 'To all jalapeño lovers this hot sauce turns up the heat. Jalapeño flavor combined with habanero peppers and fresh spices for a lively taste that will leave you wanting more.',
      sku: 'MC-SH-5OZ',
      basePrice: 11.99,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      heatLevel: 7,
      volume: '5 fl oz (148 ml)',
      ingredients: 'Distilled White Vinegar, Jalapeños, Habanero Peppers, Garlic, Onions, Sweet Basil, Cilantro, Kosher Salt, Xanthan Gum',
      metaTitle: 'Spicy Hot Jalapeño Habanero Hot Sauce | Miss Chili',
      metaDesc: 'Jalapeño habanero hot sauce with fresh spices. The everyday hot sauce for people who want real flavor.',
      images: {
        create: [
          { url: '/images/logos/MissChili_Logos_SpicyHot.png', altText: 'Spicy Hot Jalapeño Habanero Hot Sauce', sortOrder: 0, isFeatured: true },
          { url: '/images/labels/MissChili_LabelSPICYHOT.jpg', altText: 'Spicy Hot label with nutrition facts', sortOrder: 1 },
        ],
      },
      categories: { create: { categoryId: catSpicy.id } },
      inventory: { create: { quantity: 100, lowStockThreshold: 10 } },
    },
  });
  console.log('✅ Products created');

  // Site Settings
  const settings = [
    { key: 'store_name', value: 'Miss Chili Hot Sauce', type: SettingType.STRING },
    { key: 'contact_email', value: 'misschilihotsauce@gmail.com', type: SettingType.STRING },
    { key: 'instagram', value: 'https://www.instagram.com/misschilimiami', type: SettingType.STRING },
    { key: 'free_shipping_threshold', value: '50', type: SettingType.STRING },
    { key: 'tax_rate', value: '0.07', type: SettingType.STRING },
    { key: 'currency', value: 'USD', type: SettingType.STRING },
    { key: 'hero_headline', value: 'Ghost Pepper Heat. Miami Soul.', type: SettingType.STRING },
    { key: 'hero_subtext', value: 'Born in a backyard garden. Popularized by the sailing club.', type: SettingType.STRING },
    { key: 'hero_cta_text', value: 'Shop Our Sauces', type: SettingType.STRING },
    { key: 'hero_cta_url', value: '/products', type: SettingType.STRING },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Site settings created');

  // Cookie consent popup
  await prisma.popup.upsert({
    where: { id: 'cookie-consent-default' },
    update: {},
    create: {
      id: 'cookie-consent-default',
      type: PopupType.COOKIE_CONSENT,
      title: 'We Use Cookies',
      message: 'This website uses cookies to ensure you get the best experience. By continuing to browse, you agree to our cookie policy.',
      ctaText: 'Accept',
      isActive: true,
      frequency: PopupFrequency.ONCE,
      targetPage: 'all',
    },
  });
  console.log('✅ Default popup created');

  console.log('\n🌶️ Seed complete!');
  console.log('Admin login: admin@misschilipeppers.com / MissChili2024!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
