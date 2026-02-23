

# Make News & Advisory Summaries Clickable

## What Changes

Add source URLs to news articles and advisory entries so users can click through to read the full story or advisory.

## Changes Required

### 1. Update edge function prompt to request URLs (`supabase/functions/travel-intel/index.ts`)

**News prompt**: Add a `"url"` field to the article schema so Perplexity returns the source link for each article.

**Advisories prompt**: Add a `"url"` field to each advisory object so Perplexity returns the official advisory page link.

### 2. Update TypeScript types (`src/hooks/useTravelIntel.ts`)

Add an optional `url?: string` field to both the `NewsArticle` and `Advisory` interfaces.

### 3. Make titles/summaries clickable in the UI (`src/components/intel/IntelResults.tsx`)

**NewsResult**: Wrap each article's title in an `<a>` tag linking to `article.url` (when available). Add external link icon. Falls back to plain text if no URL.

**AdvisoriesResult**: Wrap each advisory's summary in an `<a>` tag linking to `adv.url` (when available). Same fallback behavior.

### Note on cached data

Existing cached results won't have URLs since they were generated before this change. The UI gracefully falls back to non-clickable text when `url` is missing. Cache entries expire after 7 days, so fresh results will include URLs automatically.

