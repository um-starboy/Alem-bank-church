# አለም ባንክ ገነት ቤተ ክርስቲያን — v3

Full stack church website with Express backend, PostgreSQL database, JWT auth, and role-based access.

---

## 🗂️ Project Structure

```
alem-bank-v3/
├── client/          ← React + Vite frontend
└── server/          ← Node.js + Express backend
```

---

## 🚀 Local Development Setup

### 1. Install everything
```bash
cd alem-bank-v3
npm run install:all
```

### 2. Set up the server environment
```bash
cd server
cp .env.example .env
# Edit .env — fill in DATABASE_URL and JWT secrets
```

### 3. Set up the PostgreSQL database
Create a local PostgreSQL database, then run:
```bash
psql -U postgres -d your_db_name -f src/db/schema.sql
```

### 4. Seed the first superadmin
```bash
cd server
node src/db/seed.js
```

### 5. Set up the client environment
```bash
cd client
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (already set)
```

### 6. Run both servers at once
```bash
cd alem-bank-v3
npm run dev
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:5000
- Login:    http://localhost:3000/login

---

## 🚂 Deploy to Railway (Free)

### Step 1 — Create Railway account
Go to https://railway.app and sign up with GitHub.

### Step 2 — Deploy the backend

1. Click **New Project** → **Deploy from GitHub repo**
2. Select your repo → choose the `server/` folder as root
3. Railway auto-detects Node.js

**Add environment variables in Railway dashboard:**
```
DATABASE_URL         = (Railway gives you this automatically when you add PostgreSQL)
JWT_SECRET           = generate a 64-char random string
JWT_REFRESH_SECRET   = generate another 64-char random string
JWT_EXPIRES_IN       = 15m
JWT_REFRESH_EXPIRES_IN = 7d
NODE_ENV             = production
CLIENT_URL           = https://your-frontend.vercel.app
SEED_ADMIN_USERNAME  = superadmin
SEED_ADMIN_PASSWORD  = YourSecurePassword123!
SEED_ADMIN_EMAIL     = your@email.com
PORT                 = 5000
```

### Step 3 — Add PostgreSQL on Railway

1. In your Railway project → **New** → **Database** → **PostgreSQL**
2. Railway automatically sets `DATABASE_URL` in your server's environment
3. Click your server service → **Settings** → copy the public URL

### Step 4 — Run the schema and seed

In Railway dashboard → your server service → **Shell**:
```bash
psql $DATABASE_URL -f src/db/schema.sql
node src/db/seed.js
```

### Step 5 — Deploy the frontend to Vercel

1. Go to https://vercel.com → New Project → import your repo
2. Set **Root Directory** to `client/`
3. Add environment variable:
   ```
   VITE_API_URL = https://your-server.railway.app/api
   ```
4. Deploy!

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | Everything — add/remove/edit users, all content |
| **Pastor** | All content (sermons, events, ministries, gallery, church info) |
| **Teacher** | Sermons only |
| **Guest** | View all public pages, submit prayer requests |

---

## 🔐 API Endpoints

### Auth
```
POST   /api/auth/login           — Login
POST   /api/auth/logout          — Logout
POST   /api/auth/refresh         — Refresh access token
GET    /api/auth/me              — Get current user
POST   /api/auth/change-password — Change own password
```

### Users (superadmin only)
```
GET    /api/users                — List all users
POST   /api/users                — Create pastor or teacher
PUT    /api/users/:id            — Update user
DELETE /api/users/:id            — Delete user
POST   /api/users/:id/reset-password — Reset user's password
```

### Content (public GET, protected POST/PUT/DELETE)
```
GET/PUT  /api/church-info
GET/PUT  /api/hero
GET      /api/about
PUT      /api/about/:key         — key = mission | vision | story
GET/POST /api/sermons
PUT/DEL  /api/sermons/:id
GET/POST /api/events
PUT/DEL  /api/events/:id
GET/POST /api/ministries
PUT/DEL  /api/ministries/:id
GET/POST /api/gallery
DELETE   /api/gallery/:id
POST     /api/prayer             — Public submit
GET      /api/prayer             — Pastor+ only
```

---

## 🔑 Generate secure JWT secrets

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run it twice — once for `JWT_SECRET`, once for `JWT_REFRESH_SECRET`.

---

## ⚠️ Security Checklist

- [ ] Changed default superadmin password after first login
- [ ] JWT secrets are long random strings (not "secret123")
- [ ] `NODE_ENV=production` on Railway
- [ ] `CLIENT_URL` set to exact frontend domain (no trailing slash)
- [ ] Never commit `.env` to Git
