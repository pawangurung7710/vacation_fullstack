# Backend Coding Standards & Architecture Guide

This document defines the strict engineering standards, architectural boundaries, and conventions for the **Node.js / Express / MongoDB** backend of **The Trekkers Squad**.

All future backend features, bug fixes, and AI-assisted code additions ("vibe coding") must strictly follow these rules.

---

## 1. Architectural Layers & Separation of Concerns

The backend follows a strict one-way layered architecture:

$$\text{Routes} \longrightarrow \text{Middlewares} \longrightarrow \text{Validators} \longrightarrow \text{Controllers} \longrightarrow \text{Services} \longrightarrow \text{Models}$$

### Layer Responsibilities

| Layer & Directory | Purpose | Rules & Constraints |
| :--- | :--- | :--- |
| **`src/routes/`** | Endpoint routing and HTTP verb definitions. | - Attach route paths, middlewares, and validators.<br>- **Zero business logic** and **zero database queries**. |
| **`src/middlewares/`** | Cross-cutting request processing (auth, rate limiting, error catching). | - Must be reusable and general-purpose.<br>- Never contain domain-specific business rules. |
| **`src/validators/`** | Request input schemas using **Zod**. | - Validate `req.body`, `req.query`, and `req.params`.<br>- Keep pure; no DB lookups inside schemas. |
| **`src/controllers/`** | HTTP request/response orchestrator. | - Extract validated input from `req`.<br>- Call one or more service methods.<br>- Send HTTP response via standard helper.<br>- **Never call Mongoose models directly**. |
| **`src/services/`** | **Core domain & business logic**. | - All database operations (`Model.find()`, etc.).<br>- Calculations, data aggregation, transactions.<br>- **Never access `req` or `res` objects**. |
| **`src/models/`** | Mongoose schemas, indexes, and document methods. | - Schema definitions, data normalization, pre/post hooks, and toJSON overrides.<br>- Define business queries in services, not here. |
| **`src/utils/`** | Stateless utility helpers. | - Slug generators, response formatters, date math.<br>- Must be pure functions without side effects. |

---

## 2. Controllers & HTTP Response Standards

### 2.1 Standardized Response Format
Never use `res.json({...})` or `res.status(...).send(...)` directly in controllers. Always use the standard response helpers in `src/utils/response.js`:

```javascript
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';

// Success (200 OK)
return sendSuccess(res, 'Trips retrieved successfully', trips, { pagination });

// Created (201 Created)
return sendCreated(res, 'Trip created successfully', newTrip);

// Client Error (4xx)
return sendError(res, 404, 'Trip not found');
```

### 2.2 Error Handling & Next Delegation
Every controller function must be wrapped in `try / catch` and pass unhandled errors to `next(error)`:

```javascript
export const getTripBySlug = async (req, res, next) => {
  try {
    const trip = await tripService.getTripBySlug(req.params.slug);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }
    return sendSuccess(res, 'Trip retrieved successfully', trip);
  } catch (error) {
    next(error);
  }
};
```

---

## 3. Request Validation with Zod

Every POST, PUT, PATCH endpoint and every endpoint accepting query/path parameters must be validated using a **Zod** schema and the `validate` middleware (`src/middlewares/validate.middleware.js`).

### Example Validator Pattern (`src/validators/trip.validator.js`):
```javascript
import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    price: z.number().positive('Price must be greater than 0'),
    difficulty: z.enum(['easy', 'moderate', 'challenging', 'expert']),
    regionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Region ID'),
  }),
});
```

### Route Binding:
```javascript
import { validate } from '../middlewares/validate.middleware.js';
import { createTripSchema } from '../validators/trip.validator.js';
import * as tripController from '../controllers/trip.controller.js';

router.post(
  '/',
  authenticate,
  authorizeRoles(['admin']),
  validate(createTripSchema),
  tripController.createTrip
);
```

---

## 4. Database & Query Performance (Mongoose & MongoDB)

### 4.1 Mandatory Pagination
Never run an unbounded `.find()` on public list endpoints. All list services must accept and enforce pagination:
- Default `limit`: 10 (or 20 for grid views), max `limit`: 100.
- Return metadata: `{ page, limit, total, pages }`.

### 4.2 Strip Heavy Fields from List Endpoints (`.select()`)
Heavy fields (`itinerary`, `faqs`, `beforeYouBook`, `tripNotes`, long descriptions, full gallery arrays) must be stripped from list queries. 
Follow the `TRIP_LIST_EXCLUDED_FIELDS` pattern:

```javascript
const TRIP_LIST_EXCLUDED_FIELDS = [
  '__v',
  'itinerary',
  'faqs',
  'beforeYouBook',
  'accommodationAndMeals',
  'comfortAddOns',
  'tripNotes',
  'highlightGallery',
]
  .map((field) => `-${field}`)
  .join(' ');

// In service:
const trips = await Trip.find(query)
  .select(TRIP_LIST_EXCLUDED_FIELDS)
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();
```
*Result: Reduces typical list response payloads from ~500KB down to ~15-20KB.*

### 4.3 Use `.lean()` for Read-Only Queries
Always append `.lean()` to query chains when the returned documents are read-only and do not require Mongoose document methods or save hooks.

### 4.4 Clean Indexing & Avoid Duplicate Index Warnings
- Index foreign keys (`categoryId`, `regionId`, `countryId`) and query filters (`status`, `slug`, `createdAt`).
- **Never define duplicate indexes**: If a field has `unique: true` or `index: true` inside the schema field definition, do **not** also call `schema.index({ fieldName: 1 })`.

---

## 5. Security & Authentication Standards

1. **Passwords**:
   - Always hash passwords using `bcryptjs` with at least 10 salt rounds in a `pre('save')` hook.
   - Never store or log plaintext passwords.
2. **Data Sanitization**:
   - Always define a `toJSON()` method on user-related schemas to delete `passwordHash`, `resetPasswordToken`, and other sensitive tokens before serialization:
   ```javascript
   userSchema.methods.toJSON = function () {
     const obj = this.toObject();
     delete obj.passwordHash;
     delete obj.resetPasswordToken;
     delete obj.resetPasswordExpires;
     return obj;
   };
   ```
3. **Role Authorization**:
   - Guard administrative routes with `authenticate` followed by `authorizeRoles(['admin'])`.
4. **JWT Security**:
   - Keep access token lifetimes short (`15m`). Use refresh tokens (`7d`) for session renewal.
   - Do not store sensitive secrets or credentials inside JWT payloads.

---

## 6. Development Workflow & Seed Determinism

1. **Auto-Restart Dev Command**:
   - The backend runs via `npm run dev`.
   - The script uses `node --watch-path=src src/server.js` so edits inside `src/` trigger restarts without scanning `node_modules`.
2. **Seed Determinism**:
   - When adding new seeders, ensure they are deterministic. Running `npm run seed:all` should generate predictable IDs and records across development machines.

