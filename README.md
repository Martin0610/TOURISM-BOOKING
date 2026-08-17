# TripEase - Tourism Booking Platform

A full-stack tourism package booking application built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **User Authentication**: Email verification with OTP, password reset
- **Package Browsing**: View and filter tourism packages across India
- **Booking System**: Book packages with multiple travelers, departure locations, and group discounts
- **Payment Integration**: Razorpay payment gateway
- **Wishlist**: Save favorite packages
- **Reviews & Ratings**: Review completed bookings
- **Admin Dashboard**: Manage packages, bookings, users, coupons, payments, and reviews
- **Coupon System**: Apply discount coupons at checkout

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT with bcryptjs
- **Email**: Nodemailer (Gmail SMTP)
- **Payment**: Razorpay
- **Icons**: Lucide React

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret-key"
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   ```
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed sample data (optional):
   ```bash
   npx prisma db seed
   ```
6. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

## Project Structure

```
tourism-booking/
├── app/                  # Next.js pages and API routes
│   ├── api/             # Backend API endpoints
│   ├── admin/           # Admin dashboard pages
│   └── (pages)/         # Frontend pages
├── components/          # React components
├── context/             # React context providers
├── lib/                 # Utilities and database client
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

## Admin Credentials

- Email: mjv3140@gmail.com
- Password: Admin@123

## License

MIT
