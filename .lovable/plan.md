

## Geo-Targeted Affiliate Links + Hotels.com

### What Changes

The booking buttons will automatically detect each visitor's country and send them to the correct regional affiliate link, so a Canadian visitor goes to Expedia Canada, a UK visitor to Expedia UK, and so on. Hotels.com will also be added as a third booking button.

### How Country Detection Works

The visitor's country is detected instantly using their browser's timezone setting -- no extra loading or backend calls needed. For example:
- Timezone `America/Toronto` or `America/Vancouver` = Canada
- Timezone `Europe/London` = United Kingdom
- Everything else = United States (default)

### Link Mapping

| Country | Expedia Link | Hotels.com Link |
|---------|-------------|-----------------|
| Canada | `expedia.com/affiliates/expedia-home.2FNlhXx` | `hotels.com/affiliates/hotelscom-home.JXhkPRM` |
| USA | `expedia.com/affiliates/expedia-home.Ee1VYBn` | `hotels.com/affiliates/hotelscom-home.oSbwDt4` |
| UK | `expedia.com/affiliates/expedia-home.Ut28wxn` | `hotels.com/affiliates/hotelscom-home.3by33jZ` |

VRBO stays as-is with the single existing link (unless you have country-specific VRBO links to add later).

### Button Layout

Three buttons will appear: **Expedia**, **Hotels.com**, and **VRBO** -- each styled with their brand colors.

### Technical Details

**`src/components/AffiliateLinks.tsx`** -- full rewrite of this small component:

1. Add a `detectCountry()` helper that reads `Intl.DateTimeFormat().resolvedOptions().timeZone` and maps Canadian timezones (e.g., `America/Toronto`, `America/Edmonton`, `America/Vancouver`, etc.) to `"CA"`, British timezones (`Europe/London`) to `"GB"`, and everything else to `"US"`.

2. Replace the static `affiliates` array with a function that returns the correct URLs based on detected country:
   - Expedia: 3 regional CJ deep links
   - Hotels.com (new): 3 regional CJ deep links with a red/maroon brand color
   - VRBO: keeps the existing single CJ tracking link

3. The component uses `useMemo` to detect country once and build the link list, so there's zero performance cost.

No changes needed to `AIReviewResult.tsx` since the component interface stays the same (no props).

