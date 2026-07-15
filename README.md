# 🌶️ Miss Chili Hot Sauce — E-commerce Platform

Production-ready e-commerce storefront and admin dashboard for [www.misschilipeppers.com](https://www.misschilipeppers.com).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS v4 + CSS Custom Properties |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 (Auth.js) |
| Payments | Stripe Checkout |
| Email | Nodemailer (Hostinger SMTP) |
| Deployment | Hostinger (standalone output) |

## Quick Start (5 Steps)

### 1. Clone & Install
```bash
git clone <repo-url>
cd miss-chili-peppers
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start Database
```bash
docker compose up -d
# OR use your own PostgreSQL instance
```

### 4. Run Migrations & Seed
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Start Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Login

| Role | Email | Password |
|---|---|---|
| Admin | admin@misschilihotsauce.com | MissChili2024! |

## Project Structure

```
app/
├── (storefront pages)     # Home, Products, Cart, Checkout
├── admin/                 # Protected admin dashboard
├── api/                   # REST endpoints
│   ├── auth/              # NextAuth handlers
│   ├── checkout/          # Stripe session creation
│   ├── newsletter/        # Email subscriptions
│   ├── products/          # Product catalog
│   ├── popups/active/     # Active popup query
│   └── webhooks/stripe/   # Stripe webhook handler
components/
├── ui/                    # Button, Input, Badge, Modal
├── storefront/            # Header, Footer, CartDrawer, providers
└── admin/                 # AdminSidebar
lib/
├── auth.ts                # NextAuth config
├── prisma.ts              # Prisma client singleton
├── stripe.ts              # Stripe client
├── email.ts               # Transactional email service
├── utils.ts               # Formatters, API helpers
└── validations/           # Zod schemas
prisma/
├── schema.prisma          # Complete database schema
└── seed.ts                # Dev seed data
styles/
└── tokens.css             # Design system tokens
```

## Stripe Webhook (Local Dev)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Deployment to Hostinger

1. Build: `npm run build`
2. The `standalone` output in `.next/standalone` contains the complete Node.js server
3. Upload to Hostinger VPS and run with `node server.js`
4. Set environment variables in Hostinger panel
5. Point domain DNS to Hostinger

## Brand Assets

- Products: Fiery Heat (Ghost Pepper, 🔥 9/10) and Spicy Hot (Jalapeño Habanero, 🌶️ 7/10)
- Both 5 fl oz (148 ml), 25 servings, 0 calories
- Manufactured for Miss Chili Hot Sauce, LLC — Miami, FL 33186
- Instagram: [@misschilimiami](https://instagram.com/misschilimiami)
