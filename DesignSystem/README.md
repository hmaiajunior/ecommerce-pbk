# Playbekids Design System

## About
**Playbekids** (`@playbekids` / `@playbekids2` on Instagram) is a Brazilian children's fashion brand specialising in **boys' clothing** (moda infantil masculina), operating in both **wholesale (atacado)** and **retail (varejo)**. The brand targets parents and resellers looking for colourful, playful, high-quality kids' apparel.

### Sources provided
- `uploads/logo-1776809260282.jpeg` — Brand logo (Instagram profile screenshot)
- `uploads/post-feed.html` — Social media post template (1080×1080 Instagram square)
- `uploads/post-feed_002.html` — Updated version of same post template

_No website codebase or Figma link was provided; design system is inferred from the logo and social post templates._

---

## CONTENT FUNDAMENTALS

### Language & Tone
- **Language:** Brazilian Portuguese (pt-BR)
- **Voice:** Warm, friendly, direct — talks to parents as trusted friends
- **Pronouns:** "Nós/nossa" (we/our) when referring to the brand; "você" implied when addressing customers
- **Casing:** Sentence case for most copy; ALL CAPS used sparingly for labels (e.g. `CONTA ANTIGA`)
- **Punctuation:** Exclamations used freely to convey warmth and excitement
- **Emoji:** Used contextually in social posts as emotional punctuation — not overdone. Common: 💛 ⭐ ⚠️ 🌟
- **Vibe:** Joyful, trustworthy, approachable. The brand feels like a fun aunt who knows kids' fashion.

### Example copy (from posts)
- "Estamos trabalhando para recuperar a conta. Enquanto isso, nos siga na nossa conta reserva!"
- "Obrigada pela compreensão! 💛"
- "Aviso importante"

---

## VISUAL FOUNDATIONS

### Color Palette
The palette is bold, warm and playful — inspired by children's toys and sunshine.

| Token | Hex | Role |
|---|---|---|
| `--coral` | `#FF6B4A` | Primary action / highlights |
| `--coral-dark` | `#E05A38` | Headings accent / pressed state |
| `--yellow` | `#FFD340` | Decorative / arrows / joy |
| `--teal` | `#4EC9C0` | Secondary CTA / success chips |
| `--blue` | `#3D7EBF` | Footer text / links |
| `--blue-mid` | `#4A90D9` | Decorative dots |
| `--brown-dark` | `#3D2B1F` | Primary text |
| `--brown-mid` | `#6B4F42` | Body / secondary text |
| `--brown-muted` | `#9A7B70` | Labels / meta |
| `--cream` | `#fff9f0` | Page background |
| `--blush` | `#f5ede8` | Card backgrounds / logo circle |
| `--warm-nude` | `#EDE0DC` | Inactive / old chips |

### Typography
- **Primary font:** Nunito (Google Fonts) — weight range 600–900
- **Display:** Nunito 900 — large headlines, product names
- **Body:** Nunito 600 — warm and readable
- **Labels:** Nunito 700, uppercase, tracked — category tags
- **Min size:** 26px for social posts (designed at 1080px); ~14px for web

### Backgrounds
- Warm cream `#fff9f0` is the default background
- Large blurred colour blobs (filter: blur 60–80px) using coral, yellow, teal — low opacity (10–15%) — create soft, dreamy depth
- Small decorative dots (4–18px circles) scattered at low opacity reinforce the playful, confetti-like aesthetic
- No full-bleed photography visible in provided assets — logo circle uses `#f5ede8` blush background

### Spacing & Layout
- Generous whitespace; content centred
- Pill/capsule shapes dominate (border-radius: 100px) for chips and tags
- Logo displayed in a circle with subtle `box-shadow: 0 6px 28px rgba(0,0,0,0.13)`

### Borders & Radius
- **Pills:** `border-radius: 100px` — tags, chips, CTAs
- **Circles:** `border-radius: 50%` — logo, dots
- **Cards:** inferred `border-radius: 16–24px` for the website context

### Shadows
- Logo circle: `box-shadow: 0 6px 28px rgba(0,0,0,0.13)` — soft, diffuse
- Teal chip: `box-shadow: 0 4px 18px rgba(78,201,192,0.35)` — coloured shadow matching chip

### Animation
- No animation code present in provided assets
- Brand feel suggests: soft, bouncy/spring transitions; fade-ins; no harsh snaps

### Hover / Press States
- Inferred: darken coral on hover; slight scale-down on press (0.96); opacity shift on muted elements

### Iconography
- Emoji used as icons in social posts (⚠️ 💛 🌟)
- No custom icon font or SVG set provided

### Imagery
- Warm, colourful photography expected (kids' clothing)
- Colour vibe: warm, saturated, natural light — matching the coral/yellow palette

---

## ICONOGRAPHY

- **Approach:** Emoji-first in social content; no custom icon font was provided
- **Emoji used:** ⚠️ 💛 🌟 → — used as functional icons in posts
- **Logo:** Circular crop, `object-fit: cover`, centred slightly above middle (`object-position: 50% 38%`)
- **Logo file:** `assets/logo.jpeg`
- No SVG icon set, PNG icon sheet, or custom icon font was found in the provided assets

---

## FILES INDEX

```
README.md                        ← this file
SKILL.md                         ← agent skill definition
colors_and_type.css              ← CSS custom properties (colors + typography)
assets/
  logo.jpeg                      ← Brand logo (from Instagram profile)
preview/
  colors-brand.html              ← Brand colour swatches
  colors-semantic.html           ← Semantic colour usage
  type-scale.html                ← Typography scale
  type-specimens.html            ← Type specimens (Nunito weights)
  spacing-radius.html            ← Border radii + shadow tokens
  components-chips.html          ← Chip / tag components
  components-buttons.html        ← Button states
  components-cards.html          ← Card component
ui_kits/
  website/
    README.md
    index.html                   ← Website UI kit (homepage + shop)
    Header.jsx
    Hero.jsx
    ProductCard.jsx
    Footer.jsx
```
