# TourEase - Unified Next.js Full-Stack Application

## Architecture

This is a **unified full-stack Next.js application** that combines:
- ✅ Next.js 15 with App Router
- ✅ API Route Handlers (replacing Express.js)
- ✅ Prisma ORM with PostgreSQL (Supabase)
- ✅ TypeScript
- ✅ Razorpay Payment Integration
- ✅ JWT Authentication

## Migration Complete

All Express controllers have been converted to Next.js API Route Handlers in `app/api/`:

### API Routes

**Authentication** (`/api/auth/`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

**Packages** (`/api/packages/`)
- `GET /api/packages` - List all packages (with filters)
- `POST /api/packages` - Create package (admin only)
- `GET /api/packages/[id]` - Get package details
- `PUT /api/packages/[id]` - Update package (admin only)
- `DELETE /api/packages/[id]` - Delete package (admin only)

**Bookings** (`/api/bookings/`)
- `GET /api/bookings` - List user bookings (or all for admin)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking
- `POST /api/bookings/[id]/cancel` - Cancel booking

**Payments** (`/api/payments/`)
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature

**Reviews** (`/api/reviews/`)
- `POST /api/reviews` - Submit review
- `GET /api/reviews/package/[packageId]` - Get package reviews

**Wishlist** (`/api/wishlist/`)
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/[packageId]` - Remove from wishlist

**Coupons** (`/api/coupons/`)
- `GET /api/coupons` - List available coupons
- `POST /api/coupons/validate` - Validate coupon

**Departures** (`/api/departures/`)
- `GET /api/departures` - List departure locations
- `GET /api/departures/[id]` - Get departure details

**Admin Routes** (`/api/admin/`)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/revenue` - Revenue analytics
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/[id]` - User details
- `PUT /api/admin/users/[id]` - Update user role
- `GET /api/admin/payments` - All payments
- `GET /api/admin/reviews` - All reviews
- `PUT /api/admin/reviews/[id]` - Moderate review
- `DELETE /api/admin/reviews/[id]` - Delete review
- `GET /api/admin/coupons` - All coupons
- `POST /api/admin/coupons` - Create coupon
- `PUT /api/admin/coupons/[id]` - Update coupon
- `DELETE /api/admin/coupons/[id]` - Delete coupon

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   # Copy .env.example to .env
   # Update DATABASE_URL, JWT_SECRET, Razorpay keys, etc.
   ```

3. **Run Prisma migrations:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Seed the database (optional):**
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app runs on **http://localhost:3000**

## Key Changes from Express Backend

1. **Single Port:** Everything runs on port 3000 (no separate backend server)
2. **API Routes:** Express controllers → Next.js API Route Handlers
3. **Authentication:** Custom middleware → `lib/auth.ts` with `getAuthUser()` and `requireAuth()`
4. **Response Handlers:** Express response → Next.js `NextResponse.json()`
5. **Relative URLs:** API calls now use `/api/*` instead of `http://localhost:5000/*`

## Project Structure

```
app/
├── api/              # API Route Handlers (replaces Express backend)
│   ├── auth/
│   ├── bookings/
│   ├── packages/
│   ├── payments/
│   ├── reviews/
│   ├── wishlist/
│   ├── coupons/
│   ├── departures/
│   └── admin/
├── (pages)/          # Frontend pages
├── components/       # React components
├── context/          # React context providers
└── lib/              # Shared utilities
    ├── auth.ts       # Auth helpers
    ├── apiResponse.ts # Response formatters
    ├── jwt.ts        # JWT utilities
    ├── db.ts         # Prisma client
    └── api.ts        # Axios instance

prisma/
├── schema.prisma     # Database schema
├── seed.ts           # Seed data
└── migrations/       # Migration history
```

## Features

- ✅ User authentication & authorization (JWT)
- ✅ Package browsing with filters
- ✅ Booking management with group discounts
- ✅ Razorpay payment integration
- ✅ Reviews & ratings (with admin moderation)
- ✅ Wishlist functionality
- ✅ Coupon system
- ✅ Admin dashboard with analytics
- ✅ Departure location management
- ✅ Email notifications (on payment confirmation)

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio
```

## Database

PostgreSQL hosted on Supabase. All migrations are tracked in `prisma/migrations/`.

## Notes

- The old Express backend in `tourism-booking/backend/` is kept for reference
- Frontend API client (`lib/api.ts`) now points to `/api` instead of external server
- All authentication logic uses `lib/auth.ts` helpers
- Admin routes are protected with `requireAdmin()` middleware
