# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Next.js version warning

This project runs **Next.js 16.4 / React 19.3** — newer than most training data. APIs and conventions may differ (e.g. route `params` is a `Promise` and must be awaited). Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app/` covers the App Router) and heed deprecation notices.

## Commands

- `npm run dev` — dev server (Turbopack) on http://localhost:3000
- `npm run build` — production build (also the main type-check)
- `npm run start` — serve the production build
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`, Next core-web-vitals + TypeScript rules)

There is no test framework configured.

## Environment

`.env` needs:
- `MONGODB_URI` — required; `lib/mongodb.ts` throws at import time if it's missing.
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` — Microsoft Clarity analytics (`Components/Clarity.tsx`, mounted in the root layout).
- `NEXT_PUBLIC_API_URL` — external product backend; defaults to `http://localhost:4001` when unset.

## Architecture

Marketing/e-commerce site for Alpha Male (men's wellness brand). Two separate data sources:

1. **External product API** (`NEXT_PUBLIC_API_URL`, a separate backend service, not in this repo). Fetched directly with `fetch(..., { cache: "no-store" })` from:
   - `Components/Home/Homepage.tsx` (async server component) → `GET /product?page=1&limit=12`
   - `Components/Home/FeaturedProducts.tsx` (client component) → `GET /product/hero`
   - `app/products/[id]/page.tsx` → `GET /product/info/:id` (404 or `!isActive` → `notFound()`)

   Response shape is the `Product` interface in `types/product.ts`.

2. **Local MongoDB via Mongoose** — used only by this app's own API routes for lead capture:
   - `app/api/subscribe/route.ts` → `models/Subscription.ts`
   - `app/api/early-access/route.ts` → `models/EarlyAccess.ts`

   Routes call `connectDB()` from `lib/mongodb.ts` (connection cached on `globalThis` to survive hot reload) and return `{ success, message }` JSON with appropriate status codes.

### Routes

- `/` (`app/page.tsx`) — the "launching soon" page: a large client component with the email-subscribe and early-access forms.
- `/home` (`app/home/page.tsx`) — the new full storefront homepage, assembled in `Components/Home/Homepage.tsx` (NavBar, Banner, ProductShowcase, FeaturedProducts, ImageComparison, TrustSection, FAQ, Footer). This is under active development on `feature/website-page`.
- `/products/[id]` — product detail page, rendered by `Components/Product/ProductBuySection.tsx`.
- `/policies/*` — static policy pages.
- `app/products/page.tsx` is currently empty; `app/test/` is a scratch page.

### Conventions

- Components live in `Components/` (capital C) and are imported via the `@/*` alias mapped to the repo root (e.g. `@/Components/Faqs`, `@/lib/mongodb`).
- Styling is Tailwind CSS v4, wired through Turbopack via a `@tailwindcss/turbopack` loader rule in `next.config.ts` (there's no PostCSS config). Theme tokens are in `app/globals.css` under `@theme` (`font-heading` = Cinzel, `font-body` = Montserrat, loaded via `next/font/google` in `app/layout.tsx`). Brand colors: background `#161f33`, text `#d5d5d7`.
- `app/fonts.css` defines custom classes such as `.silver-text`, but its `@import` in `globals.css` is commented out, so those classes currently have no effect even though `app/page.tsx` and several `Components/` files use them. Define new shared styles in `globals.css`.
- The product API base URL (`NEXT_PUBLIC_API_URL || "http://localhost:4001"`) is redeclared in each of the three fetching files; there's no shared API client.
- Icons come from `lucide-react`.
- `next.config.ts` sets `allowedDevOrigins` for LAN-device testing; add an IP there to reach the dev server from another device.
