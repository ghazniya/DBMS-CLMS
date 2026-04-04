# Central Laundry Management System (CLMS)

A robust 3-tier full-stack application.

## 🚀 Deployment Instructions

### Prerequisites
- Node.js (v20.9.0+)
- PostgreSQL (v12+)

### 1. Database Setup
1. Create a PostgreSQL Database named `hlms`.
2. Run the `database/schema.sql` script into the database.
   ```bash
   psql -U youruser -d hlms -f database/schema.sql
   ```

### 2. Backend Setup
The backend serves on Port `5000` by default.
1. Navigate to `/backend`
2. Install dependencies: `npm install`
3. Edit the `.env` file to correctly point at your database.
4. Run the API: `npm start` or `node src/server.js`

*(Note: Create an initial Admin User within the SQL database directly to be able to Login and configure the system).*

### 3. Frontend Setup
The frontend runs via Next.js App router.
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Run Development Server: `npm run dev`
4. For Production: `npm run build && npm start`
