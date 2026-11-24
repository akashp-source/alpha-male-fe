<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Brand guidelines (required before any UI change)

**Before changing the UI or adding anything to it, read [`BRAND_GUIDELINES.md`](BRAND_GUIDELINES.md) in full and follow it.** This applies to every change that affects how the site looks: new pages, new components, and edits to existing components, styles, images or copy.

- `BRAND_GUIDELINES.md` is the single source of truth for the logo, colour palette, typography, colour/font tokens, the heading rule, contrast requirements and the pending accent colours. Don't rely on memory or on colours you see in existing code.
- Use the design tokens defined in `app/globals.css` (e.g. `bg-brand-navy`, `text-palladium`, `font-heading`). Don't hard-code hex values or add new fonts.
- Before finishing, run through the checklist at the end of `BRAND_GUIDELINES.md`.
- If a change can't follow the guidelines (for example a contrast failure, or a colour that isn't in the palette), say so explicitly and explain why instead of deviating silently.
- If the brand guidelines change, update `BRAND_GUIDELINES.md` (and the tokens in `app/globals.css`) rather than adding rules here.
