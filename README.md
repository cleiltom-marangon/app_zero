# Zerogas Dashboard (Next.js)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create `.env.local` with:
   ```
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASS=your_pass
   DB_NAME=your_db
   JWT_SECRET=some_secret
   ```

3. Run dev:
   ```
   npm run dev
   ```

API endpoints:
- POST /api/login  { email, password }
- GET /api/air/[cliente]
- GET /api/clients  (admin only)


