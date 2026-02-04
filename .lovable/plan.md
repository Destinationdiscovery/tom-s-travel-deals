

## Set New TR.ca Logo as Favicon

### What
Replace the current globe favicon with the TR.ca palm tree logo you just uploaded.

### How

1. **Copy the uploaded PNG** to the public folder as `favicon.png`
2. **No HTML changes needed** - the `index.html` already references `/favicon.png`:
   ```html
   <link rel="icon" type="image/png" href="/favicon.png" />
   ```

### Files to Update

| File | Action |
|------|--------|
| `public/favicon.png` | Replace with new TR.ca logo |

### Result
- Browser tabs will show the TR.ca palm tree logo instead of the globe
- The logo is square-ish and will display clearly at small sizes
- No code changes required - just a file swap

