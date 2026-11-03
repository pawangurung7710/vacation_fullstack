# The Trekkers Squad - Coding Standards Hub

This repository maintains dedicated, in-depth coding standards for both the backend and frontend to ensure consistent architecture, security, performance, and code quality across features and AI-assisted "vibe coding".

---

## 📁 Detailed Standards by Workspace

- ### 🛠️ [Backend Coding Standards](./backend/CODING_STANDARDS.md)
  *Stack: Node.js (ES Modules), Express, MongoDB (Mongoose), Zod, JWT*
  - **Layer Flow**: `routes -> middlewares -> validators -> controllers -> services -> models`
  - **Validation**: Enforcing Zod schemas for all endpoints
  - **Performance**: Pagination, `.select()` exclusion on list queries, `.lean()` usage
  - **Security**: Password hashing with `bcryptjs`, sanitized `toJSON()`, role authorization

- ### 🎨 [Frontend Coding Standards](./frontend/CODING_STANDARDS.md)
  *Stack: React 18, Vite, TypeScript, Tailwind CSS 4, Radix UI*
  - **Structure**: Separation of pages, domain components, and headless UI primitives
  - **TypeScript**: Strict typing (no `any`), React Hook Form + Zod resolvers
  - **Performance**: Dynamic route code-splitting via `React.lazy()` and `<Suspense>`
  - **Media Pipeline**: Responsive image sizing (`resolveMediaUrl`, `mediaSrcSet`)
  - **UI States**: Enforcing Loading, Empty, Error, and Success states

---

## 🤖 AI & Vibe Coding Assistant Rules

For AI tools (Cursor, Antigravity, GitHub Copilot, Windsurf), review the root rules file:
- **[.cursorrules](./.cursorrules)**

### Key Rules for Every Contribution:
1. **Never bypass layer boundaries** (e.g. no DB queries in controllers or raw fetch in UI components).
2. **Never push broken builds**: Always verify `npm run build` in `frontend/` runs with 0 errors.
3. **Preserve existing documentation**: Do not strip existing architectural comments or JSDoc blocks.
