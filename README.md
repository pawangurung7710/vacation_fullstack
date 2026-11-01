# The Trekkers Squad

A full-stack website template for a trekking and adventure travel company.

- **Public site**: browse trips, filter and search, read the blog and reviews, book a trip, rent gear.
- **Admin CMS**: manage trips, bookings, categories, team, blog, testimonials, FAQs, homepage content and more.

| Part     | Stack                                                        | Folder      |
| -------- | ------------------------------------------------------------ | ----------- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS 4, Radix UI         | `frontend/` |
| Backend  | Node.js, Express, MongoDB (Mongoose), JWT authentication     | `backend/`  |
| Database | MongoDB 7 (run locally with Docker)                          |             |

---

## 1. Before you start (requirements)

Install these first:

| Tool            | Version | Check with        | Get it                              |
| --------------- | ------- | ----------------- | ----------------------------------- |
| Node.js         | 20+     | `node -v`         | https://nodejs.org                  |
| npm             | 10+     | `npm -v`          | comes with Node.js                  |
| Docker Desktop  | recent  | `docker --version`| https://www.docker.com/products/docker-desktop |
| Git             | any     | `git --version`   | https://git-scm.com                 |

Make sure Docker Desktop is **running** (the whale icon is visible) before step 3.

Ports used: `27017` (MongoDB), `5001` (backend API), `5173` (frontend).
On macOS, port 5000 is taken by AirPlay, which is why the backend uses 5001.

---

## 2. Get the code

```bash
git clone https://github.com/gauravshresthh/thetrekkerssquad.git
cd thetrekkerssquad
```

---

## 3. Start the database (Docker)

```bash
docker run -d --name trekkers-mongo -p 27017:27017 -v trekkers_mongo_data:/data/db mongo:7
```

Useful follow-ups:

```bash
docker ps                      # confirm trekkers-mongo is running
docker stop trekkers-mongo     # stop it
docker start trekkers-mongo    # start it again (data is kept in the volume)
```

If you already have MongoDB on port 27017, map a different host port (for example `-p 27018:27017`) and use that port in `MONGO_URI` below.

---

## 4. Set up and run the backend

```bash
cd backend
cp env.example .env
npm install
```

Open `backend/.env` and check these values (the defaults work for local development):

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/trekkers-squad
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@trekkerssquad.example
ADMIN_PASSWORD=admin123456
```

Email (`GMAIL_*`, `SMTP_*`) is optional locally. Booking and contact emails only send when it is configured.

### Seed the database

Seeding fills the empty database with a large demo catalogue so the site looks like a big, busy marketplace. Run this from `backend/`:

```bash
npm run seed:all
```

`seed:all` runs these in order and finishes in under a minute:

| Step                | Command             | What it creates                                                    |
| ------------------- | ------------------- | ------------------------------------------------------------------ |
| 1. Clean            | `seed:clean`        | Drops the whole database                                           |
| 2. Users            | `seed:users`        | The admin account and a test user                                  |
| 3. Catalogue        | `seed:bulk`         | 6 categories, 48 sub-categories, 41 countries, 200 regions, 2,400 trips, 36 guides, 900 reviews, 150+ blog posts |
| 4. Team             | `seed:team`         | The "Meet the team" profiles                                       |
| 5. FAQs             | `seed:faqs`         | FAQ categories and questions                                       |
| 6. Rentals          | `seed:rentals`      | Rental categories and gear                                         |
| 7. Add-ons          | `seed:add-ons`      | Optional extras offered at checkout                                |

Warning: `seed:all` and `seed:clean` delete everything in the database. Never run them against a real one.

Make the catalogue bigger or smaller (the output is deterministic, so you get the same data every time):

```bash
BULK_TRIPS=5000 BULK_TESTIMONIALS=2000 BULK_BLOG=300 npm run seed:bulk
```

`seed:bulk` skips anything that already exists, so it is safe to re-run. Edit the categories, countries, regions and text it uses in `backend/src/data/catalog.js`, and the image pools in `backend/src/data/imagePools.json`.

### Start the API

```bash
npm run dev
```

The API runs at `http://localhost:5001/api/v1`. Quick check:

```bash
curl http://localhost:5001/api/v1/trips
```

Leave this terminal running.

---

## 5. Set up and run the frontend

Open a **second terminal**:

```bash
cd frontend
cp .env.example .env.local      # sets VITE_API_URL=http://localhost:5001/api/v1
npm install
npm run dev
```

The site runs at **http://localhost:5173**.

---

## 6. Admin CMS login

| What            | Value                                     |
| --------------- | ----------------------------------------- |
| CMS login page  | http://localhost:5173/cms                 |
| CMS dashboard   | http://localhost:5173/cms/dashboard (after login) |
| Forgot password | http://localhost:5173/cms/forgot-password |
| Admin email     | `admin@trekkerssquad.example`             |
| Admin password  | `admin123456`                             |

The admin account is created by `npm run seed:users` (or `seed:all`) from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. Change both before you deploy anywhere public.

A normal test user is also seeded: `user@trekkerssquad.example` / `user123456`.

---

## 7. Everyday commands

| Where       | Command                | What it does                      |
| ----------- | ---------------------- | --------------------------------- |
| `backend/`  | `npm run dev`          | API with auto-restart             |
| `backend/`  | `npm start`            | API for production                |
| `backend/`  | `npm run seed:all`     | Reset and reseed the demo data    |
| `frontend/` | `npm run dev`          | Dev server on port 5173           |
| `frontend/` | `npm run build`        | Production build into `dist/`     |

## 8. Troubleshooting

- **`ECONNREFUSED` or "MongoDB connection error"**: Docker is not running, or `MONGO_URI` has the wrong port. Run `docker ps`.
- **`EADDRINUSE` on port 5001**: something else uses it. Change `PORT` in `backend/.env` and `VITE_API_URL` in `frontend/.env.local` to match.
- **Site loads but has no trips**: you have not seeded yet, or the frontend points at the wrong API URL. Restart `npm run dev` after editing `.env.local`.
- **CORS error in the browser console**: `FRONTEND_URL` in `backend/.env` must match the URL you open the site on.
- **Login fails**: run `npm run seed:users` again, then use the credentials above.

---

## 9. Make it yours

| What                | Where                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| Brand name, SEO     | `frontend/index.html`, `frontend/src/app/config/seo.ts`                 |
| Colours and fonts   | `frontend/src/styles/design-tokens.css` and `theme.css` (`--color-forest-*`, `--color-navy-*`, `--color-sun-*`) |
| Logo and favicon    | `frontend/src/assets/trekkers-logo.png`, `frontend/public/logo.svg`, `frontend/favicon.ico` |
| Homepage content    | `frontend/src/app/data/homepage-content.json` (also editable in the CMS) |
| Contact details     | `frontend/src/app/components/footer.tsx`, `frontend/src/app/pages/contact-page.tsx` |
| Demo catalogue      | `backend/src/data/catalog.js` (categories, countries, text) and `backend/src/seeds/bulk.seed.js` |
| Allowed origins     | `allowedOrigins` in `backend/src/app.js`, plus `FRONTEND_URL`           |

All names, emails, phone numbers and domains in this repo are placeholders (`trekkerssquad.example`). Replace them with your own. Demo photos are Unsplash links.

## 10. Project layout

```
backend/
  src/
    controllers/ routes/ services/ models/ validators/ middlewares/
    seeds/        # database seeders (npm run seed:*)
    data/         # demo content used by the seeders
  uploads/        # files uploaded through the CMS
frontend/
  src/app/
    pages/        # public pages
    cms/          # admin CMS
    components/   # shared UI (ui/ holds the Radix-based primitives)
    services/api.ts   # API client
```

## 11. Deploying

- **Frontend**: `npm run build`, then serve `frontend/dist` from any static host. Set `VITE_API_URL` at build time. `frontend/vercel.json` already has cache and security headers.
- **Backend**: run `npm start` behind a reverse proxy with HTTPS. Set production values for every variable in `backend/env.example`, in particular `JWT_SECRET`, `JWT_REFRESH_SECRET`, `BOOKING_QR_SECRET`, `ADMIN_PASSWORD` and a managed `MONGO_URI`.

## Licence

Add your own licence before distributing.
