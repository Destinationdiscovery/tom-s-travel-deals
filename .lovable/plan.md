

## Replace Citations with an Interactive Map

### What Changes

The "Sources" list of citation links at the bottom of each AI review will be removed and replaced with an embedded Google Map showing a red pin at the destination's location. This uses the existing review data -- no new API calls or keys needed.

### How It Works

The review already contains `propertyName` (e.g., "Bellagio") and `location` (e.g., "Las Vegas, NV, USA") from Perplexity. We combine these into a search query and embed a Google Maps iframe that automatically places a red pin at the right spot.

No additional API key is needed -- the Google Maps embed iframe works without a key (same method as the "Share > Embed a map" feature on Google Maps).

### Changes

| File | What Changes |
|------|-------------|
| `src/components/AIReviewResult.tsx` | Remove the Citations section (lines 171-189). Add a new "Location" map card in the sidebar, below the Ratings Breakdown card, with an embedded Google Maps iframe showing a red pin at the destination. |

### Details

**Map Embed**: A rounded card in the sidebar with a heading "Location" and an interactive Google Maps iframe. The iframe uses:
```
https://maps.google.com/maps?q={propertyName}+{location}&z=13&output=embed
```

**Placement**: Below the "Rating Breakdown" card in the right sidebar -- keeps the main content area clean and puts the map where it's contextually useful alongside ratings and "Best For" tags.

**Styling**: Rounded corners, shadow, same card style as the ratings breakdown. The map will be roughly 250px tall with a subtle border.

**Fallback**: If neither `propertyName` nor `location` exist (unlikely), the map card simply won't render.
