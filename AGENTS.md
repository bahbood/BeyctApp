<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ManaMode — base-web-app-nextjs

## Architecture

- **Framework**: Next.js 16 (App Router). Middleware is now called **Proxy** (`proxy.ts` at root) — read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` before touching it.
- **DB**: PostgreSQL + Drizzle ORM. Schema in `app/db/schema/index.ts`, connection in `app/db/index.ts`.
- **Auth**: JWT sessions via `jose`, stored in `session` cookie. Session expirations: `admin`/`storeAdmin` → 30 min, `user` → 7 days. See `app/(Auth)/lib/session.ts`.
- **CAPTCHA**: Server action using `sharp` + in-memory `Map` (one-time use, 2 min expiry). NOT production-ready; swap with Redis for deployment. `app/components/(captchCMP)/action/createCaptchaImageAction.ts`.
- **Route groups**: `(Auth)` (login/logout/profile), `(bazar)` (storefront), `(slides)` (slide management).
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`), `@tailwindcss/postcss` plugin.
- **PWA**: Service worker at `public/sw.js`, registered via `app/lib/serviceWorker.ts`.
- **RTL**: Persian/Farsi content. Layout has `dir="rtl"`, Vazirmatn font via `next/font/local`.

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migration |
| `npm run db:push` | Push schema to DB directly |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Drizzle Studio GUI |
| `npm run db:addSeed` | Run `app/db/seed.ts` via tsx |
| `npm run db:check` | Drizzle check |

Ordered workflow: `db:generate` → `db:migrate` (or `db:push` for dev).

## Conventions

- **Path alias**: `@/*` maps to project root. Always use `@/app/...` for imports.
- **Server actions**: Files use `'use server'` directive. Auth actions live in `app/(Auth)/components/action/`.
- **DB triggers**: Raw SQL in `app/db/triggers.ts` — creates `update_updated_at_column()` function and `sync_products_outofaccess` trigger.
- **Slide images**: Stored in `public/slideImages/`. Only `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` allowed, max 5 MB.
- **Seed data**: `npm run db:addSeed` — inserts admin user (`admin`/`123456`) and sample slides.
- **No test framework** detected — no `jest`, `vitest`, or `playwright` in dependencies.
