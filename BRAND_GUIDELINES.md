# Alpha Male Brand Guidelines

The single reference for how the Alpha Male website looks. **Read this before changing or adding any UI** (new pages, components, styles, images or copy) and follow it. If a change can't follow these rules, say so explicitly and explain why instead of deviating silently.

Source: the official *Alpha Male Brand Guidelines* PDF (kept outside this repo). The PDF covers only the **logo, colour palette and typography**. It has no rules on imagery, layout, spacing, tone of voice or copy, so nothing on those topics should be presented as a brand rule. The sections marked *Implementation* describe how the guidelines are applied in this codebase.

---

## 1. Logo

- The logo is a white/silver lion head inside a dark-navy "A"-shaped triangle, with the **ALPHA MALE** wordmark underneath and the tagline **DRIVE • STAMINA • ENERGY**.
- Always use the supplied artwork (`public/images/logo.png`, `public/images/logo2.webp`). Never redraw, rebuild or recolour it in code.
- Keep its proportions: triangle **86.95 mm wide × 64.58 mm high**, wordmark **51.22 mm wide**. Never stretch, squash or crop it.
- Standard square export sizes: **500×500**, **300×300** and **150×150 px**. Use the nearest size for the slot; don't upscale a smaller one.

## 2. Colour palette

| Name | Hex | RGB | Token / utility |
|---|---|---|---|
| Dark navy blue (primary brand colour) | `#212E49` | 33, 46, 73 | `--color-brand-navy` / `brand-navy` |
| White | `#FEFEFE` | 254, 254, 254 | `--color-white` / `white` |
| Palladium | `#B0B1B0` | 176, 177, 176 | `--color-palladium` / `palladium` |
| Pale light gray | `#E9E9EA` | 233, 233, 234 | `--color-pale-gray` / `pale-gray` |
| Olympus white | `#D5D5D7` | 213, 213, 215 | `--color-olympus` / `olympus` |
| Medium gray | `#B5B5B5` | 181, 181, 181 | `--color-medium-gray` / `medium-gray` |

- Dark navy is the brand colour. The whites and greys are its supporting neutrals.
- Build all UI from these colours.

### Implementation: how to use colours

- **Use the tokens, never hex values.** Write `bg-brand-navy`, `text-palladium`, `border-olympus`, `text-brand-navy/70`, and so on. In inline styles or JS (e.g. react-select styles) use `var(--color-brand-navy)`. The only place brand hex values are defined is the `@theme` block in `app/globals.css`.
- `white` is overridden to `#FEFEFE`, so `bg-white` / `text-white` already follow the guideline.
- **Primary text** on light backgrounds: `text-brand-navy`.
- **Secondary / muted text on light backgrounds:** `text-brand-navy-muted` (navy at 75%). Don't go below 75%: 70% fails contrast on `#D5D5D7`.
- **Text on dark (navy) backgrounds:** `text-white` or `text-olympus` for main text, `text-palladium` / `text-medium-gray` for muted text.
- **Section and card backgrounds:** `bg-white`, `bg-pale-gray` or `bg-olympus`. Don't add beige, mint or blue-tinted backgrounds.
- Don't introduce new off-palette colours. If one seems necessary, flag it for the brand owner instead.

### Accent colours: pending brand-owner decision

These colours are **not** in the guidelines. They exist in the current site and have been moved into tokens so the brand owner can decide whether to add them to the guidelines or remove them. Keep using the existing tokens where they already appear, but **don't spread them into new UI** without approval.

| Token | Hex | Current use |
|---|---|---|
| `accent-gold` | `#D6B47E` | Featured products, trust section |
| `accent-amber` | `#F0C65B` | Best-seller badge |
| `accent-amber-dark` | `#D79B2B` | Product comparison, campaign-page review stars (product-page stars use `brand-navy`) |
| `success-green` | `#176348` | Discounts/savings, success states, checkout, account pages |
| `accent-green-deep` | `#103E3A` | Product claims |
| `accent-green-moss` | `#315B3E` | Product ratings |
| `accent-lime` | `#C5DF50` | Product highlights, product claims |

Other legacy colours still in the code and not yet tokenised: `#161F33` (dark page background), `#19243B` (dark card / darker navy tint), `#14284D` (navy hover), `#E9B949` and `#E7C49C` (golds), and some beige border shades. Don't reuse them in new UI.

## 3. Typography

| Role | Typeface | Weight | Utility |
|---|---|---|---|
| Display / headings | **Cinzel** | SemiBold (600) | `font-heading` (also `font-serif`) |
| Body, UI and small text | **Montserrat** | 400 body; 500–600 for emphasis/UI | `font-body` |

- Use these two typefaces only. Don't add other font families.
- Fonts are loaded once through `next/font/google` in `app/layout.tsx` and exposed by the `@theme` tokens in `app/globals.css`. Don't add ad-hoc font imports or `<link>` tags.

### Implementation: heading rule (site-wide)

| Element | Font | Weight |
|---|---|---|
| `h1`, `h2` | Cinzel (`font-heading`) | 600 (`font-semibold`) |
| `h3`, `h4`, `h5`, `h6` | Montserrat (`font-body`) | 600 (`font-semibold`) |

- A base rule in `app/globals.css` applies this automatically, so a plain `<h2>` is already correct.
- Don't put `font-bold`, `font-medium`, `font-normal` or responsive weight variants (e.g. `sm:font-bold`) on headings, and don't give an `h3` Cinzel or an `h2` Montserrat.
- Choose the heading level for meaning, then let the rule decide the font. Card titles and small section titles are usually `h3`.
- `font-serif` maps to Cinzel, so it can never fall back to the browser's `ui-serif`.

## 4. Accessibility (contrast)

Every text/background pair must meet **WCAG AA**: 4.5:1 for body text, 3:1 for large text (≥ 24 px, or ≥ 18.7 px bold). If a guideline colour fails on a given background, flag it rather than silently switching to a non-brand colour.

Checked pairs:

| Text | Background | Ratio | Result |
|---|---|---|---|
| `brand-navy` | `white` | 13.4:1 | Pass |
| `brand-navy` | `pale-gray` | 11.2:1 | Pass |
| `brand-navy` | `olympus` | 9.2:1 | Pass |
| `brand-navy-muted` (75%) | `white` / `pale-gray` / `olympus` | 6.1 / 5.5 / 4.9:1 | Pass |
| `white` | `brand-navy` | 13.4:1 | Pass |
| `olympus` | `brand-navy` | 9.2:1 | Pass |
| `palladium` | `brand-navy` | 6.3:1 | Pass |
| `success-green` | `white` / `pale-gray` / `olympus` | 7.1 / 5.9 / 4.9:1 | Pass |
| `palladium` | `white` | 2.1:1 | **Fail**: never use palladium text on light backgrounds |
| `palladium` | `pale-gray` | 1.8:1 | **Fail** |

## 5. Reference implementation

- The **age-verification modal** (`Components/user/AgeVerificationPopup.tsx`) already matches these guidelines and is the reference for correct usage. Keep it as it is.
- The **404 page** (`app/not-found.tsx`) shows the brand on a dark background: navy background, logo, Cinzel heading, Montserrat body, palladium muted text.

## 6. Checklist before shipping a UI change

- [ ] Colours come from tokens (`brand-navy`, `palladium`, `pale-gray`, `olympus`, `medium-gray`, `white`). No new hex values in components.
- [ ] No new off-palette colours, and no new use of the pending accent colours without approval.
- [ ] h1/h2 = Cinzel 600, h3 and below = Montserrat 600, with no extra weight classes on headings.
- [ ] Only Cinzel and Montserrat, loaded through the existing setup.
- [ ] Logo uses the supplied artwork at its original proportions.
- [ ] Every text/background pair meets WCAG AA.
- [ ] Any deviation is called out explicitly, with the reason.
