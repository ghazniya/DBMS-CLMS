# Campus Laundry Management System (CLMS)

A 3-tier full-stack application for managing campus laundry operations. Built with Flutter (Android), Node.js/Express, and PostgreSQL.

## Project Structure

```
├── backend/            # Node.js + Express API server
├── frontend/           # Next.js web frontend (PWA)
├── flutter_frontend/   # Flutter mobile app (Android)
└── database/           # SQL schema
```

## Prerequisites

- Node.js v20+
- PostgreSQL v12+ (local) or a hosted PostgreSQL (e.g., Supabase)
- Flutter SDK v3.10+ (for the mobile app)
- Android SDK (for building the APK)

---

## 1. Database Setup

### Option A: Local PostgreSQL

```bash
# Create the database
sudo -u postgres createdb hlms

# Run the schema
psql -d hlms -f database/schema.sql
```

### Option B: Hosted (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of `database/schema.sql`, then run it
3. Copy the **Connection Pooler URI** from Project Settings > Database (use the IPv4/pooler URL)

---

## 2. Backend Setup

```bash
cd backend
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

- **Local**: Set `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`
- **Remote**: Set `DATABASE_URL` to your PostgreSQL connection string (this takes priority)
- **JWT_SECRET**: Set to a strong random string

### Seed the admin user

```bash
node seed_admin.js
```

This creates a default admin account:
- Email: `admin@hlms.com`
- Password: `admin123`

### Run locally

```bash
npm start
```

The API server starts on `http://localhost:5000`.

### Deploy to Vercel

```bash
npx vercel
```

Set environment variables on Vercel:

```bash
npx vercel env add DATABASE_URL production
npx vercel env add JWT_SECRET production
```

Then deploy to production:

```bash
npx vercel --prod
```

---

## 3. Flutter App (Android)

```bash
cd flutter_frontend
flutter pub get
```

### Run locally (against local backend)

```bash
flutter run
```

The app defaults to `http://10.0.2.2:5000` (Android emulator → localhost).

### Build APK (against hosted backend)

```bash
flutter build apk --dart-define=API_BASE_URL=https://your-backend-url.vercel.app
```

The APK will be at `flutter_frontend/build/app/outputs/flutter-apk/app-release.apk`.

---

## 4. Next.js Web Frontend (optional)

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage users, configure laundry service charges, view reports |
| **Staff** | Create orders, register residents, update order status, record deliveries |
| **Resident** | View own orders, track status, confirm delivery |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login with email/password |
| GET | `/api/admin/users` | Admin | List all users |
| POST | `/api/admin/users` | Admin | Create user |
| GET/PUT/DELETE | `/api/admin/charges/:type` | Admin | Manage service charges |
| GET | `/api/admin/reports/orders` | Admin | Order reports |
| GET | `/api/admin/reports/revenue` | Admin | Revenue summary |
| GET | `/api/admin/reports/workload` | Admin | Staff workload |
| GET/POST | `/api/staff/orders` | Staff | View/create orders |
| PUT | `/api/staff/orders/:id/status` | Staff | Update order status |
| PUT | `/api/staff/orders/:id/payment` | Staff | Update payment status |
| POST | `/api/staff/orders/:id/delivery` | Staff | Record delivery |
| GET/POST | `/api/staff/customers` | Staff | View/create residents |
| GET | `/api/staff/charges` | Staff | View charges |
| GET | `/api/staff/history` | Staff | Order history |
| GET | `/api/resident/orders` | Resident | View own orders |
| PUT | `/api/resident/orders/:id/confirm` | Resident | Confirm delivery |

## Tech Stack

- **Frontend**: Flutter (Android), Next.js (Web PWA)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Auth**: JWT (bcrypt password hashing)
- **Hosting**: Vercel (backend), Supabase (database)
