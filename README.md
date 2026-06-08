<div align="center">
  <h1>📰 NewsHub</h1>
  <p><strong>A full-stack news & blog platform with bilingual support, admin dashboard, and TRP analytics</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Astro-5.x-FF5D01?logo=astro" alt="Astro">
    <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react" alt="React">
    <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express" alt="Express">
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb" alt="MongoDB">
    <img src="https://img.shields.io/badge/MUI-5.x-007FFF?logo=mui" alt="MUI">
  </p>
</div>

---

## ✨ Features

### For Readers
- **Browse news** — Paginated grid with category filter and sort (newest, oldest, most viewed, most liked)
- **Search** — Full-text search by title, tags, and category
- **News detail** — Full article view with author info, related news, and comments
- **Rate & like** — 5-star rating system and heart-based likes
- **Comments** — Authenticated users can comment and delete their own comments
- **Bilingual** — Full English/Hindi UI toggle
- **Dark/Light theme** — Smooth animated theme toggle
- **TRP dashboard** — Trending score analytics and rankings
- **Local news** — Filter by user location/region

### For Contributors
- **Submit news** — Write and submit articles for admin approval
- **Profile management** — Avatar upload, bio, location, notification preferences
- **My submissions** — Track the status of submitted articles

### For Admins
- **Dashboard** — Stats (users, news, views, trending) and trending posts table
- **Pending approval** — Review and approve/reject user submissions
- **User management** — Paginated user table, password reset, delete users
- **News CRUD** — Full control with edit/create dialogs and stats override
- **Ad management** — Create/delete advertisements with click tracking

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Astro 5, React 18, React Router 6, Material UI 5, TailwindCSS 3, Framer Motion 11 |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB with Mongoose 8 |
| **Auth** | JWT (7-day expiry) + bcrypt (12 rounds) |
| **Uploads** | Multer (profile & news images, max 5MB) |

---

## 📁 Project Structure

```
NewsHub/
├── astro-client/          # Primary frontend (Astro + React)
│   ├── src/
│   │   ├── components/    # React components (Header, Footer, NewsCard, etc.)
│   │   ├── stores/        # Context providers (Theme, Data, Language)
│   │   ├── lib/api.js     # Axios API client
│   │   ├── pages/         # Astro pages
│   │   └── App.jsx        # Route definitions
│   └── astro.config.mjs
├── server/                # Backend API (Express + MongoDB)
│   ├── models/            # Mongoose schemas (User, News, Comment, Ad)
│   ├── routes/            # API routes (auth, news, users, comments, etc.)
│   ├── middleware/         # JWT protect + adminOnly
│   ├── seed.js            # Database seeder (40+ articles)
│   └── server.js          # Entry point
├── client/                # Legacy Vite-based frontend (alternative)
├── .gitignore
├── package-lock.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone & install
```bash
git clone <your-repo-url>
cd NewsHub

# Backend
cd server && npm install

# Frontend
cd ../astro-client && npm install
```

### 2. Configure environment
```bash
# server/.env (already has defaults for local dev)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/newshub
JWT_SECRET=change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Seed the database (recommended)
```bash
cd server
npm run seed
```
Populates 40+ articles, 6 users, comments, and advertisements.

### 4. Start servers
```bash
# Terminal 1 — Backend
cd server && npm run dev     # → localhost:5000

# Terminal 2 — Frontend
cd astro-client && npm run dev  # → localhost:4321
```

Open **http://localhost:4321** — the Astro dev server proxies `/api` to the backend.

### Default accounts (after seeding)
| Username | Email | Password | Role |
|---|---|---|---|
| admin | admin@example.com | Admin@123 | Admin |
| johnsmith | john@techworld.com | User123! | User |
| sarahwilson | sarah@sportsfan.com | User123! | User |

---

## 📡 API Overview

| Base | Endpoints |
|---|---|
| `/api/auth` | register, login, logout, get-me |
| `/api/news` | CRUD, top, recent, local, trp, pending, submit, approve/reject, like, rate |
| `/api/users` | list, profile, stats, liked, password-reset |
| `/api/comments/:newsId` | get, create, delete |
| `/api/upload` | profile image, news image |
| `/api/ads` | CRUD, click tracking |
| `/api/feedback` | submit |
| `/api/health` | health check |

---

## 🏗 Production Build

```bash
cd astro-client
npm run build        # → astro-client/dist/
```

Deploy `astro-client/dist/` to any static host (Vercel, Netlify, Cloudflare Pages, Nginx) and `server/` to a Node.js host (Railway, Render, Fly.io, VPS). Use **MongoDB Atlas** for the database.

---

## 📄 License

[MIT](LICENSE)
