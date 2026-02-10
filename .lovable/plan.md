

## Visual Polish: Hero Text, Header Branding, and Font Sizes

### 1. Remove periods from hero headline

Change `REVIEW.` `GO.` to `REVIEW` `GO` (no periods). Cleaner, more modern.

**File:** `src/components/HeroSection.tsx` (lines 63-65)

### 2. Remove "Contact" from hero nav links

The Contact link is still in the hero nav array (line 13) despite being removed from header/footer per branding guidelines. Remove it.

**File:** `src/components/HeroSection.tsx` (line 13)

### 3. Style header brand name to match hero

Currently `text-xl font-bold text-foreground`. Change to use the sky-300 / white split like the hero:
- "Review" in sky-300
- "ThenGo" in foreground
- Bump to `text-2xl`
- Keep subtitle at `text-xs` — it's a tagline, not a headline

**File:** `src/components/Header.tsx` (line 27)

### 4. Increase text sizes throughout

| Element | Current | New |
|---|---|---|
| **Header nav links** (desktop) | `text-sm` | `text-base` |
| **Header nav links** (mobile) | `text-sm` | `text-base` |
| **Hero tagline** ("Know what to expect...") | `text-lg md:text-xl` | `text-xl md:text-2xl` |
| **Hero nav links** (bottom of hero) | `text-sm` | `text-base` |
| **Hero search placeholder** | `text-sm` | `text-base` |
| **Footer body text** | `text-sm` | `text-base` |
| **Footer nav links** | `text-sm` | `text-base` |
| **Footer bottom row** | `text-sm` | `text-sm` (keep — this is fine small) |

**Files:** `src/components/Header.tsx`, `src/components/HeroSection.tsx`, `src/components/Footer.tsx`

### 5. Footer brand name — match header style

Apply the same sky-300/foreground split and size bump to the footer brand name for consistency.

**File:** `src/components/Footer.tsx` (line 16)

### Files to change

| File | Changes |
|---|---|
| `src/components/HeroSection.tsx` | Remove periods from headline, remove Contact link, bump tagline + nav + search text sizes |
| `src/components/Header.tsx` | Style brand name with sky-300 split, bump nav link sizes to `text-base` |
| `src/components/Footer.tsx` | Style brand name with sky-300 split, bump body/link text to `text-base` |

