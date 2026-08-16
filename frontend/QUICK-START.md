# TourEase - Quick Start Guide (Unified Next.js App)

## 🚀 Getting Started

This is now a **single unified Next.js full-stack application** that combines frontend and backend into one.

### Prerequisites
- Node.js 18+
- PostgreSQL database (we use Supabase)
- Razorpay account for payments

### Installation

```bash
# Navigate to frontend directory (contains the unified app)
cd tourism-booking/frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run Prisma migrations
npx prisma generate
npx prisma migrate dev

# Optional: Seed database with sample data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Visit **http://localhost:3000** - Everything runs on one port! 🎉

## 📁 Project Structure

```
frontend/                    # The unified app (everything is here now)
├── app/
│   ├── api/                # API Route Handlers (replaces Express backend)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── packages/      # Package management
│   │   ├── bookings/      # Booking management
│   │   ├── payments/      # Razorpay integration
│   │   ├── reviews/       # Reviews & ratings
│   │   ├── wishlist/      # User wishlist
│   │   ├── coupons/       # Coupon system
│   │   ├── departures/    # Departure locations
│   │   └── admin/         # Admin operations
│   │
│   ├── (pages)/           # Frontend pages (React components)
│   ├── admin/             # Admin dashboard
│   ├── packages/          # Package browsing
│   ├── booking/           # Booking flow
│   └── ...
│
├── components/            # Reusable React components
├── context/              # React Context (AuthContext)
├── lib/                  # Shared utilities
│   ├── api.ts           # Axios client
│   ├── auth.ts          # Auth helpers (NEW)
│   ├── apiResponse.ts   # Response formatters (NEW)
│   ├── jwt.ts           # JWT utilities (NEW)
│   └── db.ts            # Prisma client
│
└── prisma/
    ├── schema.prisma     # Database schema
    ├── migrations/       # Migration history
    └── seed.ts          # Seed data

backend/                   # Old Express backend (kept for reference only)
```

## 🔑 Key Differences from Old Setup

| Aspect | Before | After |
|--------|--------|-------|
| Servers | 2 separate servers | 1 unified server |
| Ports | Backend:5000 + Frontend:3000 | Everything:3000 |
| API Calls | `http://localhost:5000/...` | `/api/...` |
| Backend | Express.js | Next.js API Routes |
| Startup | Run 2 terminals | Run 1 command |

## 🧪 Testing

```bash
# Run build to check for errors
npm run build

# Start production server
npm run start

# Open Prisma Studio to view database
npx prisma studio
```

## 📝 Environment Variables

Your `.env` file should have:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
JWT_SECRET="your-secret-key"

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."

# Email (for booking confirmations)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="app-password"
EMAIL_FROM="TourEase <your-email@gmail.com>"

# Optional
FRONTEND_URL="http://localhost:3000"
```

## 🎯 API Endpoints

All API endpoints are at `/api/*`:

### Public Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/packages` - Browse packages
- `GET /api/departures` - View departure locations
- `GET /api/coupons` - Available coupons

### Protected Endpoints (Requires JWT Token)
- `GET /api/auth/me` - Current user
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - My bookings
- `POST /api/payments/create-order` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/reviews` - Submit review
- `GET /api/wishlist` - My wishlist

### Admin Only Endpoints
- `GET /api/admin/stats` - Dashboard analytics
- `POST /api/packages` - Create/update packages
- `GET /api/admin/users` - Manage users
- `GET /api/admin/payments` - View all payments
- `PUT /api/admin/reviews/:id` - Moderate reviews
- `POST /api/admin/coupons` - Create coupons

## 🔐 Authentication

API routes use helper functions instead of Express middleware:

```typescript
// In any API route
import { getAuthUser, requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser(request);
  requireAuth(authUser);  // Throws if not authenticated
  
  // Your logic here
}
```

## 📦 Features

- ✅ User registration & authentication (JWT)
- ✅ Package browsing with advanced filters
- ✅ Multi-person booking with group discounts
- ✅ Departure location selection
- ✅ Razorpay payment integration
- ✅ Coupon system (percentage/fixed discounts)
- ✅ Reviews & ratings (with admin moderation)
- ✅ Wishlist functionality
- ✅ Admin dashboard with analytics
- ✅ Email notifications (booking confirmation)

## 🛠️ Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Prisma commands
npx prisma studio        # Open database GUI
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma db push       # Push schema changes (dev only)
```

## 📚 Documentation

- [README-UNIFIED.md](./README-UNIFIED.md) - Complete API documentation
- [MIGRATION-COMPLETE.md](../MIGRATION-COMPLETE.md) - Migration details
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Prisma Client not generated
```bash
npx prisma generate
```

### Database connection issues
```bash
# Test database connection
npx prisma db pull
```

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 🚢 Deployment

This is now a **single deployment** (much simpler than before):

### Vercel (Recommended)
```bash
vercel deploy
```

### Other Platforms
- Single build output in `.next/`
- Set `NODE_ENV=production`
- Ensure all environment variables are set
- Run `npm run build && npm run start`

## 📖 Default Credentials

After running the seed script:

**Admin:**
- Email: `admin@tourease.com`
- Password: `admin123`

**Test User:**
- Email: `user@example.com`
- Password: `password123`

## 🎉 What's Different?

You now have:
- ✅ Single codebase
- ✅ One server to run
- ✅ Simpler deployment
- ✅ Better developer experience
- ✅ Modern Next.js App Router
- ✅ Type-safe API routes

Enjoy building with the unified architecture! 🚀
