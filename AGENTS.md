<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Brand guidelines (required for every visual change)

Check and follow these rules for **every** change that affects how the site looks: new pages, new components, and edits to existing components, styles, images or copy. If a change can't follow them, say so explicitly instead of silently deviating.

Source: *Alpha Male Brand Guidelines* PDF (kept outside this repo). It covers only the logo, colour palette and typography, summarised below. It has **no** rules on imagery, layout, tone of voice or copy, so don't present anything as a brand rule for those.

### Logo
- The logo is a white/silver lion head inside a dark-navy "A"-shaped triangle, with the **ALPHA MALE** wordmark underneath and the tagline **DRIVE • STAMINA • ENERGY**.
- Use the supplied logo artwork (e.g. `public/images/logo.png`); don't redraw or rebuild it in code.
- Keep its proportions: triangle 86.95 mm wide × 64.58 mm high, wordmark 51.22 mm wide. Don't stretch, squash or crop it.
- Standard square export sizes: **500×500**, **300×300** and **150×150 px**. Pick the nearest size for the slot rather than upscaling a smaller one.

### Colour palette (primary colours)
| Name | Hex | RGB |
|---|---|---|
| Dark navy blue | `#212E49` | 33, 46, 73 |
| White | `#FEFEFE` | 254, 254, 254 |
| Palladium | `#B0B1B0` | 176, 177, 176 |
| Pale light gray | `#E9E9EA` | 233, 233, 234 |
| Olympus white | `#D5D5D7` | 213, 213, 215 |
| Medium Gray | `#B5B5B5` | 181, 181, 181 |

- Build new UI from these colours. Dark navy is the brand colour; the whites and greys are its supporting neutrals.
- Existing components also use other shades (e.g. `#07162f` / `#071630` navy, `#161f33` page background, green `#176348`). Treat the table above as the reference when adding or changing styles, and don't introduce further off-palette colours without a stated reason. These guidelines don't require recolouring untouched code.

### Typography
- **Cinzel** (shown in SemiBold): the brand display typeface, for headings and titles. In this project it is the `font-heading` token.
- **Montserrat**: the supporting typeface for body and small text. In this project it is the `font-body` token.
- Use these two typefaces only; don't add other font families. Load fonts through the existing setup in `app/layout.tsx` and the `@theme` tokens in `app/globals.css`, not ad-hoc imports.
