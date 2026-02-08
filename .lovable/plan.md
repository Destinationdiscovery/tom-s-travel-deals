

## Update Affiliate Links with CJ Tracking

### What Changes

1. **Remove Hotels.com** entirely from the affiliate links until tracking is set up
2. **Wire up CJ tracking** for Expedia and VRBO so clicks are properly tracked
3. **Pre-populate search** so clicking "Expedia" for a "Hilton Niagara" review takes the user directly to that property's search results on Expedia
4. **Rename "Expedia.ca" to "Expedia"**

### How the Tracking URLs Work

Each link will route through CJ's tracking domain, then redirect the user to the affiliate site with the property name already filled in as a search query.

For example, if the property is "Hilton Niagara Falls":

- **Expedia**: `https://www.anrdoezrs.net/click-101645364-15575474?url=https://www.expedia.ca/Hotel-Search?destination=Hilton+Niagara+Falls`
- **VRBO**: `https://www.jdoqocy.com/click-101645364-10697641?url=https://www.vrbo.com/search?destination=Hilton+Niagara+Falls`

### File Changes

| File | What Changes |
|------|-------------|
| `src/components/AffiliateLinks.tsx` | Remove Hotels.com entry. Update Expedia name to "Expedia". Update both Expedia and VRBO `buildUrl` functions to wrap destination URLs with CJ tracking links using the provided PIDs and AIDs. |

### Technical Details

The `affiliates` array will go from three entries to two. Each entry's `buildUrl` function will:

1. Build the destination URL (e.g., `https://www.expedia.ca/Hotel-Search?destination=Hilton+Niagara+Falls`)
2. Wrap it in the CJ tracking URL with `encodeURIComponent`

Updated affiliate config:

```text
Expedia:
  CJ domain: anrdoezrs.net
  PID: 101645364
  AID: 15575474
  Destination pattern: https://www.expedia.ca/Hotel-Search?destination={query}

VRBO:
  CJ domain: jdoqocy.com
  PID: 101645364
  AID: 10697641
  Destination pattern: https://www.vrbo.com/search?destination={query}
```

The button colors and styling remain unchanged. The disclaimer text at the bottom stays as-is.

