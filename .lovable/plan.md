

# Plan: Fix Invisible Link Text in Article Body (Dark Mode)

## What's actually happening

The "gap" in your screenshot isn't missing text. The phrase **"lightweight backpack or small suitcase"** *is* a hyperlink, but it's rendering in a dark navy color against the dark card background, so it looks like an empty hole in the paragraph.

Cause: the article body in `CompassArticle.tsx` is wrapped in `<div className="prose prose-lg">`. The `@tailwindcss/typography` plugin's `.prose a` selector sets link color via its own CSS variable (`--tw-prose-links`, which defaults to a dark blue tuned for white pages). That selector wins over the inline `text-primary` class on each `<a>` tag, and because we never apply `prose-invert` in dark mode, links stay dark-on-dark.

This affects **every existing article** uniformly. Once we fix the CSS, every old article reads correctly with no data migration.

## Files to change

| File | Change |
|---|---|
| `src/pages/CompassArticle.tsx` | Add `dark:prose-invert` to the body wrapper so prose flips its link/text variables in dark mode. Also drop the redundant `prose` wrapper restrictions that cause spacing oddities, and tighten the inline `<a>` className to `text-primary hover:text-primary/80 underline underline-offset-2 font-medium` so the link is bright and obviously clickable in BOTH modes. |
| `src/index.css` | Add a small global rule scoping `.prose a, .dark .prose a` to inherit our `--primary` token (HSL var) instead of typography's default. This is a belt-and-braces guarantee even if a future component forgets `dark:prose-invert`. Also add `.prose :where(p):not(:where([class~="not-prose"] *))` to ensure paragraph spacing is consistent and there are no unexpectedly large gaps between blocks. |

## Content Studio side (preventative)

The generator is already producing valid content; the bug is purely visual. But to keep the bar high we'll add two small guards in `supabase/functions/generate-blog-post/index.ts`:

1. **Strip empty/whitespace-only blocks** after generation. A `text` block whose `value.trim()` is empty would render as a blank paragraph and look like a gap. Filter them out before returning.
2. **Reject markdown links with empty anchor text** (e.g. `[](url)`) by replacing them with a sensible fallback ("learn more"). Same fix mirrored in `format-blog-post` and `edit-blog-post` so all three stay in sync.

These two guards make sure no future article ever ships with a literally empty paragraph or invisible/empty link.

## Result

- Every existing article (including the one in your screenshot) renders the link as a bright, underlined, obviously clickable phrase in both light and dark mode. No data changes needed.
- New articles generated from Content Studio can't introduce blank paragraphs or empty-anchor links.

## Out of scope

- Changing the link color brand token.
- Re-running or regenerating any existing article.
- Touching the rich-content schema or DB rows.

