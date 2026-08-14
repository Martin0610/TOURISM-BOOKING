# TourEase — Tourism Package Booking & Management System

A full-stack tourism booking platform where users can browse Indian travel packages, select a departure city, make bookings, and pay online via Razorpay. Admins manage everything through a protected dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | Supabase PostgreSQL |
| ORM | Prisma v7 |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Payments | Razorpay |
| Version Control | Git + GitHub |

---

## Architecture

```
Browser (Next.js - localhost:3000)
        ↓
Express REST API (localhost:5000)
        ↓
Prisma ORM (pg adapter)
        ↓
Supabase PostgreSQL (remote)
```

**Scalability:** The backend is stateless (JWT auth), so multiple instances can run behind a load balancer (NGINX / AWS ALB) pointing to the same Supabase database.

---

## Database Schema

```
User ──────< Booking >────── Package
                │
             Payment

DepartureLocation ──< Booking
```

- **User** — id, name, email, password, phone, role (USER/ADMIN)
- **Package** — 20+ fields: name, destination, state, pricePerPerson, durationDays/Nights, category, availableSeats, hotelCategory, accommodation, mealsIncluded, itinerary, inclusions, exclusions, cancellationPolicy, imageUrl, etc.
- **DepartureLocation** — departureCity, departureState, destination, transportMode (FLIGHT/TRAIN/BUS), transportPrice
- **Booking** — userId, packageId, departureLocationId, travelDate, numberOfPeople, packageAmount, transportAmount, totalAmount, status
- **Payment** — bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, status

---

## Booking Price Calculation (Backend Only)

```
packageAmount   = pricePerPerson × numberOfPeople   ← from DB
transportAmount = transportPrice × numberOfPeople   ← from DB
totalAmount     = packageAmount + transportAmount
```

The frontend **never** sends price. The backend fetches actual prices from the database and calculates everything server-side.

---

## Folder Structure

```
tourism-booking/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── config/db.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── package.controller.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── departure.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── routes/
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── apiResponse.ts
│   │   │   └── schemas.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma.config.ts
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx              (Home)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── packages/page.tsx
│   │   ├── packages/[id]/page.tsx
│   │   ├── booking/[id]/page.tsx
│   │   ├── my-bookings/page.tsx
│   │   └── admin/
│   │       ├── page.tsx          (Dashboard stats)
│   │       ├── packages/page.tsx (Full CRUD)
│   │       ├── bookings/page.tsx
│   │       ├── users/page.tsx
│   │       └── payments/page.tsx
│   ├── components/Navbar.tsx
│   ├── context/AuthContext.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── .env.local
│   └── .env.example
├── postman/
│   └── tourism-booking.json
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js v18+
- npm v9+
- Git
- Supabase account
- Razorpay account (test mode)

---

## Installation

### 1. Clone

```bash
git clone https://github.com/Martin0610/TOURISM-BOOKING.git
cd TOURISM-BOOKING/tourism-booking
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values (see below)
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in .env.local values
npm run dev
```

---

## Environment Variables

### `backend/.env`

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```

> Note: If your password contains `@`, encode it as `%40` in the DATABASE_URL.

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string (URI mode)
3. Copy and paste into `DATABASE_URL` in `.env`

---

## Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Settings → API Keys → Generate Test Key
3. Copy Key ID and Key Secret to `.env` and `.env.local`

---

## Seed Data

```bash
cd backend
npm run seed
```

Seeds:
- 10 realistic Indian tourism packages (Goa, Kerala, Rajasthan, Manali, Andaman, Varanasi, Kashmir, Ladakh, Golden Triangle, Coorg)
- 38 departure routes from 8 cities with FLIGHT/TRAIN/BUS options

---

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Packages
```
GET    /api/packages?search=&state=&category=&minPrice=&maxPrice=&duration=
GET    /api/packages/:id
POST   /api/packages          (Admin only)
PUT    /api/packages/:id      (Admin only)
DELETE /api/packages/:id      (Admin only)
```

### Departure Locations
```
GET /api/departures?destination=Goa
GET /api/departures/:id
```

### Bookings
```
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id
DELETE /api/bookings/:id   (cancel — restores seats)
```

### Payments
```
POST /api/payments/create-order
POST /api/payments/verify
```

### Admin
```
GET /api/admin/stats
GET /api/admin/users
GET /api/admin/users/:id
GET /api/admin/payments
```

---

## Admin Setup

1. Register at `http://localhost:3000/register`
2. Run in Supabase SQL Editor:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

3. Log out and log back in — admin nav link will appear

---

## Postman Testing

Import `postman/tourism-booking.json` into Postman.

Collection variables auto-set: `token`, `adminToken`, `packageId`, `bookingId`

Test order:
1. Register → token auto-saved
2. Login (admin) → set `adminToken` manually
3. Create Package → `packageId` auto-saved
4. Get Departures → copy a departure ID
5. Create Booking (with departureLocationId) → `bookingId` auto-saved
6. Create Razorpay Order
7. Verify Payment

---

## Payment Flow

```
User selects package
        ↓
Selects departure city (optional)
        ↓
Selects travel date + number of people
        ↓
POST /api/bookings
Backend calculates: packageAmount + transportAmount = totalAmount
        ↓
POST /api/payments/create-order
Backend creates Razorpay order with backend-calculated amount
        ↓
Razorpay checkout opens in browser
        ↓
User completes payment
        ↓
POST /api/payments/verify
Backend verifies HMAC signature
        ↓
Booking status → CONFIRMED
Payment status → SUCCESS
Available seats decremented
```

---

## Running Locally

```bash
# Terminal 1
cd backend && npm run dev    # http://localhost:5000

# Terminal 2
cd frontend && npm run dev   # http://localhost:3000
```

---

## GitHub Commit History

Meaningful commits showing incremental development:
1. Initial project setup
2. Add Express TypeScript backend
3. Add Prisma schema
4. Configure Supabase and run migrations
5. Add Next.js frontend with all pages
6. Fix TypeScript errors in controllers
7. Fix backend runner for Node v24
8. Add Zod input validation on all routes
9. Add seed data
10. Expand schema with departure locations and price calculation
11. Update frontend with departure city selector and price breakdown
12. Add admin package CRUD with full field form
13. Update Zod validation for new package schema
14. Update README — final documentation

---

## Future Improvements

- Email notifications on booking confirmation
- PDF invoice download
- Package image upload (Cloudinary/S3)
- Reviews and ratings
- Multi-currency support
- Advanced revenue analytics
- Mobile app (React Native)
