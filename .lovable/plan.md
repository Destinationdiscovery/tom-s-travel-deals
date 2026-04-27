## Plan to fix the currency converter

The bug is confirmed: `cad to euro` is being interpreted as `CAD` because the backend currently only returns a USD-based target currency. It does not properly model a source currency and destination currency pair.

### What I will change

1. **Update the currency backend function**
   - Parse both currencies from user input, including:
     - `cad to euro`
     - `CAD to EUR`
     - `100 euros in yen`
     - `GBP in CAD`
     - country phrases like `Canada to Europe`
   - Treat the first detected currency as the source and the last detected currency as the target.
   - Default to `USD -> target` only when the user provides one currency or country.

2. **Return true conversion data**
   - Instead of always fetching `latest/USD` and showing `USD -> target`, calculate the cross-rate correctly:

```text
source -> target = target_rate_against_USD / source_rate_against_USD
```

   - For `cad to euro`, the result will show `CAD -> EUR`, not `USD -> CAD`.

3. **Update the Currency page UI**
   - Display the actual source and target codes in the main card title.
   - Show `1 CAD = X EUR` and `1 EUR = X CAD` when the query is `cad to euro`.
   - Update the conversion table so amounts are labeled in the source currency, not always USD.

4. **Improve examples and compatibility**
   - Keep existing single-destination behavior working for searches like `Mexico`, `Japan`, `EUR`, and `THB`.
   - Keep AEO example cards working.
   - Preserve existing travel money tips using the target currency.

5. **Test after implementation**
   - Test the backend function with:
     - `cad to euro`
     - `CAD to EUR`
     - `USD to MXN`
     - `100 euros in yen`
     - `Mexico`
   - Verify the page displays the correct direction and labels.

### Technical notes

- Files to update:
  - `supabase/functions/currency-tracker/index.ts`
  - `src/pages/Currency.tsx`
- No database changes are needed.
- No new secrets are needed.