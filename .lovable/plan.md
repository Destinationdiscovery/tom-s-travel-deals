# Plan: Restyle Hero to match reference

Update `src/components/HeroSection.tsx` text + structure to match the reference layout. Keep the existing rotating-image background and current color theme (no green takeover, keep dark gradient overlay + secondary accent for the Go button and pills).

## Changes

1. **Eyebrow** — small uppercase tracked label above H1:
   `PLAN SMARTER. TRAVEL BETTER.` in `text-secondary text-xs tracking-[0.2em] uppercase`.

2. **H1** — replace current headline with:
   `What do you need to know before your next trip?`
   Same display font, same size scale.

3. **Subcopy** — single line:
   `Hotel reviews, itineraries, visa rules, packing lists, safety scores and more. Ask anything.`
   Drop the second "By Travel Experts" microcopy line.

4. **Search bar**
   - Placeholder: `Ask a travel question or search any hotel, destination or topic...`
   - Button label: `Go` (instead of `Search`).
   - Keep existing submit handler, suggestions dropdown, and disabled-when-too-short logic.
   - Drop the "Search any hotel..." helper line below.

5. **"For example:" pills row** (new) — under the search:
   - `For example:` label in muted white, then 5 clickable pills:
     - Do I need a visa for Japan as a Canadian?
     - What to pack for Bali in October
     - Is travel insurance worth it for Mexico?
     - Best time to visit Italy, honest answer
     - Is Barcelo Maya worth the price?
   - Each pill calls the same `onSearch(text)` so the intent router routes to the right tool (visa, gear, intel, best-time, review).
   - Style: rounded-full, `bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-3 py-1.5`. Wraps to multiple lines on narrow viewports.
   - Note: replacing the em-dash in the Italy example with a comma per project punctuation rule.

6. **"Pulls from:" sources row** (new) — under the example pills:
   - `Pulls from:` muted label + non-interactive pills: `TripAdvisor`, `Google Reviews`, `Booking.com`, `Reddit`, `Expedia + 6 more`.
   - Same pill style but `cursor-default`, slightly smaller.

7. **Height bump** — increase the section min height slightly (`md:h-[560px]`) so the new pill rows do not crowd the search bar on desktop. Mobile keeps a comfortable scroll.

8. **Install App link** — keep as-is (mobile only).

## Files touched

- `src/components/HeroSection.tsx` only.

## Out of scope

- No color theme changes (reference is green; we keep current dark hero with secondary accent).
- No changes to background slideshow images.
- No changes to the search intent router (already shipped, pills will route through it).
