# Tourism Package Booking and Management System

A full-stack web application that allows users to browse tourism packages, make bookings, and pay online using Razorpay. Admins can manage packages, users, bookings, and payments through a protected dashboard.

---

## Features

### User Features
- Register and login with JWT authentication
- Browse and search tourism packages
- Filter by destination, price, duration
- View package details, itinerary, available seats
- Create bookings with travel date and number of people
- Pay online via Razorpay
- View booking history and payment status
- Cancel bookings

### Admin Features
- Protected admin dashboard
- Manage tourism packages (CRUD)
- View and manage users and their bookings
- View and manage all bookings
- View payment details and Razorpay transaction info
- Dashboard statistics (total users, bookings, revenue, etc.)

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js, React, TypeScript, Tailwind CSS |
| Backend      | Node.js, Express.js, TypeScript     |
| Database     | Supabase PostgreSQL                 |
| ORM          | Prisma                              |
| Auth         | JWT, bcrypt                         |
| Payments     | Razorpay                            |
| Version Control | Git, GitHub                      |

---

## Architecture

```
User Browser
     |
  Next.js Frontend (localhost:3000)
     |
  Express.js REST API (localhost:5000)
     |
  Prisma ORM
     |
  Supabase PostgreSQL (remote)
```

### Scalability Note
The backend is stateless and uses JWT authentication, meaning it can be horizontally scaled. In production, multiple Node.js backend instances can run behind a load balancer (e.g., NGINX or AWS ALB):

```
Load Balancer
     |
┌────┴────┬────────┐
Backend   Backend   Backend
Server 1  Server 2  Server 3
     └────┬────┘
   Supabase PostgreSQL
```

---

## Folder Structure

```
tourism-booking/
├── frontend/          # Next.js application
├── backend/           # Express + TypeScript API
├── README.md
└── .gitignore
```

---

## Prerequisites

- Node.js v18+
- npm v9+
- Git
- Supabase account (free tier works)
- Razorpay account (test mode)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/tourism-booking.git
cd tourism-booking
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your .env.local values
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
PORT=5000
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

---

## Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Copy the **Connection String** from Settings → Database → Connection string (URI mode)
3. Paste it as `DATABASE_URL` in your backend `.env`

---

## Prisma Setup & Migrations

```bash
cd backend
npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Run migrations
npx prisma studio            # (Optional) Open Prisma Studio to view DB
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |

### Packages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/packages | Get all packages |
| GET | /api/packages/:id | Get package by ID |
| POST | /api/packages | Create package (Admin) |
| PUT | /api/packages/:id | Update package (Admin) |
| DELETE | /api/packages/:id | Delete package (Admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bookings | Create booking |
| GET | /api/bookings | Get user's bookings |
| GET | /api/bookings/:id | Get booking by ID |
| PUT | /api/bookings/:id | Update booking |
| DELETE | /api/bookings/:id | Cancel booking |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment |

---

## Running Locally

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Admin Access

To create an admin user, register normally and then update the `role` field in the database to `ADMIN` via Prisma Studio or Supabase SQL editor:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## Postman Testing

Import the Postman collection from `postman/tourism-booking.json` to test all API endpoints with example request bodies and responses.

---

## Razorpay Setup

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys → Generate Test Key
3. Copy `Key ID` and `Key Secret` to your `.env` files

---

## Future Improvements

- Email notifications for booking confirmation
- Package reviews and ratings
- PDF booking invoice download
- Advanced analytics dashboard
- Multi-currency support
- Package image upload via cloud storage
- Mobile app (React Native)
