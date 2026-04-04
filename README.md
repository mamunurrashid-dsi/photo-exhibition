# Photo Exhibition Platform

A full-stack web application for creating and managing photography exhibitions — both online (photo submission + gallery) and offline (event listings). Built with React + Vite, Node.js/Express, MongoDB Atlas, and Cloudinary.

---

## Features

- **Online exhibitions** — organizers publish a call for photos; participants submit their work via a public or private link
- **Offline exhibitions** — venue and date listings for physical events
- **Photo submission pipeline** — submitters upload photos from phone or PC; organizer approves or rejects each submission before photos appear in the gallery
- **Private exhibitions** — accessible only via a unique link; optional email domain restriction (e.g. only `@company.com`)
- **Gallery** — approved photos displayed in a category-filtered grid with full-screen lightbox
- **Organizer dashboard** — manage your exhibitions and review submissions
- **Admin panel** — site-wide user, exhibition, and photo moderation
- **Authentication** — email/password with email verification + Google OAuth
- **Resource limits** — max 5 online exhibitions per organizer, max 100 photos per exhibition (configurable)
- **Mobile-first** — all pages and file uploads work on both smartphone and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS v4, React Router v6 |
| Backend | Node.js, Express, ES Modules |
| Database | MongoDB Atlas M0 (free), Mongoose |
| File storage | Cloudinary (free tier), multer-storage-cloudinary |
| Auth | JWT, Passport.js, Google OAuth 2.0 |
| Email | Nodemailer + Gmail SMTP |
| Deployment | Vercel (frontend), Railway (backend) |

---

## Project Structure

```
PhotoExhibition/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios API helpers
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Route-level page components
│   │   ├── routes/          # AppRouter, ProtectedRoute, RoleRoute
│   │   └── utils/           # Date formatting, validation helpers
│   ├── vite.config.js       # Dev proxy → localhost:5000
│   └── vercel.json          # SPA rewrite rule for Vercel
│
└── server/                  # Express backend
    ├── src/
    │   ├── config/          # DB, Cloudinary, Passport, limits
    │   ├── controllers/     # Route handlers
    │   ├── middleware/      # Auth, role, upload, error handler
    │   ├── models/          # Mongoose schemas
    │   ├── routes/          # Express routers
    │   └── services/        # Email, Cloudinary helpers
    ├── app.js               # Express app setup
    └── server.js            # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (free M0 cluster)
- Cloudinary account (free)
- Google Cloud Console project (for OAuth)
- Gmail account with an App Password

### 1. Clone the repository

```bash
git clone git@github.com:mamunurrashid-dsi/photo-exhibition.git
cd photo-exhibition
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)
npm run dev
```

### 3. Set up the client

```bash
cd client
npm install
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL if not using the default proxy
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`.

---

## Environment Variables

### `server/.env`

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/photo_exhibition

JWT_SECRET=<64-char random hex>
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=<your Google client ID>
GOOGLE_CLIENT_SECRET=<your Google client secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

CLOUDINARY_CLOUD_NAME=<cloud name>
CLOUDINARY_API_KEY=<api key>
CLOUDINARY_API_SECRET=<api secret>

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<gmail address>
EMAIL_PASS=<gmail app password>
EMAIL_FROM="PhotoExhibition <noreply@yourdomain.com>"

SESSION_SECRET=<random secret>
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_OAUTH_REDIRECT=http://localhost:5000/api/auth/google
```

---

## Configurable Limits

Edit `server/src/config/limits.js` to adjust free-tier resource limits:

```js
export const LIMITS = {
  MAX_ONLINE_EXHIBITIONS_PER_ORGANIZER: 5,
  MAX_PHOTOS_PER_EXHIBITION: 100,
}
```

---

## API Overview

| Group | Base path | Description |
|---|---|---|
| Auth | `/api/auth` | Register, login, verify email, OAuth, password reset |
| Exhibitions | `/api/exhibitions` | CRUD, gallery, private access |
| Submissions | `/api/submissions` | Submit photos, approve/reject, duplicate check |
| Admin | `/api/admin` | User/exhibition/photo management |

---

## Deployment

### Frontend — Vercel

1. Connect the `client/` directory as the Vercel project root
2. Set `VITE_API_BASE_URL` to your Railway backend URL in Vercel environment variables
3. The `vercel.json` SPA rewrite rule is already included

### Backend — Railway

1. Connect the `server/` directory as the Railway service root
2. Set all `server/.env` variables in the Railway dashboard
3. Update `GOOGLE_CALLBACK_URL` and `CLIENT_URL` to your production URLs
4. Update the allowed origin in Google Cloud Console

---

## License

MIT