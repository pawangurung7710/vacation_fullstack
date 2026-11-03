# Backend Architecture & System Documentation

Welcome to the backend technical documentation for **The Trekkers Squad** platform.

This document outlines the system architecture, request lifecycle, core business modules, database design, API conventions, and operational workflows.

---

## 1. System Overview

The Trekkers Squad Backend is a production-grade RESTful API built on **Node.js (ES Modules)**, **Express**, and **MongoDB (Mongoose)**. It acts as the operational brain of the platform, powering two primary clients:
1. **The Public Customer Portal**: Trip discovery, search and multi-facet filtering, availability calendars, checkout flow, equipment rentals, booking confirmations with QR verification, and contact submissions.
2. **The Back-Office CMS (Admin Panel)**: Comprehensive catalogue management (categories, countries, regions, trips, itineraries, pricing), gear rental management, booking reservations, blog engine, media assets, team profiles, and platform configuration.

---

## 2. Technology Stack

- **Runtime**: Node.js (v20+)
- **Module System**: ECMAScript Modules (`"type": "module"`)
- **Web Framework**: Express 4.x
- **Database & ODM**: MongoDB 7.x with Mongoose
- **Input Validation**: Zod (`zod`)
- **Security & Headers**: Helmet, CORS, Express Rate Limit, bcryptjs, jsonwebtoken (JWT)
- **Performance & Compression**: Compression (gzip/deflate), HTTP Cache-Control with `stale-while-revalidate`, In-memory route response caching
- **File Uploads**: Multer with static asset serving

---

## 3. Architecture & Request Lifecycle

The application enforces a **strict one-way layered architecture**:

```
Client HTTP Request
      │
      ▼
┌────────────────────────────────────────────────────────┐
│  Global Middlewares                                    │
│  ├── Trust Proxy & Gzip Compression                    │
│  ├── Helmet (Security Headers & CORP)                  │
│  ├── CORS Whitelist Validation                         │
│  ├── Express JSON & URL-Encoded Parsers                │
│  ├── API Rate Limiter (IP-based throttling)            │
│  └── Edge Cache-Control Headers (stale-while-revalidate)
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│  Routes Layer (`src/routes/`)                          │
│  ├── Route Mapping & Route-level Caching               │
│  ├── Authentication (`authenticate`, `optionalAuth`)   │
│  ├── Authorization (`authorizeRoles(['admin'])`)       │
│  └── Request Validation (`validate(zodSchema)`)        │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│  Controllers Layer (`src/controllers/`)                │
│  ├── Extracts validated query, params, body            │
│  ├── Calls Service methods                             │
│  └── Formats standard HTTP responses (sendSuccess/sendError)
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│  Services Layer (`src/services/`)                      │
│  ├── Core Business Logic & Calculations                │
│  ├── Mongoose Queries (.lean(), field projection)      │
│  └── External Services & File Management               │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│  Data Layer (`src/models/` + MongoDB)                  │
│  ├── Schema definitions, field validations             │
│  ├── Lifecycle hooks (bcrypt pre-save, toJSON)         │
│  └── Strategic collection indexes                      │
└────────────────────────────────────────────────────────┘
```

---

## 4. Core Functional Modules

### 4.1 Catalogue & Trips Engine (`trip.service.js`, `category.service.js`, etc.)
- **Hierarchy**: `Category` $\rightarrow$ `Subcategory` $\rightarrow$ `Country` $\rightarrow$ `Region` $\rightarrow$ `Trip`.
- **Trips**: Holds itineraries, difficulty levels, group limits, inclusions/exclusions, guide assignments, sustainability badges, and pricing.
- **Departures**: Supports both explicit calendar departures and dynamic recurrence rules (expanding automatically up to 24 months).
- **Listing Optimization**: Listing endpoints exclude heavy fields (`TRIP_LIST_EXCLUDED_FIELDS`) to reduce network payloads by ~96%.

### 4.2 Bookings & Checkout (`booking.service.js`)
- **Lifecycle**: `pending` $\rightarrow$ `confirmed` $\rightarrow$ `completed` (or `cancelled`).
- **Capacity Management**: Validates passenger seat availability against trip departure caps before confirming.
- **QR Code Verification**: Generates signed cryptographic QR verification payloads allowing trip organizers to scan and validate passenger tickets on-site.

### 4.3 Equipment Rentals (`rentalProduct.service.js`, `rentalOrder.service.js`)
- Manages gear categories (e.g., Tents, Backpacks, Tech) and inventory products.
- Processes standalone or add-on rental orders with date-range rental pricing.

### 4.4 Authentication & Identity (`auth.service.js`)
- Dual-token system:
  - Short-lived Access Token (`15m`) for authorization headers.
  - Refresh Token (`7d`) stored for session renewal.
- Passwords salted and hashed with `bcryptjs`.
- Sensitive fields automatically omitted via `User.prototype.toJSON()`.

### 4.5 Content Management (CMS)
- Dynamic modules for Blog Posts, FAQ accordions, Testimonials, Team Profiles, Sustainability & Donut Economics vision statements, and Homepage configuration.

---

## 5. API Design & Conventions

### 5.1 Standard Response Envelopes
All responses conform to a predictable envelope:

```json
// Success
{
  "success": true,
  "message": "Trips retrieved successfully",
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2400,
      "pages": 240
    }
  }
}

// Error
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "body.price", "message": "Price must be greater than 0" }
  ]
}
```

### 5.2 Key Route Endpoints

| Area | Route | Methods | Access | Description |
| :--- | :--- | :---: | :---: | :--- |
| **Auth** | `/api/v1/auth/login` | `POST` | Public | Authenticate user or admin |
| **Auth** | `/api/v1/auth/me` | `GET` | Private | Retrieve current user profile |
| **Trips** | `/api/v1/trips` | `GET` | Public | Paginated list with filtering |
| **Trips** | `/api/v1/trips/:slug` | `GET` | Public | Full trip detail with itinerary |
| **Trips** | `/api/v1/trips` | `POST` | Admin | Create new trip |
| **Bookings**| `/api/v1/bookings` | `POST` | Public/User | Create booking reservation |
| **Bookings**| `/api/v1/bookings/:id` | `GET` | Private/Admin | Get booking ticket & details |
| **Rentals** | `/api/v1/rental-products`| `GET` | Public | Browse rental equipment |
| **Rentals** | `/api/v1/rental-orders` | `POST` | Public/User | Place gear rental order |
| **CMS** | `/api/v1/admin/blogs` | `ALL` | Admin | Full blog management |
| **Settings**| `/api/v1/settings` | `GET`, `PUT` | Public/Admin | Maintenance & global config |

---

## 6. Directory Layout

```
backend/
├── src/
│   ├── config/             # DB connection and environment constants
│   ├── controllers/        # Thin HTTP controllers
│   ├── data/               # Seed catalog JSON, portraits, FAQs, team data
│   ├── middlewares/        # Auth, CORS, cache, error, and rate-limiting
│   ├── models/             # Mongoose schemas (Trip, User, Booking, etc.)
│   ├── routes/             # Express route declarations
│   ├── scripts/            # Diagnostic scripts (perf-check.js)
│   ├── seeds/              # Database seeders (clean, bulk, users, rentals)
│   ├── services/           # Core domain and business logic
│   ├── utils/              # Response formatting, slugify, token utilities
│   ├── validators/         # Zod validation schemas
│   ├── app.js              # Express app configuration & middleware pipeline
│   └── server.js           # Server bootstrap and port listener
├── uploads/                # Local storage for user-uploaded media
├── docs/                   # System and architecture documentation
├── .env                    # Local environment variables
└── package.json            # Node.js dependencies and scripts
```

---

## 7. Useful Scripts & Operational Commands

From the `backend/` directory:

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts server with auto-restart (`--watch-path=src`) |
| `npm start` | Production startup with Node.js |
| `npm run seed:all` | Resets and fully reseeds the demo database |
| `npm run perf:check` | Analyzes MongoDB index usage and execution stats |

